import { useState, useCallback, useMemo, useEffect } from 'react';
import { LiveComment } from '../../../context/LiveStreamContext';
import { callService } from '../../../services/callService';
import { fetchAuthorProfile } from '../../../services/userService';
import { liveWebRtcService } from '../../../services/liveWebRtcService';
import { updateHostRoomSettings, useLiveRoomSettings } from '../../../services/liveRoomSettings';
import { BannedViewerItem } from './HostStudioAudienceList';

export interface LiveViewerItem {
  id: string;
  name: string;
  avatar?: string;
}

const VIEWER_POLL_MS = 5000;

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
  // Cài đặt phòng được phát tới mọi người xem (xem services/liveRoomSettings)
  const { slowModeSeconds, reactionsEnabled: isReactionsEnabled } = useLiveRoomSettings(postId);
  const setSlowModeSeconds = useCallback(
    (sec: 0 | 5 | 10) => postId && updateHostRoomSettings(postId, { slowModeSeconds: sec }),
    [postId],
  );
  const setIsReactionsEnabled = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      if (!postId) return;
      const value = typeof next === 'function' ? next(isReactionsEnabled) : next;
      updateHostRoomSettings(postId, { reactionsEnabled: value });
    },
    [postId, isReactionsEnabled],
  );
  const [viewers, setViewers] = useState<LiveViewerItem[]>([]);
  const [copiedCommentId, setCopiedCommentId] = useState<string | null>(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState<Set<string>>(new Set());
  const [bannedUsers, setBannedUsers] = useState<BannedViewerItem[]>([]);

  // Danh sách người đang xem + người đã bị mời ra, lấy từ máy chủ (tải lại trang vẫn đúng)
  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    const toItem = async (userId: string): Promise<LiveViewerItem> => {
      const prof = await fetchAuthorProfile(userId).catch(() => null);
      return { id: userId, name: prof?.name || 'Người xem', avatar: prof?.avatar || undefined };
    };
    const load = async () => {
      const session = await callService.getCallSessionByPost(postId).catch(() => null);
      if (cancelled || !session || !Array.isArray(session.participants)) return;
      const others = session.participants.filter((p) => String(p.userId) !== String(session.hostUserId));
      const connected = others.filter((p) => p.status === 'CONNECTED').map((p) => String(p.userId));
      const banned = others.filter((p) => p.status === 'BANNED').map((p) => String(p.userId));
      const [v, b] = await Promise.all([Promise.all(connected.map(toItem)), Promise.all(banned.map(toItem))]);
      if (cancelled) return;
      setViewers(v);
      setBannedUsers(b);
    };
    load();
    const timer = setInterval(load, VIEWER_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [postId]);

  // Filtered comments (respecting deleted & host-only filter)
  const visibleComments = useMemo(() => {
    return comments.filter((c) => {
      if (deletedCommentIds.has(c.id)) return false;
      // Hide comments from banned users
      if (c.authorId && bannedUsers.some((b) => b.id === c.authorId)) return false;

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
      setViewers((prev) => prev.filter((v) => v.id !== userId));

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
      if (postId) liveWebRtcService.allowViewer(postId, userId);

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
    viewers,
    visibleComments,
    handlePinComment,
    handleUnpinComment,
    handleDeleteComment,
    handleCopyComment,
    handleBanViewer,
    handleUnbanViewer,
  };
};
