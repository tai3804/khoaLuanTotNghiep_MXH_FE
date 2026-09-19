import React, { useState, useEffect, useRef } from 'react';
import { NotificationItem } from '../../../types/notification';
import { useNotification } from '../../../context/NotificationContext';
import { useLanguage } from '../../../context/LanguageContext';
import { fetchAuthorProfile, authorProfileCache, userService } from '../../../services/userService';

interface UseNotificationDropdownDataProps {
  onClose: () => void;
  onNavigateSettings?: () => void;
  onNavigateTarget?: (url: string) => void;
}

export const useNotificationDropdownData = ({
  onClose,
  onNavigateSettings,
  onNavigateTarget,
}: UseNotificationDropdownDataProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismissNotification, loading } = useNotification();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [actorProfiles, setActorProfiles] = useState<Record<string, { name: string; avatar: string }>>({});
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [friendActionStatus, setFriendActionStatus] = useState<Record<string, 'accepted' | 'rejected'>>({});

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

    Promise.all(
      toFetch.map(async (id) => {
        try {
          const profile = await fetchAuthorProfile(id);
          return { id, profile };
        } catch {
          return { id, profile: null };
        }
      })
    ).then((results) => {
      setActorProfiles((prev) => {
        const next = { ...prev };
        results.forEach(({ id, profile }) => {
          if (profile) next[id] = profile;
        });
        return next;
      });
    });
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
    if (!item.actorId) return;
    try {
      await userService.acceptFriendRequest(item.actorId);
      setFriendActionStatus((prev) => ({ ...prev, [item.id]: 'accepted' }));
      if (!item.isRead) markAsRead(item.id);
    } catch (err) {
      console.error('Failed to accept friend request:', err);
    }
  };

  const handleRejectFriend = async (e: React.MouseEvent, item: NotificationItem) => {
    e.stopPropagation();
    if (!item.actorId) return;
    try {
      await userService.rejectFriendRequest(item.actorId);
      setFriendActionStatus((prev) => ({ ...prev, [item.id]: 'rejected' }));
      if (!item.isRead) markAsRead(item.id);
    } catch (err) {
      console.error('Failed to reject friend request:', err);
    }
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
