import { liveStreamWebSocketService, LiveWebRtcSignal } from './liveStreamWebSocket';

export interface LiveSignalPayload {
  type:
  | 'OFFER'
  | 'ANSWER'
  | 'ICE_CANDIDATE'
  | 'ACCEPT'
  | 'LEAVE'
  | 'END_CALL'
  | 'VIEWER_COUNT'
  | 'LIVE_COMMENT'
  | 'LIVE_REACTION';
  postId: string;
  senderId: string;
  targetId?: string;
  sdp?: any;
  candidate?: any;
  viewerCount?: number;
  payload?: any;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
};

/** 'disconnected' thường chỉ là mạng chập chờn và tự hồi phục; chỉ coi là mất kết nối nếu quá lâu không nối lại được. */
const DISCONNECT_GRACE_MS = 4000;

class LiveWebRtcService {
  private channels: Map<string, BroadcastChannel> = new Map();
  private wsUnsubMap: Map<string, () => void> = new Map();
  private processedSignals: Set<string> = new Set();

  // Host sessions: postId -> { hostUserId, stream, peers: Map<viewerId, RTCPeerConnection>, candidateQueues }
  private hostSessions: Map<
    string,
    {
      hostUserId: string;
      stream: MediaStream;
      peers: Map<string, RTCPeerConnection>;
      candidateQueues: Map<string, RTCIceCandidateInit[]>;
      onViewerCountChange?: (count: number) => void;
      /** Số nơi đang cùng dùng phiên này (toàn app + thẻ bài); chỉ dỡ phiên khi không còn ai dùng. */
      refs: number;
      unsubWs: () => void;
    }
  > = new Map();

  // Viewer sessions: postId -> { viewerUserId, peer, candidateQueue, onStream, onViewerCount, onEnded }
  private viewerSessions: Map<
    string,
    {
      viewerUserId: string;
      peer: RTCPeerConnection;
      candidateQueue: RTCIceCandidateInit[];
      onStream: (s: MediaStream) => void;
      onViewerCount?: (count: number) => void;
      onEnded?: () => void;
    }
  > = new Map();

  private getBroadcastChannel(postId: string): BroadcastChannel {
    if (!this.channels.has(postId)) {
      const ch = new BroadcastChannel(`kltn_live_channel_${postId}`);
      ch.onmessage = (e) => {
        this.routeSignal(e.data);
      };
      this.channels.set(postId, ch);
    }
    return this.channels.get(postId)!;
  }

  private sendSignal(msg: LiveSignalPayload) {
    const sigKey = `${msg.type}_${msg.postId}_${msg.senderId}_${msg.targetId || ''}_${JSON.stringify(msg.sdp?.type || msg.candidate?.candidate || '')}`;
    this.processedSignals.add(sigKey);
    setTimeout(() => this.processedSignals.delete(sigKey), 3000);

    // 1. BroadcastChannel (for same browser tabs)
    try {
      const ch = this.getBroadcastChannel(msg.postId);
      ch.postMessage(msg);
    } catch { }

    // 2. Isolated LiveStream WebSocket service (cross-device/network)
    liveStreamWebSocketService.sendSignal(
      msg.postId,
      msg.senderId,
      msg.targetId || null,
      msg.type,
      {
        sdp: msg.sdp,
        candidate: msg.candidate,
        viewerCount: msg.viewerCount,
        payload: msg.payload,
      }
    );
  }

