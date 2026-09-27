import { useRef, useEffect, useState, useMemo } from 'react';
import { Post } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { useLiveStream } from '../../../../context/LiveStreamContext';
import { useLiveViewerStream } from './useLiveViewerStream';

export const useLiveStreamPlayer = (post: Post) => {
  const { user } = useAuth();
  const {
    activeBroadcast,
    liveCommentsMap,
    liveReactionsMap,
    stopBroadcast,
    toggleCamera,
    toggleMic,
    sendLiveComment,
    sendLiveReaction,
    isPostLive,
  } = useLiveStream();

  const containerRef = useRef<HTMLDivElement>(null);
  const [commentInput, setCommentInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const isLive = isPostLive(post);
  const isHost = activeBroadcast.isBroadcasting && (activeBroadcast.postId === post.id || user?.id === post.userId);

  // Hook up WebRTC viewer stream when watching someone else's live stream
  const viewerStream = useLiveViewerStream(!isHost && isLive ? post.id : '');

  const comments = liveCommentsMap[post.id] || [];
  const reactions = liveReactionsMap[post.id] || [];

  // Elapsed duration counter
  useEffect(() => {
    if (!isLive) return;
    const start = activeBroadcast.startedAt || Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, activeBroadcast.startedAt]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    sendLiveComment(post.id, commentInput);
    setCommentInput('');
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const cleanTitle = useMemo(() => {
    const lines = post.content.split('\n');
    const firstLine = lines[0] || '';
    return firstLine.replace(/^🔴\s*\[ĐANG PHÁT TRỰC TIẾP\]\s*/i, '').trim() || 'Phát trực tiếp';
  }, [post.content]);

  const effectiveViewerCount = isHost ? activeBroadcast.viewerCount : viewerStream.viewerCount;

  return {
    containerRef,
    isLive,
    isHost,
    activeBroadcast,
    viewerStream,
    effectiveViewerCount,
    comments,
    reactions,
    commentInput,
    setCommentInput,
    formattedTime,
    showEndConfirm,
    setShowEndConfirm,
    cleanTitle,
    handleSendComment,
    handleToggleFullscreen,
    stopBroadcast,
    toggleCamera,
    toggleMic,
    sendLiveReaction,
  };
};

