import { useState, useEffect, useRef } from 'react';
import { liveWebRtcService } from '../../../../services/liveWebRtcService';
import { callService } from '../../../../services/callService';
import { postService } from '../../../../services/api';
import { useAuth } from '../../../../context/AuthContext';
import { getStoredEndedStreamIds, saveStoredEndedStreamId } from '../../../../context/LiveStreamContext';
import { VIEWER_RECONNECT_GRACE_MS, readResumableHostLiveSession } from '../../../../utils/liveHostSession';

/** Chu kỳ thử nối lại với chủ phòng khi đang chờ. */
const RECONNECT_INTERVAL_MS = 3000;

export const useLiveViewerStream = (postId: string, postAuthorId?: string, rawContent?: string) => {
  const { user } = useAuth();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  // Đã xem được rồi nhưng chủ phòng rớt kết nối (tải lại trang, mất mạng): chờ chủ phòng quay lại chứ chưa kết thúc
  const [isReconnecting, setIsReconnecting] = useState(false);

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
    let stopViewer: (() => void) | null = null;
    let reconnectTimer: ReturnType<typeof setInterval> | undefined;
    let reconnectDeadline: ReturnType<typeof setTimeout> | undefined;
    isConnectedRef.current = false;
    setIsConnected(false);
    setIsReconnecting(false);

    const stopReconnecting = () => {
      clearInterval(reconnectTimer);
      clearTimeout(reconnectDeadline);
      reconnectTimer = undefined;
      reconnectDeadline = undefined;
    };

    const markEnded = () => {
      if (!active) return;
      stopReconnecting();
      setIsReconnecting(false);
      setIsConnected(false);
      setRemoteStream(null);
      setHasEnded(true);
      setIsChecking(false);
      saveStoredEndedStreamId(postId);

      // Tác giả mà phiên của chính mình đang được giữ chờ nối lại thì tuyệt đối không ghi "đã kết thúc" vào bài viết
      const hostMayResume = readResumableHostLiveSession()?.postId === postId;

      // If current user is author, sync post content in post-service database to permanently mark ended
      if (
        !hostMayResume &&
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

    // Chủ phòng rớt kết nối: thử nối lại định kỳ cho tới khi chủ phòng quay lại, phòng đóng hẳn, hoặc hết thời gian chờ
    const startReconnecting = () => {
      if (reconnectTimer) return;
      reconnectDeadline = setTimeout(markEnded, VIEWER_RECONNECT_GRACE_MS);
      reconnectTimer = setInterval(async () => {
        if (!active) return;
        try {
          const session = await callService.getCallSessionByPost(postId);
          if (!active) return;
          if (!session || session.status === 'ENDED') {
            markEnded();
            return;
          }
        } catch {
          // mạng chập chờn: cứ thử tiếp
        }
        if (!active || isConnectedRef.current) return;
        stopViewer?.();
        connect();
      }, RECONNECT_INTERVAL_MS);
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

    const connect = () => {
      stopViewer = liveWebRtcService.subscribeViewer(
        postId,
        viewerIdRef.current,
        (stream) => {
          if (!active) return;
          clearTimeout(connectionTimeout);
          stopReconnecting();
          isConnectedRef.current = true;
          setRemoteStream(stream);
          setIsConnected(true);
          setIsReconnecting(false);
          setHasEnded(false);
          setIsChecking(false);
        },
        (count) => {
          if (!active) return;
          setViewerCount(count);
        },
        // Chủ phòng chủ động kết thúc
        () => {
          if (!active) return;
          isConnectedRef.current = false;
          markEnded();
        },
        // Kết nối tới chủ phòng bị đứt
        () => {
          if (!active) return;
          if (!isConnectedRef.current) {
            // Chưa từng nối được: nếu đang chờ nối lại thì bỏ qua lần thử hỏng này, không thì coi như chủ phòng không còn phát
            if (!reconnectTimer) markEnded();
            return;
          }
          isConnectedRef.current = false;
          setIsConnected(false);
          setRemoteStream(null);
          setIsReconnecting(true);
          startReconnecting();
        }
      );
    };

    connect();

    return () => {
      active = false;
      clearTimeout(connectionTimeout);
      stopReconnecting();
      stopViewer?.();
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
    isReconnecting,
    hasEnded,
    isChecking,
    toggleMute,
  };
};
