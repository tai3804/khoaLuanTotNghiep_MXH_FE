import React from 'react';
import { useNotificationDropdownData } from './useNotificationDropdownData';
import { NotificationDropdownHeader } from './NotificationDropdownHeader';
import { NotificationFilterTabs } from './NotificationFilterTabs';
import { NotificationListContent } from './NotificationListContent';
import { NotificationDropdownFooter } from './NotificationDropdownFooter';

export interface NotificationDropdownProps {
  onClose: () => void;
  onNavigateSettings?: () => void;
  onNavigateTarget?: (url: string) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  onNavigateSettings,
  onNavigateTarget,
}) => {
  const {
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
  } = useNotificationDropdownData({ onClose, onNavigateSettings, onNavigateTarget });

  const handleToggleMenu = (_e: React.MouseEvent, itemId: string) => {
    setActiveMenuId((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-12 w-84 sm:w-96 md:w-[410px] bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[85vh] transition-all"
    >
      <NotificationDropdownHeader
        isEn={isEn}
        unreadCount={unreadCount}
        headerMenuOpen={headerMenuOpen}
        setHeaderMenuOpen={setHeaderMenuOpen}
        markAllAsRead={markAllAsRead}
        onClose={onClose}
        onNavigateSettings={onNavigateSettings}
      />

      <NotificationFilterTabs
        isEn={isEn}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        unreadCount={unreadCount}
        markAllAsRead={markAllAsRead}
      />

      <NotificationListContent
        loading={loading}
        notifications={notifications}
        filteredNotifications={filteredNotifications}
        activeFilter={activeFilter}
        actorProfiles={actorProfiles}
        activeMenuId={activeMenuId}
        friendActionStatus={friendActionStatus}
        isEn={isEn}
        onItemClick={handleItemClick}
        onAcceptFriend={handleAcceptFriend}
        onRejectFriend={handleRejectFriend}
        onToggleMenu={handleToggleMenu}
        onMarkAsRead={markAsRead}
        onDismiss={dismissNotification}
      />

      <NotificationDropdownFooter
        isEn={isEn}
        onClose={onClose}
        onNavigateSettings={onNavigateSettings}
      />
    </div>
  );
};
