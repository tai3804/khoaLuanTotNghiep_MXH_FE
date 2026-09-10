import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ChatMessagePayload {
  messageId?: string;
  conversationId: string;
  senderId: string;
  content: string;
  type?: string;
  mediaUrl?: string | null;
  createdAt?: string;
}

class WebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageCallbacks: Map<string, Set<(msg: ChatMessagePayload) => void>> = new Map();
  private connectionPromise: Promise<boolean> | null = null;

  constructor() {
    // Lazy initialized when first needed
  }

  public isConnected(): boolean {
    return this.connected && this.client !== null && this.client.active;
  }

  public async connect(): Promise<boolean> {
    if (this.isConnected()) return true;
    if (this.connectionPromise) return this.connectionPromise;

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[WebSocket] Cannot connect: No auth token found.');
      return false;
    }

    this.connectionPromise = new Promise<boolean>((resolve) => {
      // Try direct chat-service port 8087 first, fallback to gateway 8080
      const wsUrl = 'http://localhost:8087/ws-chat';

      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
          access_token: token,
        },
        debug: (str) => {
          if (import.meta.env.DEV) {
            // Uncomment for verbose logging
            // console.log('[STOMP Debug]:', str);
          }
        },
        reconnectDelay: 4000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          console.log('[WebSocket] Connected successfully to chat broker via STOMP.');
          this.connected = true;
          this.connectionPromise = null;

          // Re-subscribe any pending topic subscriptions
          this.resubscribeAll();
          resolve(true);
        },
        onStompError: (frame) => {
          console.error('[WebSocket] STOMP error frame:', frame.headers['message'], frame.body);
          this.connected = false;
          this.connectionPromise = null;
          resolve(false);
        },
        onWebSocketClose: () => {
          this.connected = false;
        },
        onDisconnect: () => {
          this.connected = false;
          this.connectionPromise = null;
        },
      });

      this.client.activate();

      // Timeout safety after 8 seconds
      setTimeout(() => {
        if (!this.connected) {
          this.connectionPromise = null;
          resolve(false);
        }
      }, 8000);
    });

    return this.connectionPromise;
  }

  public async subscribeToConversation(
    conversationId: string,
    callback: (message: ChatMessagePayload) => void
  ): Promise<() => void> {
    if (!conversationId) return () => {};

    // Register callback
    if (!this.messageCallbacks.has(conversationId)) {
      this.messageCallbacks.set(conversationId, new Set());
    }
    this.messageCallbacks.get(conversationId)!.add(callback);

    // Ensure connection is active
    await this.connect();

    // Subscribe to topic if not already subscribed
    const topic = `/topic/conversations/${conversationId}`;
    if (!this.subscriptions.has(conversationId) && this.client && this.client.connected) {
      this.createSubscription(conversationId, topic);
    }

    // Return unsubscribe cleanup function
    return () => {
      const callbacks = this.messageCallbacks.get(conversationId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.messageCallbacks.delete(conversationId);
          const sub = this.subscriptions.get(conversationId);
          if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(conversationId);
          }
        }
      }
    };
  }

  private createSubscription(conversationId: string, topic: string) {
    if (!this.client || !this.client.connected) return;

    try {
      const sub = this.client.subscribe(topic, (frame: IMessage) => {
        try {
          const payload: ChatMessagePayload = JSON.parse(frame.body);
          const callbacks = this.messageCallbacks.get(conversationId);
          if (callbacks) {
            callbacks.forEach((cb) => cb(payload));
          }
        } catch (e) {
          console.error('[WebSocket] Error parsing incoming chat message frame:', e);
        }
      });
      this.subscriptions.set(conversationId, sub);
    } catch (e) {
      console.error('[WebSocket] Failed to subscribe to topic:', topic, e);
    }
  }

  private resubscribeAll() {
    this.subscriptions.clear();
    for (const [conversationId] of this.messageCallbacks.entries()) {
      const topic = `/topic/conversations/${conversationId}`;
      this.createSubscription(conversationId, topic);
    }
  }

  public sendMessage(conversationId: string, content: string): boolean {
    if (!this.isConnected() || !this.client) {
      return false;
    }

    try {
      this.client.publish({
        destination: `/app/chat.sendMessage/${conversationId}`,
        body: JSON.stringify({
          content,
          type: 'TEXT',
        }),
      });
      return true;
    } catch (e) {
      console.error('[WebSocket] Error publishing chat message:', e);
      return false;
    }
  }

  public disconnect(): void {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.messageCallbacks.clear();
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.connectionPromise = null;
    }
  }
}

export const websocketService = new WebSocketService();
