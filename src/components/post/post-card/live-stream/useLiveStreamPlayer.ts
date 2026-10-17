import { useRef, useEffect, useState, useMemo } from 'react';
import { Post } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { useLiveStream, LiveComment } from '../../../../context/LiveStreamContext';
import { useLiveViewerStream } from './useLiveViewerStream';
import { liveStreamWebSocketService } from '../../../../services/liveStreamWebSocket';
import { formatElapsed } from '../../../../utils/timeAgo';

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

  // Load initial comments on mount (real-time comments arrive via WebSocket)
  useEffect(() => {
    if (!post.id || !isLive) return;
    loadPostComments(post.id);
  }, [post.id, isLive, loadPostComments]);

  const comments = liveCommentsMap[post.id] || [];
  const reactions = liveReactionsMap[post.id] || [];

  // Đồng hồ thời lượng phát. Mốc bắt đầu: chủ phòng dùng lúc bấm phát (đồng hồ máy mình); người xem, hoặc chủ phòng
  // sau khi tải lại trang, dùng giờ đăng bài (bài live được đăng đúng lúc bắt đầu phát) nên đồng hồ luôn khớp với
  // "x phút trước" của bài, thay vì chỉ đếm từ lúc thẻ bài được mở trên màn hình người xem.
  useEffect(() => {
    if (!isLive) return;
    const postStart = post.createdAtRaw ? new Date(post.createdAtRaw).getTime() : NaN;
    const start = (isHost ? activeBroadcast.startedAt : null) ?? (Number.isNaN(postStart) ? Date.now() : postStart);
    const tick = () => setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [isLive, isHost, activeBroadcast.startedAt, post.createdAtRaw]);

  const formattedTime = useMemo(() => formatElapsed(elapsedSeconds), [elapsedSeconds]);

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

