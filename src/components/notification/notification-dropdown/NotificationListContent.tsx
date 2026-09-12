import React from 'react';
import { Inbox } from 'lucide-react';
import { NotificationItem } from '../../../types/notification';
import { NotificationItemCard } from './NotificationItemCard';

interface NotificationListContentProps {
  loading: boolean;
  notifications: NotificationItem[];
  filteredNotifications: NotificationItem[];
  activeFilter: 'all' | 'unread';
  actorProfiles: Record<string, { name: string; avatar: string }>;
  activeMenuId: string | null;
  friendActionStatus: Record<string, 'accepted' | 'rejected'>;
  isEn: boolean;
  onItemClick: (item: NotificationItem) => void;
  onAcceptFriend: (e: React.MouseEvent, item: NotificationItem) => void;
  onRejectFriend: (e: React.MouseEvent, item: NotificationItem) => void;
  onToggleMenu: (e: React.MouseEvent, itemId: string) => void;
  onMarkAsRead: (itemId: string) => void;
  onDismiss: (itemId: string) => void;
}

export const NotificationListContent: React.FC<NotificationListContentProps> = ({
  loading,
  notifications,
  filteredNotifications,
  activeFilter,
  actorProfiles,
  activeMenuId,
  friendActionStatus,
  isEn,
  onItemClick,
  onAcceptFriend,
  onRejectFriend,
  onToggleMenu,
  onMarkAsRead,
  onDismiss,
}) => {
  return (
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
          const profile = item.actorId ? actorProfiles[item.actorId] : undefined;
          const isMenuOpen = activeMenuId === item.id;
          const friendStatus = friendActionStatus[item.id];

          return (
            <NotificationItemCard
              key={item.id}
              item={item}
              profile={profile}
              isEn={isEn}
              isMenuOpen={isMenuOpen}
              friendStatus={friendStatus}
              onItemClick={onItemClick}
              onAcceptFriend={onAcceptFriend}
              onRejectFriend={onRejectFriend}
              onToggleMenu={onToggleMenu}
              onMarkAsRead={onMarkAsRead}
              onDismiss={onDismiss}
            />
          );
        })
      )}
    </div>
  );
};
