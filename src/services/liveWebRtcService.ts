import { callWebSocketService } from './callWebSocket';

export interface LiveSignalMessage {
  type: 'JOIN_LIVE' | 'LEAVE_LIVE' | 'OFFER' | 'ANSWER' | 'CANDIDATE' | 'VIEWER_COUNT';
  postId: string;
  senderId: string;
  targetId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
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

class LiveWebRtcService {
  private channels: Map<string, BroadcastChannel> = new Map();
  private wsUnsubs: Map<string, () => void> = new Map();

  // Host state: postId -> { stream, peers: Map<viewerId, RTCPeerConnection> }
  private hostSessions: Map<
    string,
    {
      stream: MediaStream;
      peers: Map<string, RTCPeerConnection>;
      onViewerCountChange?: (count: number) => void;
    }
  > = new Map();

  // Viewer state: postId -> { peer: RTCPeerConnection, onStream: (s: MediaStream) => void }
  private viewerSessions: Map<
    string,
    {
      peer: RTCPeerConnection;
      onStream: (s: MediaStream) => void;
      onViewerCount?: (count: number) => void;
    }
  > = new Map();

  private getBroadcastChannel(postId: string): BroadcastChannel {
    if (!this.channels.has(postId)) {
      const channel = new BroadcastChannel(`kltn_live_channel_${postId}`);
      channel.onmessage = (e) => {
        this.handleSignal(e.data);
      };
      this.channels.set(postId, channel);
    }
    return this.channels.get(postId)!;
  }

  private sendSignal(msg: LiveSignalMessage) {
    // 1. BroadcastChannel for fast local cross-tab / cross-window signaling
    try {
      const channel = this.getBroadcastChannel(msg.postId);
      channel.postMessage(msg);
    } catch {}

    // 2. Storage event bus fallback for isolated contexts
    try {
      localStorage.setItem(
        `kltn_live_bus_${msg.postId}`,
        JSON.stringify({ ...msg, _t: Date.now() + Math.random() })
      );
    } catch {}

    // 3. WebSocket signaling through Call WebSocket broker
    if (callWebSocketService.isConnected()) {
      callWebSocketService.sendSignal(msg.postId, msg.targetId || null, msg.type as any, {
        sdp: msg.sdp,
        candidate: msg.candidate,
      });
    }
  }