  // --- HOST REGISTRATION ---
  /**
   * Đăng ký luồng của chủ phòng để trả lời người xem. Gọi nhiều lần với cùng một luồng thì dùng chung một phiên (đếm tham
   * chiếu): chủ phòng phải luôn được đăng ký trong suốt buổi phát, không phụ thuộc thẻ bài có đang hiện trên màn hình hay không.
   */
  public registerHostStream(
    postId: string,
    hostUserId: string,
    stream: MediaStream,
    onViewerCountChange?: (count: number) => void
  ): () => void {
    const existing = this.hostSessions.get(postId);
    if (existing && existing.stream === stream) {
      existing.refs += 1;
      existing.onViewerCountChange = onViewerCountChange ?? existing.onViewerCountChange;
      return () => this.releaseHostStream(postId, existing);
    }
    if (existing) {
      // Luồng khác (vd camera được mở lại): dỡ phiên cũ rồi dựng phiên mới
      existing.refs = 0;
      this.releaseHostStream(postId, existing);
    }

    console.log(`[LiveWebRtc] Registering Host stream for post: ${postId}`);

    // Subscribe to isolated live topic
    const unsubWs = liveStreamWebSocketService.subscribeRoom(postId, (signal: LiveWebRtcSignal) => {
      this.routeSignal({
        type: signal.signalType,
        postId,
        senderId: String(signal.senderId || ''),
        targetId: signal.targetUserId ? String(signal.targetUserId) : undefined,
        sdp: signal.sdp,
        candidate: signal.candidate,
        viewerCount: signal.viewerCount,
      });
    });

    const session = {
      hostUserId,
      stream,
      peers: new Map<string, RTCPeerConnection>(),
      candidateQueues: new Map<string, RTCIceCandidateInit[]>(),
      onViewerCountChange,
      refs: 1,
      unsubWs,
    };
    this.hostSessions.set(postId, session);
    return () => this.releaseHostStream(postId, session);
  }

  private releaseHostStream(
    postId: string,
    session: { peers: Map<string, RTCPeerConnection>; refs: number; unsubWs: () => void }
  ) {
    session.refs -= 1;
    if (session.refs > 0) return;

    console.log(`[LiveWebRtc] Unregistering Host stream for post: ${postId}`);
    session.peers.forEach((peer) => {
      try { peer.close(); } catch { }
    });
    session.unsubWs();
    if (this.hostSessions.get(postId) === session) {
      this.hostSessions.delete(postId);
    }

    const ch = this.channels.get(postId);
    if (ch) {
      ch.close();
      this.channels.delete(postId);
    }
  }

