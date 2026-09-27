import { useRef, useEffect, useState, useMemo } from 'react';
import { Post } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { useLiveStream, LiveComment } from '../../../../context/LiveStreamContext';
import { useLiveViewerStream } from './useLiveViewerStream';
import { liveStreamWebSocketService } from '../../../../services/liveStreamWebSocket';

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
    updateViewerCount,
    openStudio,
    isPostLive,
    loadPostComments,
  } = useLiveStream();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<LiveComment | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const isPostLiveActive = isPostLive(post);
  const isHost = activeBroadcast.isBroadcasting && (activeBroadcast.postId === post.id || user?.id === post.userId);

  // Hook up WebRTC viewer stream when watching someone else's live stream
  const viewerStream = useLiveViewerStream(
    !isHost && isPostLiveActive ? post.id : '',
    post.userId,
    post.content
  );

  const isLive = isHost
    ? activeBroadcast.isBroadcasting
    : isPostLiveActive && !viewerStream.hasEnded && (!viewerStream.isChecking || viewerStream.isConnected);

  // Auto-subscribe viewer to WebSocket room for real-time comments & reactions
  useEffect(() => {
    if (!post.id || !isLive) return;
    const unsub = liveStreamWebSocketService.subscribeRoom(post.id);
    return () => {
      unsub();
    };
  }, [post.id, isLive]);

  // Load existing comments and sync periodically while live
  useEffect(() => {
    if (!post.id || !isLive) return;
    loadPostComments(post.id);
    const interval = setInterval(() => {
      loadPostComments(post.id);
    }, 2500);
    return () => clearInterval(interval);
  }, [post.id, isLive, loadPostComments]);

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

  const handleStartReply = (comment: LiveComment) => {
    setReplyingTo(comment);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    sendLiveComment(
      post.id,
      commentInput,
      replyingTo ? { authorName: replyingTo.authorName, content: replyingTo.content } : undefined
    );
    setCommentInput('');
    setReplyingTo(null);
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
    const lines = (post.content || '').split('\n');
    const firstLine = lines[0] || '';
    return (
      firstLine
        .replace(/^🔴\s*\[ĐANG PHÁT TRỰC TIẾP\]\s*/i, '')
        .replace(/^(?:⏹\s*)?\[ĐÃ KẾT THÚC\]\s*/i, '')
        .trim() || 'Phát trực tiếp'
    );
  }, [post.content]);

  const effectiveViewerCount = isHost ? activeBroadcast.viewerCount : viewerStream.viewerCount;

  return {
    containerRef,
    inputRef,
    isLive,
    isHost,
    activeBroadcast,
    viewerStream,
    effectiveViewerCount,
    comments,
    reactions,
    commentInput,
    setCommentInput,
    replyingTo,
    setReplyingTo,
    formattedTime,
    showEndConfirm,
    setShowEndConfirm,
    cleanTitle,
    handleStartReply,
    handleCancelReply,
    handleSendComment,
    handleToggleFullscreen,
    stopBroadcast,
    toggleCamera,
    toggleMic,
    sendLiveReaction,
    updateViewerCount,
    openStudio,
  };
};

