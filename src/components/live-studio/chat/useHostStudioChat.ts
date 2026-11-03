import { useState, useCallback, useMemo } from 'react';
import { LiveComment } from '../../../context/LiveStreamContext';

export type ChatTab = 'chat' | 'audience' | 'settings';
export type ChatFilter = 'all' | 'host_only';

export const useHostStudioChat = (
  comments: LiveComment[],
  hostName?: string
) => {
  const [activeTab, setActiveTab] = useState<ChatTab>('chat');
  const [pinnedComment, setPinnedComment] = useState<LiveComment | null>(null);
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [searchAudience, setSearchAudience] = useState('');
  const [slowModeSeconds, setSlowModeSeconds] = useState<0 | 5 | 10>(0);
  const [isReactionsEnabled, setIsReactionsEnabled] = useState(true);
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState<Set<string>>(new Set());

  // Filtered comments (respecting deleted & host-only filter)
  const visibleComments = useMemo(() => {
    return comments.filter((c) => {
      if (deletedCommentIds.has(c.id)) return false;
      if (filter === 'host_only') {
        const isHost =
          Boolean(hostName && c.authorName === hostName) ||
          c.authorName.includes('Admin') ||
          c.authorName.includes('Host');
        return isHost;
      }
      return true;
    });
  }, [comments, deletedCommentIds, filter, hostName]);

  const handlePinComment = useCallback((comment: LiveComment) => {
    setPinnedComment((prev) => (prev?.id === comment.id ? null : comment));
  }, []);

  const handleUnpinComment = useCallback(() => {
    setPinnedComment(null);
  }, []);

  const handleDeleteComment = useCallback((commentId: string) => {
    setDeletedCommentIds((prev) => {
      const next = new Set(prev);
      next.add(commentId);
      return next;
    });
    setPinnedComment((prev) => (prev?.id === commentId ? null : prev));
  }, []);

  const handleCopyComment = useCallback((content: string, commentId: string) => {
    navigator.clipboard?.writeText(content).catch(() => {});
    setCopiedCommentId(commentId);
    setTimeout(() => {
      setCopiedCommentId((prev) => (prev === commentId ? null : prev));
    }, 2000);
  }, []);

  return {
    activeTab,
    setActiveTab,
    pinnedComment,
    filter,
    setFilter,
    searchAudience,
    setSearchAudience,
    slowModeSeconds,
    setSlowModeSeconds,
    isReactionsEnabled,
    setIsReactionsEnabled,
    copiedCommentId,
    visibleComments,
    handlePinComment,
    handleUnpinComment,
    handleDeleteComment,
    handleCopyComment,
  };
};
