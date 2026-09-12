import React from 'react';
import { MoreHorizontal, Check, Settings } from 'lucide-react';

interface NotificationDropdownHeaderProps {
  isEn: boolean;
  unreadCount: number;
  headerMenuOpen: boolean;
  setHeaderMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  markAllAsRead: () => void;
  onClose: () => void;
  onNavigateSettings?: () => void;
}

export const NotificationDropdownHeader: React.FC<NotificationDropdownHeaderProps> = ({
  isEn,
  unreadCount,
  headerMenuOpen,
  setHeaderMenuOpen,
  markAllAsRead,
  onClose,
  onNavigateSettings,
}) => {
  return (
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
          onClick={() => setHeaderMenuOpen((prev) => !prev)}
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
  );
};
