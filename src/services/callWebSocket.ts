import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WebRtcSignal } from './callService';
import { api } from './axiosClient';
import { store } from '../store/store';
import { setAccessToken } from '../store/slices/authSlice';

type SignalCallback = (signal: WebRtcSignal) => void;

class CallWebSocketService {
  private client: Client | null = null;
  private connected: boolean = false;
  private currentUserId: string | null = null;
  private userQueueSub: StompSubscription | null = null;
  private userTopicSub: StompSubscription | null = null;
  private roomSubs: Map<string, StompSubscription> = new Map();
  private signalCallbacks: Set<SignalCallback> = new Set();
  private connectionPromise: Promise<boolean> | null = null;
  private recentSignalKeys: Map<string, number> = new Map();

  public isConnected(): boolean {
    // `active` only means that STOMP is trying to connect. Subscribing while
    // it is active but before the underlying socket is connected throws
    // "There is no underlying STOMP connection".
    return this.connected && this.client !== null && this.client.active && this.client.connected;
  }

  public async connect(userId?: string): Promise<boolean> {
    if (userId) {
      this.currentUserId = userId;
      try { localStorage.setItem('currentUserId', userId); } catch {}
    } else if (!this.currentUserId) {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          this.currentUserId = u.id || u.userId || null;
        }
      } catch {}
    }

    if (this.isConnected()) {
      if (this.currentUserId && (!this.userQueueSub || !this.userTopicSub)) {
        this.subscribeUserChannels(this.currentUserId);
      }
      return true;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Redux is intentionally memory-only, so it is empty after a hard reload.
    // Refresh the HttpOnly-cookie session before opening STOMP; otherwise a
    // user who is visibly logged in cannot start or receive any call.
    let token = store.getState().auth.accessToken || localStorage.getItem('token');
    if (!token) {
      try {
        const response = await api.post('/auth/refresh', {}, {
          headers: {
            'X-Client-Type': 'WEB',
            'X-Device-Fingerprint': localStorage.getItem('deviceFingerprint') || '',
          },
        });
        const data = response.data?.data || response.data?.result || response.data;
        token = data?.accessToken || data?.token || null;
        if (token) store.dispatch(setAccessToken(token));
      } catch (error) {
        console.warn('[CallWS] Session refresh failed before WebSocket connection', error);
      }
    }
    if (!token) {
      console.warn('[CallWS] Cannot connect: No token available');
      return false;
    }

    this.connectionPromise = new Promise<boolean>((resolve) => {
      // Connect to direct call-service (port 8086) or configured URL
      const wsUrl = import.meta.env.VITE_CALL_WS_URL || 'http://localhost:8086/ws-call';

      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
          access_token: token,
        },
        reconnectDelay: 4000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        debug: (str) => {
          if (import.meta.env.DEV) {
            // console.log('[CallWS Debug]:', str);
          }
        },
        onConnect: () => {
          console.log('[CallWS] Connected successfully to Call WebSocket broker.');
          this.connected = true;
          this.connectionPromise = null;

          let activeUserId = this.currentUserId;
          if (!activeUserId) {
            try {
              const stored = localStorage.getItem('user');
              if (stored) {
                const u = JSON.parse(stored);
                activeUserId = u.id || u.userId || null;
              }
            } catch {}
            if (!activeUserId) activeUserId = localStorage.getItem('currentUserId');
          }

          if (activeUserId) {
            this.currentUserId = activeUserId;
            // Allow STOMP to finish installing its WebSocket before creating
            // subscriptions. This also ignores a stale callback from a client
            // that was replaced while reconnecting.
            const connectedClient = this.client;
            setTimeout(() => {
              if (this.client === connectedClient && this.isConnected()) {
                this.subscribeUserChannels(activeUserId!);
              }
            }, 0);
          } else {
            console.warn('[CallWS] Connected but no activeUserId found to subscribe.');
          }

          resolve(true);
        },
        onStompError: (frame) => {
          console.error('[CallWS] STOMP error frame:', frame.headers['message'], frame.body);
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
          this.userQueueSub = null;
          this.userTopicSub = null;
          this.roomSubs.clear();
        },
      });

      this.client.activate();

      setTimeout(() => {
        if (!this.connected) {
          this.connectionPromise = null;
          resolve(false);
        }
      }, 8000);
    });

    return this.connectionPromise;
  }

  public subscribeUserChannels(userId: string) {
    this.currentUserId = userId;
    if (!this.isConnected() || !this.client) return;

    // 1. Subscribe to User Queue
    if (!this.userQueueSub) {
      try {
        this.userQueueSub = this.client.subscribe('/user/queue/call-signal', (msg) => {
          try {
            const signal: WebRtcSignal = JSON.parse(msg.body);
            this.dispatchSignal(signal);
          } catch (e) {
            console.error('[CallWS] Parse user queue signal error:', e);
          }
        });
      } catch (err) {
        console.error('[CallWS] Failed to subscribe /user/queue/call-signal:', err);
      }
    }

    // 2. Subscribe to fallback Topic /topic/call-user.{userId}
    if (!this.userTopicSub) {
      try {
        this.userTopicSub = this.client.subscribe(`/topic/call-user.${userId}`, (msg) => {
          try {
            const signal: WebRtcSignal = JSON.parse(msg.body);
            this.dispatchSignal(signal);
          } catch (e) {
            console.error('[CallWS] Parse topic call-user error:', e);
          }
        });
      } catch (err) {
        console.error('[CallWS] Failed to subscribe fallback topic:', err);
      }
    }
  }

  public subscribeCallRoom(callSessionId: string, onRoomSignal?: SignalCallback): () => void {
    if (!this.isConnected() || !this.client) {
      return () => {};
    }

    const topic = `/topic/call/${callSessionId}`;
    if (!this.roomSubs.has(callSessionId)) {
      try {
        const sub = this.client.subscribe(topic, (msg) => {
          try {
            const signal: WebRtcSignal = JSON.parse(msg.body);
            this.dispatchSignal(signal);
            onRoomSignal?.(signal);
          } catch (e) {
            console.error('[CallWS] Parse room signal error:', e);
          }
        });
        this.roomSubs.set(callSessionId, sub);
      } catch (err) {
        console.error(`[CallWS] Failed to subscribe ${topic}:`, err);
      }
    }

    return () => {
      this.unsubscribeCallRoom(callSessionId);
    };
  }

  public unsubscribeCallRoom(callSessionId: string) {
    const sub = this.roomSubs.get(callSessionId);
    if (sub) {
      try {
        sub.unsubscribe();
      } catch {}
      this.roomSubs.delete(callSessionId);
    }
  }

  public onSignal(callback: SignalCallback): () => void {
    this.signalCallbacks.add(callback);
    return () => {
      this.signalCallbacks.delete(callback);
    };
  }

  private dispatchSignal(signal: WebRtcSignal) {
    // The server deliberately publishes to the authenticated user queue and a
    // topic fallback.  A client subscribed to both must process that one
    // logical signal only once (especially INCOMING_CALL and REJECT).
    const key = [
      signal.callSessionId,
      signal.senderId || '',
      signal.signalType,
      JSON.stringify(signal.sdp || signal.candidate || {
        audioMuted: signal.audioMuted,
        videoMuted: signal.videoMuted,
        mediaType: signal.mediaType,
      }),
    ].join('|');
    const now = Date.now();
    const seenAt = this.recentSignalKeys.get(key);
    if (seenAt && now - seenAt < 5000) return;
    this.recentSignalKeys.set(key, now);
    this.recentSignalKeys.forEach((timestamp, cachedKey) => {
      if (now - timestamp > 10000) this.recentSignalKeys.delete(cachedKey);
    });

    this.signalCallbacks.forEach((cb) => {
      try {
        cb(signal);
      } catch (e) {
        console.error('[CallWS] Error in signal callback:', e);
      }
    });
  }

  public sendSignal(
    callSessionId: string,
    targetUserId: string | null,
    signalType: WebRtcSignal['signalType'],
    extra?: {
      sdp?: any;
      candidate?: any;
      audioMuted?: boolean;
      videoMuted?: boolean;
    }
  ): boolean {
    if (!this.isConnected() || !this.client) {
      console.warn('[CallWS] Cannot send signal: client not connected');
      return false;
    }

    const payload = {
      callSessionId,
      senderId: this.currentUserId,
      targetUserId: targetUserId || undefined,
      signalType,
      sdp: extra?.sdp,
      candidate: extra?.candidate,
      audioMuted: extra?.audioMuted,
      videoMuted: extra?.videoMuted,
    };

    try {
      this.client.publish({
        destination: `/app/call.signal/${callSessionId}`,
        body: JSON.stringify(payload),
      });
      return true;
    } catch (err) {
      console.error('[CallWS] Failed to publish signal:', err);
      return false;
    }
  }

  public disconnect() {
    if (this.client) {
      try {
        this.client.deactivate();
      } catch {}
      this.client = null;
    }
    this.connected = false;
    this.connectionPromise = null;
    this.userQueueSub = null;
    this.userTopicSub = null;
    this.roomSubs.clear();
    this.signalCallbacks.clear();
    this.recentSignalKeys.clear();
  }
}

export const callWebSocketService = new CallWebSocketService();
