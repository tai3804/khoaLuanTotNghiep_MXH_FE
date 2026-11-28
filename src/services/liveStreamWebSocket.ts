import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { store } from '../store/store';
import { getWebSocketUrl } from '../utils/wsUrl';
import { setAccessToken } from '../store/slices/authSlice';
import { api } from './axiosClient';
import { authService } from './authService';

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
    | 'LIVE_REACTION'
    | 'KICK_PARTICIPANT'
    | 'LIVE_SETTINGS';
  sdp?: any;
  candidate?: any;
  viewerCount?: number;
  payload?: any;
}

type LiveSignalCallback = (signal: LiveWebRtcSignal) => void;

/** Token còn hạn ít nhất `marginMs` không (đọc exp trong JWT). */
const tokenStillValid = (token: string | null | undefined, marginMs = 3000): boolean => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 - Date.now() > marginMs;
  } catch {
    return true;
  }
};

/** Lấy token còn hạn để mở kết nối; hết hạn thì làm mới qua cookie phiên. */
const ensureFreshToken = async (): Promise<string | null> => {
  const current = store.getState().auth.accessToken;
  if (tokenStillValid(current)) return current;
  try {
    const refreshed = await authService.refreshToken();
    if (refreshed) {
      store.dispatch(setAccessToken(refreshed));
      return refreshed;
    }
  } catch {
    // để lần kết nối lại sau thử tiếp
  }
  return null;
};

class LiveStreamWebSocketService {
  private client: Client | null = null;
  private connected = false;
  private connectionPromise: Promise<boolean> | null = null;
  private roomSubscriptions: Map<string, StompSubscription> = new Map();
  private signalCallbacks: Map<string, Set<LiveSignalCallback>> = new Map();
  private subscribedRooms: Set<string> = new Set();
  private hasConnectedBefore = false;
  private boundToken: string | null = null;

  constructor() {
    // Máy chủ kiểm tra hạn token trên từng frame STOMP: khi token được làm mới (trước lúc hết hạn)
    // thì mở lại kết nối bằng token mới, nếu không tín hiệu WebRTC (OFFER/ANSWER/ICE) sẽ bị từ chối.
    store.subscribe(() => {
      const token = store.getState().auth.accessToken;
      if (token && this.connected && this.client && this.boundToken && token !== this.boundToken) {
        this.reconnectWithFreshToken();
      }
    });
  }

  /** Các phòng live đang được theo dõi (chủ phòng hoặc người xem). */
  public getSubscribedRooms(): string[] {
    return Array.from(this.subscribedRooms);
  }

  /** Gọi khi app quay lại màn hình: nếu đang theo dõi phòng mà kênh đã tắt hẳn thì dựng lại. */
  public ensureConnected(): void {
    if (this.subscribedRooms.size === 0 || this.isConnected() || this.client?.active) return;
    void this.connect();
  }

  public isConnected(): boolean {
    return this.connected && this.client !== null && this.client.active && this.client.connected;
  }

  private async waitUntilConnected(timeoutMs: number): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (this.isConnected()) return true;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return this.isConnected();
  }

  private reconnectWithFreshToken() {
    console.log('[LiveStreamWS] Access token renewed, reconnecting live socket with the new token.');
    const old = this.client;
    this.client = null;
    this.connected = false;
    this.connectionPromise = null;
    this.boundToken = null;
    this.roomSubscriptions.clear();
    if (old) old.deactivate().catch(() => {});
    void this.connect();
  }

  public async connect(): Promise<boolean> {
    if (this.isConnected()) return true;
    if (this.connectionPromise) return this.connectionPromise;
    // Client hiện tại đang tự nối lại (reconnectDelay). Dựng thêm Client thứ hai sẽ để hai kết nối cùng sống và mỗi bản tin
    // tới hai lần (cả tín hiệu WebRTC), nên chỉ chờ client đó nối xong rồi cho bên gọi (gửi tín hiệu, đăng ký phòng) chạy tiếp.
    if (this.client?.active) return this.waitUntilConnected(10000);

    const token = await ensureFreshToken();
    if (!token) return false;
    if (this.isConnected()) return true;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise<boolean>((resolve) => {
      const wsUrl = getWebSocketUrl('/ws-call', import.meta.env.VITE_CALL_WS_URL);

      const client: Client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        // Mỗi lần (tự) kết nối lại đều dùng token mới nhất, không dùng lại token lúc tạo client
        beforeConnect: async () => {
          const fresh = (await ensureFreshToken()) || token;
          client.connectHeaders = { Authorization: `Bearer ${fresh}`, access_token: fresh };
          this.boundToken = fresh;
        },
        reconnectDelay: 4000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          if (this.client !== client) return;
          console.log('[LiveStreamWS] Connected successfully to Live WebSocket broker.');
          this.connected = true;
          this.connectionPromise = null;
          const isReconnect = this.hasConnectedBefore;
          this.hasConnectedBefore = true;

          // Đây là kết nối MỚI: máy chủ không nhớ đăng ký cũ, còn các StompSubscription trong bảng thuộc về kết nối đã chết.
          // Nếu không xoá, setupStompSubscription thấy phòng "đã đăng ký" và bỏ qua, nên sau mỗi lần rớt mạng/đổi mạng/tunnel ngắt
          // thì bình luận, cảm xúc, số người xem và cả tín hiệu WebRTC của phòng live dừng hẳn.
          this.roomSubscriptions.clear();
          this.subscribedRooms.forEach((pId) => {
            this.setupStompSubscription(pId);
          });

          // Những gì phát trong lúc rớt không được gửi lại: báo để nơi dùng nạp bù từ REST
          if (isReconnect && this.subscribedRooms.size > 0) {
            window.dispatchEvent(
              new CustomEvent('kltn_live_ws_reconnected', { detail: { rooms: Array.from(this.subscribedRooms) } })
            );
          }

          resolve(true);
        },
        onStompError: (frame) => {
          if (this.client !== client) return;
          console.error('[LiveStreamWS] STOMP error frame:', frame.headers['message']);
          this.connected = false;
          this.connectionPromise = null;
          resolve(false);
        },
        onWebSocketClose: () => {
          if (this.client === client) this.connected = false;
        },
        onDisconnect: () => {
          if (this.client !== client) return;
          this.connected = false;
          this.connectionPromise = null;
          this.roomSubscriptions.clear();
        },
      });

      this.client = client;
      client.activate();

      setTimeout(() => {
        if (!this.connected && this.client === client) {
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
    this.hasConnectedBefore = false;
    this.boundToken = null;
    this.roomSubscriptions.clear();
    this.signalCallbacks.clear();
  }
}

export const liveStreamWebSocketService = new LiveStreamWebSocketService();
