import React from 'react';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  UserPlus,
  UserCheck,
  Users,
  MessageSquare,
  Phone,
  PhoneMissed,
  Bell,
  Check,
  MoreHorizontal,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { NotificationItem, NotificationType } from '../../../types/notification';

interface NotificationItemCardProps {
  item: NotificationItem;
  profile?: { name: string; avatar: string };
  isEn: boolean;
  isMenuOpen: boolean;
  friendStatus?: 'accepted' | 'rejected';
  onItemClick: (item: NotificationItem) => void;
  onAcceptFriend: (e: React.MouseEvent, item: NotificationItem) => void;
  onRejectFriend: (e: React.MouseEvent, item: NotificationItem) => void;
  onToggleMenu: (e: React.MouseEvent, itemId: string) => void;
  onMarkAsRead: (itemId: string) => void;
  onDismiss: (itemId: string) => void;
}

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

const formatRelativeTime = (isoString?: string, isEn: boolean = false) => {
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

const renderNotificationText = (
  item: NotificationItem,
  profile?: { name: string; avatar: string },
  isEn: boolean = false
) => {
  const actorName =
    profile?.name && profile.name !== 'Người dùng' && profile.name !== 'Thành viên KLTN' ? profile.name : '';

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

export const NotificationItemCard: React.FC<NotificationItemCardProps> = ({
  item,
  profile,
  isEn,
  isMenuOpen,
  friendStatus,
  onItemClick,
  onAcceptFriend,
  onRejectFriend,
  onToggleMenu,
  onMarkAsRead,
  onDismiss,
}) => {
  const { icon, bg } = getNotificationIcon(item.type);
  const avatarSrc = profile?.avatar || item.avatarUrl || '/default-avatar.png';

  return (
    <div
      onClick={() => onItemClick(item)}
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
        {renderNotificationText(item, profile, isEn)}

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
                  onClick={(e) => onAcceptFriend(e, item)}
                  className="px-4 py-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer"
                >
                  {isEn ? 'Confirm' : 'Chấp nhận'}
                </button>
                <button
                  onClick={(e) => onRejectFriend(e, item)}
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
          <span>{formatRelativeTime(item.createdAt, isEn)}</span>
        </p>
      </div>

      {/* Right side: Facebook Unread Blue Dot & 3-dots Hover Menu */}
      <div className="shrink-0 flex items-center self-center space-x-1">
        {!item.isRead && <span className="w-3 h-3 rounded-full bg-[#1877f2] block shadow-sm" />}

        {/* Hover 3-dots Action Menu */}
        <div className="relative">
          <button
            onClick={(e) => onToggleMenu(e, item.id)}
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
                    onMarkAsRead(item.id);
                  }
                  onToggleMenu(e, '');
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
                  onDismiss(item.id);
                  onToggleMenu(e, '');
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
};
