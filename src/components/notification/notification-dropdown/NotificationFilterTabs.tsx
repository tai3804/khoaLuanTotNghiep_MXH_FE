import React from 'react';

interface NotificationFilterTabsProps {
  isEn: boolean;
  activeFilter: 'all' | 'unread';
  setActiveFilter: (filter: 'all' | 'unread') => void;
  unreadCount: number;
  markAllAsRead: () => void;
}

export const NotificationFilterTabs: React.FC<NotificationFilterTabsProps> = ({
  isEn,
  activeFilter,
  setActiveFilter,
  unreadCount,
  markAllAsRead,
}) => {
  return (
    <>
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
    </>
  );
};
