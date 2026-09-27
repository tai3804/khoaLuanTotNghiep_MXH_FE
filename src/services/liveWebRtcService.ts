import { callWebSocketService } from './callWebSocket';

export interface LiveSignalPayload {
  type: 'OFFER' | 'ANSWER' | 'ICE_CANDIDATE' | 'ACCEPT' | 'LEAVE' | 'VIEWER_COUNT';
  postId: string;
  senderId: string;
  targetId?: string;
  sdp?: any;
  candidate?: any;
  viewerCount?: number;
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

const toValidUuid = (id: string): string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  let hex = '';
  for (let i = 0; i < id.length; i++) {
    hex += id.charCodeAt(i).toString(16);
  }
  hex = (hex + '00000000000000000000000000000000').substring(0, 32);
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-4${hex.substring(13, 16)}-8${hex.substring(17, 20)}-${hex.substring(20, 32)}`;
};

class LiveWebRtcService {
  private channels: Map<string, BroadcastChannel> = new Map();
  private wsUnsubMap: Map<string, () => void> = new Map();
  private globalWsUnsub: (() => void) | null = null;

  // Host sessions: postId -> { hostUserId, stream, peers: Map<viewerId, RTCPeerConnection>, candidateQueues }
  private hostSessions: Map<
    string,
    {
      hostUserId: string;
      stream: MediaStream;
      peers: Map<string, RTCPeerConnection>;
      candidateQueues: Map<string, RTCIceCandidateInit[]>;
      onViewerCountChange?: (count: number) => void;
    }
  > = new Map();

  // Viewer sessions: postId -> { viewerUserId, peer, candidateQueue, onStream, onViewerCount }
  private viewerSessions: Map<
    string,
    {
      viewerUserId: string;
      peer: RTCPeerConnection;
      candidateQueue: RTCIceCandidateInit[];
      onStream: (s: MediaStream) => void;
      onViewerCount?: (count: number) => void;
    }
  > = new Map();

  constructor() {
    this.initGlobalWsListener();
  }

  private initGlobalWsListener() {
    if (this.globalWsUnsub) return;
    this.globalWsUnsub = callWebSocketService.onSignal((signal: any) => {
      if (!signal) return;
      const postId = signal.callSessionId;
      const signalType = signal.signalType;
      const senderId = signal.senderId;
      const targetId = signal.targetUserId;
      const sdp = signal.sdp;
      const candidate = signal.candidate;

      this.routeSignal({
        type: signalType as any,
        postId: String(postId),
        senderId: String(senderId),
        targetId: targetId ? String(targetId) : undefined,
        sdp,
        candidate,
      });
    });
  }

  private getBroadcastChannel(postId: string): BroadcastChannel {
    if (!this.channels.has(postId)) {
      const ch = new BroadcastChannel(`kltn_live_webrtc_${postId}`);
      ch.onmessage = (e) => {
        this.routeSignal(e.data);
      };
      this.channels.set(postId, ch);
    }
    return this.channels.get(postId)!;
  }

  private sendSignal(msg: LiveSignalPayload) {
    // 1. BroadcastChannel (fast same-browser cross-tab messaging)
    try {
      const ch = this.getBroadcastChannel(msg.postId);
      ch.postMessage(msg);
    } catch {}

    // 2. LocalStorage signal bus fallback
    try {
      localStorage.setItem(
        `kltn_live_signal_${msg.postId}`,
        JSON.stringify({ ...msg, _t: Date.now() + Math.random() })
      );
    } catch {}

    // 3. WebSocket signaling through Call WebSocket broker
    if (callWebSocketService.isConnected()) {
      const validSessionId = toValidUuid(msg.postId);
      const validTargetId = msg.targetId ? toValidUuid(msg.targetId) : null;
      callWebSocketService.sendSignal(validSessionId, validTargetId, msg.type as any, {
        sdp: msg.sdp,
        candidate: msg.candidate,
      });
    }
  }

  // --- HOST REGISTRATION ---
  public registerHostStream(
    postId: string,
    hostUserId: string,
    stream: MediaStream,
    onViewerCountChange?: (count: number) => void
  ): () => void {
    console.log(`[LiveWebRtc] Host registered stream for postId: ${postId}`);

    this.hostSessions.set(postId, {
      hostUserId,
      stream,
      peers: new Map(),
      candidateQueues: new Map(),
      onViewerCountChange,
    });

    // Subscribe to STOMP topic for this post
    if (callWebSocketService.isConnected()) {
      const validSessionId = toValidUuid(postId);
      const unsub = callWebSocketService.subscribeCallRoom(validSessionId, (signal: any) => {
        this.routeSignal({
          type: signal.signalType as any,
          postId,
          senderId: signal.senderId,
          targetId: signal.targetUserId,
          sdp: signal.sdp,
          candidate: signal.candidate,
        });
      });
      this.wsUnsubMap.set(postId, unsub);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `kltn_live_signal_${postId}` && e.newValue) {
        try {
          const sig = JSON.parse(e.newValue);
          if (sig.senderId !== hostUserId) {
            this.routeSignal(sig);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      console.log(`[LiveWebRtc] Cleaning up host session for postId: ${postId}`);
      window.removeEventListener('storage', handleStorage);

      const host = this.hostSessions.get(postId);
      if (host) {
        host.peers.forEach((peer) => {
          try { peer.close(); } catch {}
        });
      }
      this.hostSessions.delete(postId);

      const wsUnsub = this.wsUnsubMap.get(postId);
      if (wsUnsub) {
        wsUnsub();
        this.wsUnsubMap.delete(postId);
      }

      const ch = this.channels.get(postId);
      if (ch) {
        ch.close();
        this.channels.delete(postId);
      }
    };
  }

  // --- VIEWER SUBSCRIPTION ---
  public subscribeViewer(
    postId: string,
    viewerUserId: string,
    onStream: (stream: MediaStream) => void,
    onViewerCount?: (count: number) => void
  ): () => void {
    console.log(`[LiveWebRtc] Viewer subscribing to postId: ${postId}`);

    const peer = new RTCPeerConnection(ICE_SERVERS);
    const candidateQueue: RTCIceCandidateInit[] = [];

    peer.ontrack = (event) => {
      console.log(`[LiveWebRtc] Viewer received live remote track:`, event.track.kind);
      if (event.streams && event.streams[0]) {
        onStream(event.streams[0]);
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
    });

    // Subscribe to STOMP topic for this post
    if (callWebSocketService.isConnected()) {
      const validSessionId = toValidUuid(postId);
      const unsub = callWebSocketService.subscribeCallRoom(validSessionId, (signal: any) => {
        this.routeSignal({
          type: signal.signalType as any,
          postId,
          senderId: signal.senderId,
          targetId: signal.targetUserId,
          sdp: signal.sdp,
          candidate: signal.candidate,
        });
      });
      this.wsUnsubMap.set(postId, unsub);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `kltn_live_signal_${postId}` && e.newValue) {
        try {
          const sig = JSON.parse(e.newValue);
          if (sig.senderId !== viewerUserId) {
            this.routeSignal(sig);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Request host to send SDP offer
    this.sendSignal({
      type: 'ACCEPT',
      postId,
      senderId: viewerUserId,
    });

    // Retry ACCEPT request after 1.5s if stream not connected yet
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
      clearTimeout(retryTimer);
      window.removeEventListener('storage', handleStorage);

      this.sendSignal({
        type: 'LEAVE',
        postId,
        senderId: viewerUserId,
      });

      try { peer.close(); } catch {}
      this.viewerSessions.delete(postId);
    };
  }

  // --- SIGNAL ROUTER & NEGOTIATION ---
  private async routeSignal(msg: LiveSignalPayload) {
    if (!msg || !msg.postId) return;

    // Check if message is for Host
    const host = this.hostSessions.get(msg.postId);
    if (host) {
      if (msg.type === 'ACCEPT') {
        const viewerId = msg.senderId;
        if (viewerId === host.hostUserId) return; // Ignore own message

        console.log(`[LiveWebRtc] Host received ACCEPT from viewer ${viewerId}. Creating offer...`);

        let peer = host.peers.get(viewerId);
        if (peer) {
          try { peer.close(); } catch {}
        }

        peer = new RTCPeerConnection(ICE_SERVERS);
        const hostQueue: RTCIceCandidateInit[] = [];
        host.candidateQueues.set(viewerId, hostQueue);

        // Add all video & audio tracks
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
          console.log(`[LiveWebRtc] Host-Viewer peer state: ${peer!.connectionState}`);
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
          console.log(`[LiveWebRtc] Host applying remote answer from viewer ${viewerId}`);
          await peer.setRemoteDescription(new RTCSessionDescription(msg.sdp));

          const queue = host.candidateQueues.get(viewerId) || [];
          for (const cand of queue) {
            try { await peer.addIceCandidate(new RTCIceCandidate(cand)); } catch {}
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
            try { await peer.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch {}
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
          try { peer.close(); } catch {}
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

    // Check if message is for Viewer
    const viewer = this.viewerSessions.get(msg.postId);
    if (viewer) {
      if (msg.type === 'OFFER' && msg.sdp) {
        if (msg.targetId && msg.targetId !== viewer.viewerUserId && toValidUuid(msg.targetId) !== toValidUuid(viewer.viewerUserId)) {
          return; // Ignore offer destined for another viewer
        }

        console.log(`[LiveWebRtc] Viewer received OFFER from host. Generating answer...`);
        await viewer.peer.setRemoteDescription(new RTCSessionDescription(msg.sdp));

        for (const cand of viewer.candidateQueue) {
          try { await viewer.peer.addIceCandidate(new RTCIceCandidate(cand)); } catch {}
        }
        viewer.candidateQueue = [];

        const answer = await viewer.peer.createAnswer();
        await viewer.peer.setLocalDescription(answer);

        this.sendSignal({
          type: 'ANSWER',
          postId: msg.postId,
          senderId: viewer.viewerUserId,
          targetId: msg.senderId,
          sdp: answer,
        });
        return;
      }

      if (msg.type === 'ICE_CANDIDATE' && msg.candidate) {
        if (viewer.peer.remoteDescription) {
          try { await viewer.peer.addIceCandidate(new RTCIceCandidate(msg.candidate)); } catch {}
        } else {
          viewer.candidateQueue.push(msg.candidate);
        }
        return;
      }

      if (msg.type === 'VIEWER_COUNT' && msg.viewerCount !== undefined) {
        viewer.onViewerCount?.(msg.viewerCount);
        return;
      }
    }
  }
}

export const liveWebRtcService = new LiveWebRtcService();
