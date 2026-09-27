import { useState, useEffect, useRef } from 'react';
import { liveWebRtcService } from '../../../../services/liveWebRtcService';
import { useAuth } from '../../../../context/AuthContext';

export const useLiveViewerStream = (postId: string) => {
  const { user } = useAuth();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  const viewerIdRef = useRef(
    user?.id || 'viewer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
  );

  useEffect(() => {
    let active = true;

    const cleanup = liveWebRtcService.subscribeViewer(
      postId,
      viewerIdRef.current,
      (stream) => {
        if (!active) return;
        setRemoteStream(stream);
        setIsConnected(true);
      },
      (count) => {
        if (!active) return;
        setViewerCount(count);
      }
    );

    return () => {
      active = false;
      cleanup();
    };
  }, [postId]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return {
    remoteStream,
    isMuted,
    viewerCount,
    isConnected,
    toggleMute,
  };
};
