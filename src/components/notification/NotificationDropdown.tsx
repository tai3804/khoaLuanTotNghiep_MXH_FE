import React, { useState, useEffect, useRef } from 'react';
import {
  ThumbsUp,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck,
  Users,
  Phone,
  PhoneMissed,
  MessageSquare,
  Bell,
  Check,
  CheckCheck,
  Settings,
  Clock,
  Inbox,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../../types/notification';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { fetchAuthorProfile, authorProfileCache, userService } from '../../services/userService';

interface NotificationDropdownProps {
  onClose: () => void;
  onNavigateSettings?: () => void;
  onNavigateTarget?: (url: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  onNavigateSettings,
  onNavigateTarget,
}) => {
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

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'LIKE_POST':
        return {
          icon: <ThumbsUp className="w-3 h-3 text-white fill-white" />,
          bg: 'bg-[#1877f2]',
        };
      case 'COMMENT_POST':
      case 'REPLY_COMMENT':
      case 'TAG_COMMENT':
        return {
          icon: <MessageCircle className="w-3 h-3 text-white fill-white" />,
          bg: 'bg-[#20c997]',
        };
      case 'SHARE_POST':
        return {
          icon: <Share2 className="w-3 h-3 text-white" />,
          bg: 'bg-[#10b981]',
        };
      case 'FRIEND_REQUEST':
        return {
          icon: <UserPlus className="w-3 h-3 text-white" />,
          bg: 'bg-[#1877f2]',
        };
      case 'ACCEPT_FRIEND':
        return {
          icon: <UserCheck className="w-3 h-3 text-white" />,
          bg: 'bg-[#06b6d4]',
        };
      case 'FOLLOW_USER':
        return {
          icon: <Users className="w-3 h-3 text-white" />,
          bg: 'bg-[#8b5cf6]',
        };
      case 'NEW_MESSAGE':
        return {
          icon: <MessageSquare className="w-3 h-3 text-white fill-white" />,
          bg: 'bg-[#0084ff]',
        };
      case 'CALL_INCOMING':
        return {
          icon: <Phone className="w-3 h-3 text-white" />,
          bg: 'bg-[#22c55e]',
        };
      case 'CALL_MISSED':
      case 'CALL_REJECTED':
        return {
          icon: <PhoneMissed className="w-3 h-3 text-white" />,
          bg: 'bg-[#ef4444]',
        };
      case 'SYSTEM':
      default:
        return {
          icon: <Bell className="w-3 h-3 text-white fill-white" />,
          bg: 'bg-[#1877f2]',
        };
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return isEn ? 'Just now' : 'Vừa xong';
    try {
      const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
      if (diff < 60) return isEn ? 'Just now' : 'Vừa xong';
      if (diff < 3600) return `${Math.floor(diff / 60)} ${isEn ? 'm' : 'phút'}`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ${isEn ? 'h' : 'giờ'}`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} ${isEn ? 'd' : 'ngày'}`;
      return new Date(isoString).toLocaleDateString(isEn ? 'en-US' : 'vi-VN');
    } catch {
      return isEn ? 'Just now' : 'Vừa xong';
    }
  };

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

  // Helper to format content like Facebook with bold actor name and highlighted comment text
  const renderNotificationText = (item: NotificationItem, profile?: { name: string; avatar: string }) => {
    const actorName = profile?.name && profile.name !== 'Người dùng' && profile.name !== 'Thành viên KLTN'
      ? profile.name
      : '';

    let text = item.content || '';

    // Extract comment quote if present (e.g. : "...")
    let quoteText = '';
    const quoteMatch = text.match(/:\s*"([^"]*)"$/);
    if (quoteMatch) {
      quoteText = quoteMatch[1];
      text = text.slice(0, quoteMatch.index).trim();
      if (text.endsWith(':')) text = text.slice(0, -1).trim();
    }

    // If backend sent "Một người dùng..."
    if (text.startsWith('Một người dùng')) {
      const actionPart = text.replace(/^Một người dùng\s*/, '');
      return (
        <div>
          <span className="text-[13.5px] leading-snug text-gray-800 dark:text-[#e4e6eb]">
            <strong className="font-bold text-gray-900 dark:text-[#f0f2f5] hover:underline mr-1">
              {actorName || (isEn ? 'Someone' : 'Một người dùng')}
            </strong>
            <span className="text-gray-700 dark:text-[#b0b3b8]">{actionPart}</span>
          </span>
          {quoteText && (
            <p className="mt-1 text-[13px] text-gray-700 dark:text-[#d0d2d6] font-normal italic bg-gray-100/80 dark:bg-[#3a3b3c]/60 px-2.5 py-1 rounded-lg line-clamp-2 border-l-2 border-[#1877f2]">
              "{quoteText}"
            </p>
          )}
        </div>
      );
    }

    // If actorName is present and text starts with it
    if (actorName && text.startsWith(actorName)) {
      const actionPart = text.slice(actorName.length);
      return (
        <div>
          <span className="text-[13.5px] leading-snug text-gray-800 dark:text-[#e4e6eb]">
            <strong className="font-bold text-gray-900 dark:text-[#f0f2f5] hover:underline mr-1">
              {actorName}
            </strong>
            <span className="text-gray-700 dark:text-[#b0b3b8]">{actionPart}</span>
          </span>
          {quoteText && (
            <p className="mt-1 text-[13px] text-gray-700 dark:text-[#d0d2d6] font-normal italic bg-gray-100/80 dark:bg-[#3a3b3c]/60 px-2.5 py-1 rounded-lg line-clamp-2 border-l-2 border-[#1877f2]">
              "{quoteText}"
            </p>
          )}
        </div>
      );
    }

    // Fallback: render text as is or prepend actorName
    return (
      <div>
        <span className="text-[13.5px] leading-snug text-gray-800 dark:text-[#e4e6eb]">
          {actorName && (
            <strong className="font-bold text-gray-900 dark:text-[#f0f2f5] hover:underline mr-1">
              {actorName}
            </strong>
          )}
          <span className="text-gray-700 dark:text-[#b0b3b8]">{text}</span>
        </span>
        {quoteText && (
          <p className="mt-1 text-[13px] text-gray-700 dark:text-[#d0d2d6] font-normal italic bg-gray-100/80 dark:bg-[#3a3b3c]/60 px-2.5 py-1 rounded-lg line-clamp-2 border-l-2 border-[#1877f2]">
            "{quoteText}"
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-12 w-84 sm:w-96 md:w-[410px] bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] transition-all"
    >
      {/* Header - Facebook Style */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="font-bold text-2xl text-gray-900 dark:text-[#e4e6eb] tracking-tight">
            {isEn ? 'Notifications' : 'Thông báo'}
          </h2>
          {unreadCount > 0 && (
            <span className="bg-[#e41e3f] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        {/* Facebook 3-dots top button */}
        <div className="relative">
          <button
            onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer"
            title={isEn ? 'Notification options' : 'Tùy chọn thông báo'}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {headerMenuOpen && (
            <div className="absolute right-0 top-10 w-64 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-xl shadow-xl py-1.5 z-50 text-xs font-semibold">
              <button
                onClick={() => {
                  markAllAsRead();
                  setHeaderMenuOpen(false);
                }}
                className="w-full px-3.5 py-2.5 text-left flex items-center space-x-2.5 text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition"
              >
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{isEn ? 'Mark all as read' : 'Đánh dấu tất cả là đã đọc'}</span>
              </button>
              {onNavigateSettings && (
                <button
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    onClose();
                    onNavigateSettings();
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-center space-x-2.5 text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition"
                >
                  <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>{isEn ? 'Notification settings' : 'Cài đặt thông báo'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs - Facebook Pill Buttons */}
      <div className="flex px-4 pb-2.5 gap-2 text-[14px] font-semibold">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#ebf5ff] text-[#1877f2] dark:bg-[#2d88ff]/20 dark:text-[#2d88ff] font-bold'
              : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
          }`}
        >
          {isEn ? 'All' : 'Tất cả'}
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full transition cursor-pointer flex items-center space-x-1.5 ${
            activeFilter === 'unread'
              ? 'bg-[#ebf5ff] text-[#1877f2] dark:bg-[#2d88ff]/20 dark:text-[#2d88ff] font-bold'
              : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
          }`}
        >
          <span>{isEn ? 'Unread' : 'Chưa đọc'}</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Section Title */}
      <div className="px-4 py-1.5 text-xs font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider flex items-center justify-between border-t border-gray-100 dark:border-[#393a3b]/60">
        <span>{activeFilter === 'unread' ? (isEn ? 'Unread notifications' : 'Chưa đọc') : (isEn ? 'Earlier' : 'Trước đó')}</span>
        {unreadCount > 0 && activeFilter === 'all' && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[12px] font-semibold text-[#1877f2] dark:text-[#2d88ff] hover:underline cursor-pointer lowercase first-letter:uppercase"
          >
            {isEn ? 'Mark all as read' : 'Đánh dấu tất cả đã đọc'}
          </button>
        )}
      </div>

      {/* Notifications List - Facebook Style */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {loading && notifications.length === 0 ? (
          <div className="py-16 text-center text-xs text-gray-400 space-y-3">
            <div className="w-7 h-7 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>{isEn ? 'Loading notifications...' : 'Đang tải thông báo...'}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center mx-auto text-gray-400">
              <Inbox className="w-7 h-7" />
            </div>
            <p className="text-base font-bold text-gray-700 dark:text-[#e4e6eb]">
              {activeFilter === 'unread'
                ? isEn
                  ? 'No unread notifications'
                  : 'Không có thông báo chưa đọc'
                : isEn
                ? 'No notifications yet'
                : 'Chưa có thông báo nào'}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-xs mx-auto">
              {isEn
                ? 'You will receive notifications here when friends interact with your posts or profile.'
                : 'Bạn sẽ nhận được thông báo tại đây khi có người tương tác với bài viết hoặc gửi lời mời kết bạn.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const { icon, bg } = getNotificationIcon(item.type);
            const profile = item.actorId ? actorProfiles[item.actorId] : undefined;
            const avatarSrc = profile?.avatar || item.avatarUrl || '/default-avatar.png';
            const isMenuOpen = activeMenuId === item.id;
            const friendStatus = friendActionStatus[item.id];

            return (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`relative p-2.5 rounded-xl flex items-start gap-3 transition cursor-pointer group ${
                  !item.isRead
                    ? 'bg-[#ebf5ff]/70 dark:bg-[#2d88ff]/10 hover:bg-[#e0f0ff] dark:hover:bg-[#2d88ff]/20'
                    : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/70'
                }`}
              >
                {/* Avatar with Facebook Reaction/Action Badge */}
                <div className="relative shrink-0 mt-0.5">
                  <img
                    src={avatarSrc}
                    alt="Actor"
                    className="w-13 h-13 rounded-full object-cover shadow-sm bg-gray-200 dark:bg-[#3a3b3c]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${bg} flex items-center justify-center ring-2 ring-white dark:ring-[#242526] shadow-md`}
                  >
                    {icon}
                  </span>
                </div>

                {/* Content Body */}
                <div className="flex-1 min-w-0 pr-4">
                  {renderNotificationText(item, profile)}

                  {/* Friend Request Quick Action Buttons - Facebook Style */}
                  {item.type === 'FRIEND_REQUEST' && (
                    <div className="mt-2 flex items-center space-x-2">
                      {friendStatus === 'accepted' ? (
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Friend request accepted' : 'Đã chấp nhận lời mời'}</span>
                        </span>
                      ) : friendStatus === 'rejected' ? (
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {isEn ? 'Request removed' : 'Đã xóa lời mời'}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={(e) => handleAcceptFriend(e, item)}
                            className="px-4 py-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer"
                          >
                            {isEn ? 'Confirm' : 'Chấp nhận'}
                          </button>
                          <button
                            onClick={(e) => handleRejectFriend(e, item)}
                            className="px-4 py-1.5 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            {isEn ? 'Delete' : 'Xóa'}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Relative Timestamp */}
                  <p
                    className={`text-[12px] mt-1 flex items-center gap-1 ${
                      !item.isRead
                        ? 'text-[#1877f2] dark:text-[#4599ff] font-bold'
                        : 'text-gray-500 dark:text-[#b0b3b8] font-normal'
                    }`}
                  >
                    <span>{formatRelativeTime(item.createdAt)}</span>
                  </p>
                </div>

                {/* Right side: Facebook Unread Blue Dot & 3-dots Hover Menu */}
                <div className="shrink-0 flex items-center self-center space-x-1">
                  {!item.isRead && (
                    <span className="w-3 h-3 rounded-full bg-[#1877f2] block shadow-sm" />
                  )}

                  {/* Hover 3-dots Action Menu */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : item.id);
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#e4e6eb] transition cursor-pointer"
                      title={isEn ? 'More' : 'Tùy chọn'}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-8 w-52 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-xl shadow-xl py-1.5 z-50 text-xs font-semibold">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!item.isRead) {
                              markAsRead(item.id);
                            }
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center space-x-2 text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition"
                        >
                          <CheckCheck className="w-4 h-4 text-blue-600" />
                          <span>
                            {!item.isRead
                              ? isEn
                                ? 'Mark as read'
                                : 'Đánh dấu là đã đọc'
                              : isEn
                              ? 'Already read'
                              : 'Đã đọc'}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(item.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-left flex items-center space-x-2 text-rose-600 dark:text-rose-400 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{isEn ? 'Remove notification' : 'Gỡ thông báo này'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-gray-50/80 dark:bg-[#3a3b3c]/40 border-t border-gray-100 dark:border-[#393a3b] text-center">
        <button
          onClick={() => {
            onClose();
            if (onNavigateSettings) onNavigateSettings();
          }}
          className="text-xs font-semibold text-[#1877f2] dark:text-[#2d88ff] hover:underline transition cursor-pointer"
        >
          {isEn ? 'Notification settings' : 'Cài đặt thông báo'}
        </button>
      </div>
    </div>
  );
};
