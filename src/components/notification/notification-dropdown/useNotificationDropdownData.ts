import React, { useState, useEffect, useRef } from 'react';
import { NotificationItem } from '../../../types/notification';
import { useNotification } from '../../../context/NotificationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { fetchAuthorProfile, authorProfileCache, userService, myFriendIdsMemoryCache } from '../../../services/userService';
import { postService } from '../../../services/postService';

interface UseNotificationDropdownDataProps {
  onClose: () => void;
  onNavigateSettings?: () => void;
  onNavigateTarget?: (url: string) => void;
}

const loadSavedFriendStatus = (): Record<string, 'accepted' | 'rejected'> => {
  try {
    const raw = localStorage.getItem('friend_action_status') || sessionStorage.getItem('friend_action_status');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveFriendStatus = (map: Record<string, 'accepted' | 'rejected'>) => {
  try {
    localStorage.setItem('friend_action_status', JSON.stringify(map));
    sessionStorage.setItem('friend_action_status', JSON.stringify(map));
  } catch {}
};

const extractCandidateIds = (item: NotificationItem): string[] => {
  let cleanUrlId = '';
  if (item.targetUrl) {
    const match = item.targetUrl.match(/\/profile\/([a-zA-Z0-9_-]+)/);
    if (match) cleanUrlId = match[1];
  }
  return [
    item.actorId,
    item.targetId,
    cleanUrlId,
    item.id,
  ].filter((id): id is string => Boolean(id && id !== 'me'));
};

export const useNotificationDropdownData = ({
  onClose,
  onNavigateSettings,
  onNavigateTarget,
}: UseNotificationDropdownDataProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification, loading } = useNotification();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const toast = useToast();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [actorProfiles, setActorProfiles] = useState<Record<string, { name: string; avatar: string }>>({});
  const [actorReactions, setActorReactions] = useState<Record<string, string>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [friendActionStatus, setFriendActionStatus] = useState<Record<string, 'accepted' | 'rejected'>>(loadSavedFriendStatus);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch actor profiles for notifications that have actorId
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const actorIds = notifications
      .map((n) => n.actorId)
      .filter((id): id is string => Boolean(id && id !== 'me'));

    const uniqueIds = Array.from(new Set(actorIds));
    const toFetch = uniqueIds.filter((id) => !actorProfiles[id] && !authorProfileCache[id]);

    // Prepopulate from existing cache
    const initialFromCache: Record<string, { name: string; avatar: string }> = {};
    uniqueIds.forEach((id) => {
      if (authorProfileCache[id]) {
        initialFromCache[id] = authorProfileCache[id];
      }
    });
    if (Object.keys(initialFromCache).length > 0) {
      setActorProfiles((prev) => ({ ...initialFromCache, ...prev }));
    }

    if (toFetch.length === 0) return;

    userService.getProfilesBatch(toFetch).then((batchResults) => {
      if (batchResults && Object.keys(batchResults).length > 0) {
        setActorProfiles((prev) => ({ ...prev, ...batchResults }));
      }
    });
  }, [notifications]);

  // Resolve reaction types for LIKE_POST notifications (Zero-HTTP call via Denormalization)
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const likeNotifs = notifications.filter(
      (n) => n.type === 'LIKE_POST' && n.targetId && n.actorId
    );

    if (likeNotifs.length === 0) return;

    const immediateMap: Record<string, string> = {};

    likeNotifs.forEach((n) => {
      let resolvedType: string | null = null;

      // 1. Chuẩn hóa: Trường reactionType đã được lưu dưới DB dạng Enum text (LOVE, LIKE, HAHA...)
      if (n.reactionType) {
        resolvedType = n.reactionType.toUpperCase();
      }

      // 2. Fallback: Query param trên targetUrl (?reaction=...)
      if (!resolvedType && n.targetUrl) {
        const match = n.targetUrl.match(/[?&]reaction=([A-Za-z]+)/i);
        if (match) {
          resolvedType = match[1].toUpperCase();
        }
      }

      // 3. Mặc định là LIKE nếu không có thông tin
      const finalType = resolvedType || 'LIKE';
      immediateMap[n.id] = finalType;
      if (n.targetId && n.actorId) {
        immediateMap[`${n.targetId}_${n.actorId}`] = finalType;
      }
    });

    if (Object.keys(immediateMap).length > 0) {
      setActorReactions((prev) => ({ ...prev, ...immediateMap }));
    }
  }, [notifications]);

  // Sync with existing friends from in-memory cache and warm up if needed
  useEffect(() => {
    const syncWithCache = () => {
      if (myFriendIdsMemoryCache.size === 0) return;
      setFriendActionStatus((prev) => {
        let changed = false;
        const next = { ...prev };
        notifications.forEach((n) => {
          if (n.type === 'FRIEND_REQUEST') {
            const ids = extractCandidateIds(n);
            if (ids.some((id) => myFriendIdsMemoryCache.has(id.toLowerCase()))) {
              ids.forEach((id) => {
                if (next[id] !== 'accepted') {
                  next[id] = 'accepted';
                  changed = true;
                }
              });
            }
          }
        });
        if (changed) {
          saveFriendStatus(next);
          return next;
        }
        return prev;
      });
    };

    if (myFriendIdsMemoryCache.size > 0) {
      syncWithCache();
    } else {
      userService.getFriends().then(() => {
        syncWithCache();
      }).catch(() => {});
    }
  }, [notifications]);

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.isRead;
    return true;
  });

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    onClose();

    if (item.targetUrl && onNavigateTarget) {
      onNavigateTarget(item.targetUrl);
    }
  };

  const handleAcceptFriend = async (e: React.MouseEvent, item: NotificationItem) => {
    e.stopPropagation();
    const candidateIds = extractCandidateIds(item);
    const targetUserId = candidateIds[0];
    if (!targetUserId) {
      console.warn('Cannot accept friend request: no actorId or targetId found', item);
      return;
    }

    // Optimistically mark as accepted in UI & memory caches immediately
    setFriendActionStatus((prev) => {
      const next = { ...prev, [item.id]: 'accepted' as const };
      candidateIds.forEach((id) => {
        next[id] = 'accepted';
      });
      saveFriendStatus(next);
      return next;
    });
    candidateIds.forEach((id) => myFriendIdsMemoryCache.add(id.toLowerCase()));
    if (!item.isRead) markAsRead(item.id);

    let success = false;
    for (const candidateId of candidateIds) {
      try {
        await userService.acceptFriendRequest(candidateId);
        success = true;
        break;
      } catch (err: any) {
        const msg = String(err.response?.data?.message || err.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('đã') || msg.includes('exist')) {
          success = true;
          break;
        }
      }
    }

    if (success) {
      toast.showSuccess(isEn ? 'Friend request accepted!' : 'Đã chấp nhận lời mời kết bạn!');
      window.dispatchEvent(new CustomEvent('friend_status_updated'));
    } else {
      toast.showError(isEn ? 'Failed to accept friend request' : 'Không thể chấp nhận lời mời kết bạn');
    }
  };

  const handleRejectFriend = async (e: React.MouseEvent, item: NotificationItem) => {
    e.stopPropagation();
    const candidateIds = extractCandidateIds(item);
    const targetUserId = candidateIds[0];
    if (!targetUserId) return;

    // Optimistically mark as rejected in UI
    setFriendActionStatus((prev) => {
      const next = { ...prev, [item.id]: 'rejected' as const };
      candidateIds.forEach((id) => {
        next[id] = 'rejected';
      });
      saveFriendStatus(next);
      return next;
    });
    if (!item.isRead) markAsRead(item.id);

    for (const candidateId of candidateIds) {
      try {
        await userService.rejectFriendRequest(candidateId);
        break;
      } catch {}
    }
    toast.showInfo(isEn ? 'Friend request removed' : 'Đã xóa lời mời kết bạn');
    window.dispatchEvent(new CustomEvent('friend_status_updated'));
  };

  return {
    menuRef,
    isEn,
    notifications,
    unreadCount,
    loading,
    activeFilter,
    setActiveFilter,
    actorProfiles,
    actorReactions,
    activeMenuId,
    setActiveMenuId,
    headerMenuOpen,
    setHeaderMenuOpen,
    friendActionStatus,
    filteredNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    handleItemClick,
    handleAcceptFriend,
    handleRejectFriend,
  };
};
