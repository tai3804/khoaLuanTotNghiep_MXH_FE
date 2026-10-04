import { useState, useRef, useEffect, useMemo } from 'react';
import { useLiveStream, LiveComment } from '../../context/LiveStreamContext';
import { useAuth } from '../../context/AuthContext';

export const useHostLiveStudio = () => {
  const { user } = useAuth();
  const {
    activeBroadcast,
    liveCommentsMap,
    liveReactionsMap,
    isStudioOpen,
    isStudioMinimized,
    setIsStudioOpen,
    setIsStudioMinimized,
    toggleCamera,
    toggleMic,
    stopBroadcast,
    sendLiveComment,
    sendLiveReaction,
    loadPostComments,
  } = useLiveStream();

  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<LiveComment | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const postId = activeBroadcast.postId;
  const isBroadcasting = activeBroadcast.isBroadcasting && Boolean(postId);

  // Load existing comments on mount (real-time comments arrive via WebSocket)
  useEffect(() => {
    if (!postId) return;
    loadPostComments(postId);
  }, [postId, loadPostComments]);

  const comments = useMemo(() => {
    return postId ? liveCommentsMap[postId] || [] : [];
  }, [postId, liveCommentsMap]);

  const reactions = useMemo(() => {
    return postId ? liveReactionsMap[postId] || [] : [];
  }, [postId, liveReactionsMap]);

  // Duration timer
  useEffect(() => {
    if (!isBroadcasting) {
      setElapsedSeconds(0);
      return;
    }

    const start = activeBroadcast.startedAt || Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isBroadcasting, activeBroadcast.startedAt]);

  // Auto scroll chat list to bottom when new comment arrives
  useEffect(() => {
    if (comments.length > 0 && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

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
    if (!commentInput.trim() || !postId) return;
    sendLiveComment(
      postId,
      commentInput,
      replyingTo ? { authorName: replyingTo.authorName, content: replyingTo.content } : undefined
    );
    setCommentInput('');
    setReplyingTo(null);
  };

  const handleSendReaction = (emoji: string) => {
    if (!postId) return;
    sendLiveReaction(postId, emoji);
  };

  const handleEndBroadcast = () => {
    if (postId) {
      stopBroadcast(postId);
    } else {
      stopBroadcast();
    }
    setShowEndConfirm(false);
    setIsStudioOpen(false);
  };

  return {
    user,
    activeBroadcast,
    isBroadcasting,
    isStudioOpen,
    isStudioMinimized,
    setIsStudioOpen,
    setIsStudioMinimized,
    comments,
    reactions,
    commentInput,
    setCommentInput,
    replyingTo,
    setReplyingTo,
    inputRef,
    showEndConfirm,
    setShowEndConfirm,
    formattedTime,
    chatBottomRef,
    toggleCamera,
    toggleMic,
    handleStartReply,
    handleCancelReply,
    handleSendComment,
    handleSendReaction,
    handleEndBroadcast,
  };
};
