import { useState, useEffect, useRef } from 'react';
import { liveWebRtcService } from '../../../../services/liveWebRtcService';
import { callService } from '../../../../services/callService';
import { postService } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { getStoredEndedStreamIds, saveStoredEndedStreamId } from '../../../../context/LiveStreamContext';

export const useLiveViewerStream = (postId: string, postAuthorId?: string, rawContent?: string) => {
  const { user } = useAuth();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  // Check immediately from persistent storage if this stream has already ended
  const isAlreadyEnded = !postId || getStoredEndedStreamIds().has(postId);
  const [hasEnded, setHasEnded] = useState(isAlreadyEnded);
  const [isChecking, setIsChecking] = useState(!isAlreadyEnded);

  const isConnectedRef = useRef(false);
  const viewerIdRef = useRef(
    user?.id || 'viewer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  );

  useEffect(() => {
    if (!postId) return;
    if (getStoredEndedStreamIds().has(postId)) {
      setHasEnded(true);
      setIsChecking(false);
      return;
    }

    let active = true;
    let registeredSessionId: string | null = null;
    isConnectedRef.current = false;
    setIsConnected(false);

    const markEnded = () => {
      if (!active) return;
      setHasEnded(true);
      setIsChecking(false);
      saveStoredEndedStreamId(postId);

      // If current user is author, sync post content in post-service database to permanently mark ended
      if (
        user?.id &&
        postAuthorId &&
        user.id === postAuthorId &&
        rawContent &&
        rawContent.includes('[ĐANG PHÁT TRỰC TIẾP]')
      ) {
        const updatedContent = rawContent.replace(/🔴\s*\[ĐANG PHÁT TRỰC TIẾP\]/i, '⏹ [ĐÃ KẾT THÚC]');
        postService.updatePost(postId, { content: updatedContent }).catch(() => {});
      }
    };

    // 1. Verify and register with Backend Room Session
    callService
      .getCallSessionByPost(postId)
      .then((session) => {
        if (!active) return;
        // If session not found, or session is not active (ENDED, MISSED, REJECTED)
        if (!session || session.status === 'ENDED' || (session.status !== 'ACTIVE' && session.status !== 'INITIATED')) {
          markEnded();
          return;
        }
        setIsChecking(false);
        registeredSessionId = session.callSessionId;
        if (Array.isArray(session.participants) && session.participants.length > 0) {
          setViewerCount(session.participants.length);
        }
        // Register viewer on Backend database
        callService.joinCallByPost(postId).catch(() => {});
      })
      .catch(() => {
        if (!active) return;
        markEnded();
      });

    // Timeout: if no host responds with media stream within 3.5 seconds, mark ended
    const connectionTimeout = setTimeout(() => {
      if (active && !isConnectedRef.current) {
        markEnded();
      }
    }, 3500);

    const cleanup = liveWebRtcService.subscribeViewer(
      postId,
      viewerIdRef.current,
      (stream) => {
        if (!active) return;
        clearTimeout(connectionTimeout);
        isConnectedRef.current = true;
        setRemoteStream(stream);
        setIsConnected(true);
        setHasEnded(false);
        setIsChecking(false);
      },
      (count) => {
        if (!active) return;
        setViewerCount(count);
      },
      () => {
        if (!active) return;
        isConnectedRef.current = false;
        markEnded();
        setIsConnected(false);
        setRemoteStream(null);
      }
    );

    return () => {
      active = false;
      clearTimeout(connectionTimeout);
      cleanup();
      if (registeredSessionId) {
        callService.leaveCall(registeredSessionId).catch(() => {});
      }
    };
  }, [postId, postAuthorId, rawContent, user?.id]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return {
    remoteStream,
    isMuted,
    viewerCount,
    isConnected,
    hasEnded,
    isChecking,
    toggleMute,
  };
};