  // --- HOST (BROADCASTER) API ---
  public registerHostStream(
    postId: string,
    hostUserId: string,
    stream: MediaStream,
    onViewerCountChange?: (count: number) => void
  ): () => void {
    this.hostSessions.set(postId, {
      stream,
      peers: new Map(),
      onViewerCountChange,
    });

    // Ensure WebSocket room subscription
    if (callWebSocketService.isConnected()) {
      const unsub = callWebSocketService.subscribeCallRoom(postId, (sig: any) => {
        this.handleSignal({
          type: sig.signalType as any,
          postId,
          senderId: sig.senderId,
          targetId: sig.targetUserId,
          sdp: sig.sdp,
          candidate: sig.candidate,
        });
      });
      this.wsUnsubs.set(postId, unsub);
    }

    // Listen to local storage bus fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === `kltn_live_bus_${postId}` && e.newValue) {
        try {
          const sig = JSON.parse(e.newValue);
          if (sig.senderId !== hostUserId) {
            this.handleSignal(sig);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      const host = this.hostSessions.get(postId);
      if (host) {
        host.peers.forEach((peer) => {
          try { peer.close(); } catch {}
        });
      }
      this.hostSessions.delete(postId);

      const wsUnsub = this.wsUnsubs.get(postId);
      if (wsUnsub) {
        wsUnsub();
        this.wsUnsubs.delete(postId);
      }

      const ch = this.channels.get(postId);
      if (ch) {
        ch.close();
        this.channels.delete(postId);
      }
    };
  }

  // --- VIEWER API ---
  public subscribeViewer(
    postId: string,
    viewerUserId: string,
    onStream: (stream: MediaStream) => void,
    onViewerCount?: (count: number) => void
  ): () => void {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    peer.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onStream(event.streams[0]);
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({
          type: 'CANDIDATE',
          postId,
          senderId: viewerUserId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    this.viewerSessions.set(postId, { peer, onStream, onViewerCount });

    // Ensure WebSocket room subscription
    if (callWebSocketService.isConnected()) {
      const unsub = callWebSocketService.subscribeCallRoom(postId, (sig: any) => {
        this.handleSignal({
          type: sig.signalType as any,
          postId,
          senderId: sig.senderId,
          targetId: sig.targetUserId,
          sdp: sig.sdp,
          candidate: sig.candidate,
        });
      });
      this.wsUnsubs.set(postId, unsub);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === `kltn_live_bus_${postId}` && e.newValue) {
        try {
          const sig = JSON.parse(e.newValue);
          if (sig.senderId !== viewerUserId) {
            this.handleSignal(sig);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // Send Join Live request to host
    this.sendSignal({
      type: 'JOIN_LIVE',
      postId,
      senderId: viewerUserId,
    });

    return () => {
      window.removeEventListener('storage', handleStorage);
      this.sendSignal({
        type: 'LEAVE_LIVE',
        postId,
        senderId: viewerUserId,
      });

      try { peer.close(); } catch {}
      this.viewerSessions.delete(postId);
    };
  }

  private async handleSignal(msg: LiveSignalMessage) {
    if (!msg || !msg.postId) return;

    // --- Host handling viewer requests ---
    const host = this.hostSessions.get(msg.postId);
    if (host) {
      if (msg.type === 'JOIN_LIVE') {
        const viewerId = msg.senderId;
        let peer = host.peers.get(viewerId);
        if (peer) {
          try { peer.close(); } catch {}
        }

        peer = new RTCPeerConnection(ICE_SERVERS);
        host.stream.getTracks().forEach((track) => {
          peer!.addTrack(track, host.stream);
        });

        peer.onicecandidate = (event) => {
          if (event.candidate) {
            this.sendSignal({
              type: 'CANDIDATE',
              postId: msg.postId,
              senderId: 'host',
              targetId: viewerId,
              candidate: event.candidate.toJSON(),
            });
          }
        };

        peer.onconnectionstatechange = () => {
          if (peer!.connectionState === 'disconnected' || peer!.connectionState === 'closed' || peer!.connectionState === 'failed') {
            host.peers.delete(viewerId);
            const count = host.peers.size;
            host.onViewerCountChange?.(count);
            this.sendSignal({ type: 'VIEWER_COUNT', postId: msg.postId, senderId: 'host', viewerCount: count });
          }
        };

        host.peers.set(viewerId, peer);

        const offer = await peer.createOffer({
          offerToReceiveAudio: false,
          offerToReceiveVideo: false,
        });
        await peer.setLocalDescription(offer);

        this.sendSignal({
          type: 'OFFER',
          postId: msg.postId,
          senderId: 'host',
          targetId: viewerId,
          sdp: offer,
        });

        const activeCount = host.peers.size;
        host.onViewerCountChange?.(activeCount);
        this.sendSignal({ type: 'VIEWER_COUNT', postId: msg.postId, senderId: 'host', viewerCount: activeCount });
        return;
      }

      if (msg.type === 'ANSWER') {
        const viewerId = msg.senderId;
        const peer = host.peers.get(viewerId);
        if (peer && msg.sdp && peer.signalingState === 'have-local-offer') {
          await peer.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
        return;
      }

      if (msg.type === 'CANDIDATE') {
        const viewerId = msg.senderId;
        const peer = host.peers.get(viewerId);
        if (peer && msg.candidate) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch {}
        }
        return;
      }

      if (msg.type === 'LEAVE_LIVE') {
        const viewerId = msg.senderId;
        const peer = host.peers.get(viewerId);
        if (peer) {
          try { peer.close(); } catch {}
          host.peers.delete(viewerId);
          const count = host.peers.size;
          host.onViewerCountChange?.(count);
          this.sendSignal({ type: 'VIEWER_COUNT', postId: msg.postId, senderId: 'host', viewerCount: count });
        }
        return;
      }
    }

    // --- Viewer handling host response ---
    const viewer = this.viewerSessions.get(msg.postId);
    if (viewer) {
      if (msg.type === 'OFFER' && msg.sdp) {
        await viewer.peer.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        const answer = await viewer.peer.createAnswer();
        await viewer.peer.setLocalDescription(answer);

        this.sendSignal({
          type: 'ANSWER',
          postId: msg.postId,
          senderId: msg.targetId || 'viewer',
          targetId: msg.senderId,
          sdp: answer,
        });
        return;
      }

      if (msg.type === 'CANDIDATE' && msg.candidate) {
        try {
          await viewer.peer.addIceCandidate(new RTCIceCandidate(msg.candidate));
        } catch {}
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