  // --- VIEWER SUBSCRIPTION ---
  /**
   * onEnded: chủ phòng chủ động kết thúc (tín hiệu END_CALL) - kết thúc hẳn.
   * onInterrupted: kết nối tới chủ phòng bị đứt (chủ phòng tải lại trang, mất mạng...) - có thể nối lại; nếu không truyền thì coi như onEnded.
   */
  public subscribeViewer(
    postId: string,
    viewerUserId: string,
    onStream: (stream: MediaStream) => void,
    onViewerCount?: (count: number) => void,
    onEnded?: () => void,
    onInterrupted?: () => void
  ): () => void {
    console.log(`[LiveWebRtc] Subscribing Viewer to post: ${postId}`);

    let disposed = false;
    let disconnectTimer: ReturnType<typeof setTimeout> | undefined;
    const peer = new RTCPeerConnection(ICE_SERVERS);
    const candidateQueue: RTCIceCandidateInit[] = [];
    const inboundStream = new MediaStream();

    peer.ontrack = (event) => {
      console.log(`[LiveWebRtc] Viewer received live remote track [${event.track.kind}]`);
      if (event.track) {
        inboundStream.getTracks().forEach((t) => {
          if (t.kind === event.track.kind) {
            inboundStream.removeTrack(t);
          }
        });
        inboundStream.addTrack(event.track);
      }

      if (event.streams && event.streams[0]) {
        event.streams[0].getTracks().forEach((t) => {
          if (!inboundStream.getTracks().some((existing) => existing.id === t.id)) {
            inboundStream.addTrack(t);
          }
        });
      }

      // Create new MediaStream instance so React state detects reference change and re-renders video
      onStream(new MediaStream(inboundStream.getTracks()));
    };

    const interrupted = () => {
      if (disposed) return;
      (onInterrupted ?? onEnded)?.();
    };

    peer.onconnectionstatechange = () => {
      const state = peer.connectionState;
      if (state === 'connected') {
        clearTimeout(disconnectTimer);
        return;
      }
      if (state === 'disconnected') {
        clearTimeout(disconnectTimer);
        disconnectTimer = setTimeout(() => {
          if (peer.connectionState !== 'connected') interrupted();
        }, DISCONNECT_GRACE_MS);
        return;
      }
      if (state === 'failed' || state === 'closed') {
        clearTimeout(disconnectTimer);
        interrupted();
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'ICE_CANDIDATE',
          postId,
          senderId: viewerUserId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    this.viewerSessions.set(postId, {
      viewerUserId,
      peer,
      candidateQueue,
      onStream,
      onViewerCount,
      onEnded,
    });

    const unsubWs = liveStreamWebSocketService.subscribeRoom(postId, (signal: LiveWebRtcSignal) => {
      this.routeSignal({
        type: signal.signalType,
        postId,
        senderId: String(signal.senderId || ''),
        targetId: signal.targetUserId ? String(signal.targetUserId) : undefined,
        sdp: signal.sdp,
        candidate: signal.candidate,
        viewerCount: signal.viewerCount,
        payload: signal.payload,
      });
    });
    this.wsUnsubMap.set(`viewer_${postId}`, unsubWs);

    // Send Join Live request to host
    this.sendSignal({
      type: 'ACCEPT',
      postId,
      senderId: viewerUserId,
    });

    // Auto-retry request if not connected within 1.5s
    const retryTimer = setTimeout(() => {
      if (this.viewerSessions.has(postId) && peer.connectionState !== 'connected') {
        this.sendSignal({
          type: 'ACCEPT',
          postId,
          senderId: viewerUserId,
        });
      }
    }, 1500);

    return () => {
      disposed = true;
      clearTimeout(disconnectTimer);
      clearTimeout(retryTimer);

      this.sendSignal({
        type: 'LEAVE',
        postId,
        senderId: viewerUserId,
      });

      try { peer.close(); } catch { }
      this.viewerSessions.delete(postId);

      const unsub = this.wsUnsubMap.get(`viewer_${postId}`);
      if (unsub) {
        unsub();
        this.wsUnsubMap.delete(`viewer_${postId}`);
      }
    };
  }

  // --- SIGNAL ROUTER & NEGOTIATION ---
  private async routeSignal(msg: LiveSignalPayload) {
    if (!msg || !msg.postId) return;

    if (msg.type === 'LIVE_COMMENT' || msg.type === 'LIVE_REACTION' || msg.type === 'END_CALL') {
      window.dispatchEvent(
        new CustomEvent('kltn_live_chat_event', {
          detail: {
            signalType: msg.type,
            postId: msg.postId,
            payload: msg.payload,
            viewerCount: msg.viewerCount,
            senderId: msg.senderId,
          },
        })
      );
    }

    // Check Host Session
    const host = this.hostSessions.get(msg.postId);
    if (host) {
      if (msg.type === 'ACCEPT') {
        const viewerId = msg.senderId;
        if (viewerId === host.hostUserId) return; // Ignore own message

        console.log(`[LiveWebRtc] Host creating WebRTC Offer for viewer: ${viewerId}`);

        let peer = host.peers.get(viewerId);
        if (peer) {
          try { peer.close(); } catch { }
        }

        peer = new RTCPeerConnection(ICE_SERVERS);
        const hostQueue: RTCIceCandidateInit[] = [];
        host.candidateQueues.set(viewerId, hostQueue);

        // Add active camera & microphone tracks
        host.stream.getTracks().forEach((track) => {
          peer!.addTrack(track, host.stream);
        });

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            this.sendSignal({
              type: 'ICE_CANDIDATE',
              postId: msg.postId,
              senderId: host.hostUserId,
              targetId: viewerId,
              candidate: event.candidate.toJSON(),
            });
          }
        };

        peer.onconnectionstatechange = () => {
          if (
            peer!.connectionState === 'disconnected' ||
            peer!.connectionState === 'closed' ||
            peer!.connectionState === 'failed'
          ) {
            host.peers.delete(viewerId);
            const count = host.peers.size;
            host.onViewerCountChange?.(count);
            this.sendSignal({
              type: 'VIEWER_COUNT',
              postId: msg.postId,
              senderId: host.hostUserId,
              viewerCount: count,
            });
          }
        };

        host.peers.set(viewerId, peer);

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        this.sendSignal({
          type: 'OFFER',
          postId: msg.postId,
          senderId: host.hostUserId,
          targetId: viewerId,
          sdp: offer,
        });

        const activeCount = host.peers.size;
        host.onViewerCountChange?.(activeCount);
        this.sendSignal({
          type: 'VIEWER_COUNT',
          postId: msg.postId,
          senderId: host.hostUserId,
          viewerCount: activeCount,
        });
        return;
      }

      if (msg.type === 'ANSWER') {
        const viewerId = msg.senderId;
        const peer = host.peers.get(viewerId);
        if (peer && msg.sdp && peer.signalingState === 'have-local-offer') {
          console.log(`[LiveWebRtc] Host applying ANSWER from viewer: ${viewerId}`);
          await peer.setRemoteDescription(new RTCSessionDescription(msg.sdp));

          const queue = host.candidateQueues.get(viewerId) || [];
          for (const cand of queue) {
            try { await peer.addIceCandidate(new RTCIceCandidate(cand)); } catch { }
          }
          host.candidateQueues.set(viewerId, []);
        }
        return;
      }

      if (msg.type === 'ICE_CANDIDATE') {
        const viewerId = msg.senderId;
        const peer = host.peers.get(viewerId);
        if (peer && msg.candidate) {
          if (peer.remoteDescription) {
            try { await peer.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch { }
          } else {
            const queue = host.candidateQueues.get(viewerId) || [];
            queue.push(msg.candidate);
            host.candidateQueues.set(viewerId, queue);
          }
        }
        return;
      }

      if (msg.type === 'LEAVE') {
        const viewerId = msg.senderId;
        const peer = host.peers.get(viewerId);
        if (peer) {
          try { peer.close(); } catch { }
          host.peers.delete(viewerId);
          const count = host.peers.size;
          host.onViewerCountChange?.(count);
          this.sendSignal({
            type: 'VIEWER_COUNT',
            postId: msg.postId,
            senderId: host.hostUserId,
            viewerCount: count,
          });
        }
        return;
      }
    }

    // Check Viewer Session
    const viewer = this.viewerSessions.get(msg.postId);
    if (viewer) {
      if (msg.type === 'OFFER' && msg.sdp) {
        if (msg.targetId && msg.targetId !== viewer.viewerUserId && msg.targetId !== 'viewer') {
          return;
        }

        // Avoid invalid state if offer is processed twice
        if (viewer.peer.signalingState === 'stable' && viewer.peer.remoteDescription) {
          return;
        }

        console.log(`[LiveWebRtc] Viewer applying OFFER from host and creating ANSWER...`);
        await viewer.peer.setRemoteDescription(new RTCSessionDescription(msg.sdp));

        for (const cand of viewer.candidateQueue) {
          try { await viewer.peer.addIceCandidate(new RTCIceCandidate(cand)); } catch { }
        }
        viewer.candidateQueue = [];

        if (viewer.peer.signalingState === 'have-remote-offer') {
          const answer = await viewer.peer.createAnswer();
          await viewer.peer.setLocalDescription(answer);

          this.sendSignal({
            type: 'ANSWER',
            postId: msg.postId,
            senderId: viewer.viewerUserId,
            targetId: msg.senderId,
            sdp: answer,
          });
        }
        return;
      }

      if (msg.type === 'ICE_CANDIDATE' && msg.candidate) {
        if (viewer.peer.remoteDescription) {
          try { await viewer.peer.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch { }
        } else {
          viewer.candidateQueue.push(msg.candidate);
        }
        return;
      }

      if (msg.type === 'VIEWER_COUNT' && msg.viewerCount !== undefined) {
        viewer.onViewerCount?.(msg.viewerCount);
        return;
      }

      if (msg.type === 'END_CALL') {
        viewer.onEnded?.();
        return;
      }
    }
  }
}

export const liveWebRtcService = new LiveWebRtcService();
