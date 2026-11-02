import { useState, useEffect, useRef } from 'react';
import { liveWebRtcService } from '../../../../services/liveWebRtcService';
import { callService } from '../../../../services/callService';
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
  // Đã xem được rồi nhưng chủ phòng rớt kết nối: chờ chủ phòng quay lại chứ chưa kết thúc
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Check persistent storage, but only if post content doesn't explicitly declare it's still live
  const contentIsExplicitlyLive = Boolean(rawContent && rawContent.includes('[ĐANG PHÁT TRỰC TIẾP]'));
  const isAlreadyEnded = !postId || (!contentIsExplicitlyLive && getStoredEndedStreamIds().has(postId));
  const [hasEnded, setHasEnded] = useState(isAlreadyEnded);
  const [isChecking, setIsChecking] = useState(!isAlreadyEnded);

  const isConnectedRef = useRef(false);
  const viewerIdRef = useRef(
    user?.id || 'viewer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  );

  useEffect(() => {
    if (!postId) return;
    if (!contentIsExplicitlyLive && getStoredEndedStreamIds().has(postId)) {
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
          if (session && session.status === 'ENDED') {
            markEnded();
            return;
          }
        } catch {
          // Mạng chập chờn: cứ thử tiếp
        }
        if (!active || isConnectedRef.current) return;
        stopViewer?.();
        connect();
      }, RECONNECT_INTERVAL_MS);
    };

    // 1. Check Backend Call Session status
    const checkBackendSession = (retries = 3) => {
      callService
        .getCallSessionByPost(postId)
        .then((session) => {
          if (!active) return;
          if (session && session.status === 'ENDED') {
            markEnded();
            return;
          }
          if (session) {
            setIsChecking(false);
            registeredSessionId = session.callSessionId;
            if (Array.isArray(session.participants) && session.participants.length > 0) {
              setViewerCount(session.participants.length);
            }
            callService.joinCallByPost(postId).catch(() => {});
          } else if (retries > 0) {
            setTimeout(() => {
              if (active) checkBackendSession(retries - 1);
            }, 2000);
          } else {
            setIsChecking(false);
          }
        })
        .catch(() => {
          if (!active) return;
          if (retries > 0) {
            setTimeout(() => {
              if (active) checkBackendSession(retries - 1);
            }, 2000);
          } else {
            setIsChecking(false);
          }
        });
    };

    checkBackendSession();

    // 2. Connect via WebRTC signaling
    const connect = () => {
      stopViewer = liveWebRtcService.subscribeViewer(
        postId,
        viewerIdRef.current,
        (stream) => {
          if (!active) return;
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
        // Chủ phòng chủ động kết thúc qua tín hiệu END_CALL
        () => {
          if (!active) return;
          isConnectedRef.current = false;
          markEnded();
        },
        // Mất kết nối tới chủ phòng
        () => {
          if (!active) return;
          if (!isConnectedRef.current) {
            // Chưa nối được: giữ kết nối thử tiếp
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
      stopReconnecting();
      stopViewer?.();
      if (registeredSessionId) {
        callService.leaveCall(registeredSessionId).catch(() => {});
      }
    };
  }, [postId, postAuthorId, rawContent, user?.id, contentIsExplicitlyLive]);

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
