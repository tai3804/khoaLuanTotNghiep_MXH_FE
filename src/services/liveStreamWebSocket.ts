import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { store } from '../store/store';
import { setAccessToken } from '../store/slices/authSlice';
import { api } from './axiosClient';

export interface LiveWebRtcSignal {
  callSessionId?: string;
  postId?: string;
  senderId?: string;
  targetUserId?: string;
  signalType:
    | 'OFFER'
    | 'ANSWER'
    | 'ICE_CANDIDATE'
    | 'ACCEPT'
    | 'LEAVE'
    | 'END_CALL'
    | 'VIEWER_COUNT'
    | 'LIVE_COMMENT'
    | 'LIVE_REACTION';
  sdp?: any;
  candidate?: any;
  viewerCount?: number;
  payload?: any;
}

type LiveSignalCallback = (signal: LiveWebRtcSignal) => void;

class LiveStreamWebSocketService {
  private client: Client | null = null;
  private connected = false;
  private connectionPromise: Promise<boolean> | null = null;
  private roomSubscriptions: Map<string, StompSubscription> = new Map();
  private signalCallbacks: Map<string, Set<LiveSignalCallback>> = new Map();
  private subscribedRooms: Set<string> = new Set();

  public isConnected(): boolean {
    return this.connected && this.client !== null && this.client.active && this.client.connected;
  }

  public async connect(): Promise<boolean> {
    if (this.isConnected()) return true;
    if (this.connectionPromise) return this.connectionPromise;

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
      } catch {}
    }

    if (!token) return false;

    this.connectionPromise = new Promise<boolean>((resolve) => {
      const wsUrl = import.meta.env.VITE_CALL_WS_URL || 'http://localhost:8080/ws-call';

      this.client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
          access_token: token,
        },
        reconnectDelay: 4000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          console.log('[LiveStreamWS] Connected successfully to Live WebSocket broker.');
          this.connected = true;
          this.connectionPromise = null;

          // Re-subscribe all tracked rooms
          this.subscribedRooms.forEach((pId) => {
            this.setupStompSubscription(pId);
          });

          resolve(true);
        },
        onStompError: (frame) => {
          console.error('[LiveStreamWS] STOMP error frame:', frame.headers['message']);
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
          this.roomSubscriptions.clear();
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

  private setupStompSubscription(postId: string) {
    if (!this.isConnected() || !this.client || this.roomSubscriptions.has(postId)) {
      return;
    }

    const topic = `/topic/live/${postId}`;
    try {
      console.log(`[LiveStreamWS] Subscribing to live topic: ${topic}`);
      const sub = this.client.subscribe(topic, (msg) => {
        try {
          const signal: LiveWebRtcSignal = JSON.parse(msg.body);
          if (!signal.postId) {
            signal.postId = postId;
          }

          console.log(`[LiveStreamWS] Received live signal [${signal.signalType}] on ${topic}:`, signal);

          // Always dispatch global custom event for live comments, reactions & status changes
          window.dispatchEvent(
            new CustomEvent('kltn_live_chat_event', {
              detail: {
                ...signal,
                postId,
                type: signal.signalType,
              },
            })
          );

          const cbs = this.signalCallbacks.get(postId);
          if (cbs) {
            cbs.forEach((cb) => {
              try {
                cb(signal);
              } catch (e) {
                console.error('[LiveStreamWS] Callback error:', e);
              }
            });
          }
        } catch (e) {
          console.error('[LiveStreamWS] Parse signal error:', e);
        }
      });
      this.roomSubscriptions.set(postId, sub);
    } catch (err) {
      console.error(`[LiveStreamWS] Failed to subscribe ${topic}:`, err);
    }
  }

  public subscribeRoom(postId: string, callback?: LiveSignalCallback): () => void {
    this.subscribedRooms.add(postId);

    if (callback) {
      if (!this.signalCallbacks.has(postId)) {
        this.signalCallbacks.set(postId, new Set());
      }
      this.signalCallbacks.get(postId)!.add(callback);
    }

    if (!this.isConnected() || !this.client) {
      this.connect().then((ok) => {
        if (ok) this.setupStompSubscription(postId);
      });
    } else {
      this.setupStompSubscription(postId);
    }

    return () => {
      if (callback && this.signalCallbacks.has(postId)) {
        this.signalCallbacks.get(postId)!.delete(callback);
      }
      if (!this.signalCallbacks.has(postId) || this.signalCallbacks.get(postId)!.size === 0) {
        const sub = this.roomSubscriptions.get(postId);
        if (sub) {
          try { sub.unsubscribe(); } catch {}
          this.roomSubscriptions.delete(postId);
        }
        this.signalCallbacks.delete(postId);
        this.subscribedRooms.delete(postId);
      }
    };
  }

  public sendSignal(
    postId: string,
    senderId: string,
    targetUserId: string | null,
    signalType: LiveWebRtcSignal['signalType'],
    extra?: {
      sdp?: any;
      candidate?: any;
      viewerCount?: number;
      payload?: any;
    }
  ): boolean {
    if (!this.isConnected() || !this.client) {
      this.connect().then((ok) => {
        if (ok) this.sendSignal(postId, senderId, targetUserId, signalType, extra);
      });
      return false;
    }

    const messagePayload = {
      callSessionId: postId,
      senderId,
      targetUserId: targetUserId || undefined,
      signalType,
      sdp: extra?.sdp,
      candidate: extra?.candidate,
      viewerCount: extra?.viewerCount,
      payload: extra?.payload,
    };

    try {
      this.client.publish({
        destination: `/app/live.signal/${postId}`,
        body: JSON.stringify(messagePayload),
      });
      return true;
    } catch (err) {
      console.error('[LiveStreamWS] Failed to publish live signal:', err);
      return false;
    }
  }

  public disconnect() {
    if (this.client) {
      try { this.client.deactivate(); } catch {}
      this.client = null;
    }
    this.connected = false;
    this.connectionPromise = null;
    this.roomSubscriptions.clear();
    this.signalCallbacks.clear();
  }
}

export const liveStreamWebSocketService = new LiveStreamWebSocketService();
