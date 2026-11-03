import { useState, useCallback, useMemo } from 'react';
import { LiveComment } from '../../../context/LiveStreamContext';
import { callService } from '../../../services/callService';
import { BannedViewerItem } from './HostStudioAudienceList';

export type ChatTab = 'chat' | 'audience' | 'settings';
export type ChatFilter = 'all' | 'host_only';

export const useHostStudioChat = (
  comments: LiveComment[],
  hostName?: string,
  postId?: string
) => {
  const [activeTab, setActiveTab] = useState<ChatTab>('chat');
  const [pinnedComment, setPinnedComment] = useState<LiveComment | null>(null);
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [searchAudience, setSearchAudience] = useState('');
  const [slowModeSeconds, setSlowModeSeconds] = useState<0 | 5 | 10>(0);
  const [isReactionsEnabled, setIsReactionsEnabled] = useState(true);
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState<Set<string>>(new Set());
  const [bannedUsers, setBannedUsers] = useState<BannedViewerItem[]>([]);

  // Filtered comments (respecting deleted & host-only filter)
  const visibleComments = useMemo(() => {
    return comments.filter((c) => {
      if (deletedCommentIds.has(c.id)) return false;
      // Hide comments from banned users
      if (bannedUsers.some((b) => b.id === c.id || b.name === c.authorName)) return false;

      if (filter === 'host_only') {
        const isHost =
          Boolean(hostName && c.authorName === hostName) ||
          c.authorName.includes('Admin') ||
          c.authorName.includes('Host');
        return isHost;
      }
      return true;
    });
  }, [comments, deletedCommentIds, bannedUsers, filter, hostName]);

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

  const handleBanViewer = useCallback(
    async (userId: string, userName?: string) => {
      const targetName = userName || userId;
      setBannedUsers((prev) => {
        if (prev.some((b) => b.id === userId)) return prev;
        return [...prev, { id: userId, name: targetName }];
      });

      if (postId) {
        try {
          await callService.banViewerFromPost(postId, userId);
        } catch (e) {
          console.warn('[useHostStudioChat] Ban viewer failed on server:', e);
        }
      }
    },
    [postId]
  );

  const handleUnbanViewer = useCallback(
    async (userId: string) => {
      setBannedUsers((prev) => prev.filter((b) => b.id !== userId));

      if (postId) {
        try {
          await callService.unbanViewerFromPost(postId, userId);
        } catch (e) {
          console.warn('[useHostStudioChat] Unban viewer failed on server:', e);
        }
      }
    },
    [postId]
  );

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
    bannedUsers,
    visibleComments,
    handlePinComment,
    handleUnpinComment,
    handleDeleteComment,
    handleCopyComment,
    handleBanViewer,
    handleUnbanViewer,
  };
};
