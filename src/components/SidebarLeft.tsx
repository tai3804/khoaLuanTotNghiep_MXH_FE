import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserAvatar } from './UserAvatar';
import {
  Users,
  Bookmark,
  Clock,
  Store,
  ChevronDown,
  Film,
  Tv,
  Users2,
  Settings,
  Compass,
} from 'lucide-react';

interface SidebarLeftProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onNavigateProfile?: () => void;
  onNavigateSettings?: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  activeFilter = 'all',
  onFilterChange,
  onNavigateProfile,
  onNavigateSettings,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  // Full Facebook menu items
  const menuItems = [
    {
      id: 'friends',
      label: t('friends') || 'Bạn bè',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white shadow-sm">
          <Users className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'groups',
      label: 'Nhóm',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm">
          <Users2 className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'memories',
      label: t('memories') || 'Kỷ niệm',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-sm">
          <Clock className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'saved',
      label: t('saved') || 'Đã lưu',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-sm">
          <Bookmark className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'watch',
      label: 'Video',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <Tv className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-sm">
          <Store className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'reels',
      label: 'Thước phim',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-sm">
          <Film className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'settings',
      label: t('settings') || 'Cài đặt & quyền riêng tư',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-gray-500 dark:bg-[#4e4f50] flex items-center justify-center text-white shadow-sm">
          <Settings className="w-5 h-5" />
        </div>
      ),
    },
  ];

  const displayedItems = showMore ? menuItems : menuItems.slice(0, 5);

  const handleItemClick = (id: string) => {
    if (id === 'settings' && onNavigateSettings) {
      onNavigateSettings();
      return;
    }
    if (onFilterChange) {
      onFilterChange(id);
    }
  };

  return (
    <aside className="w-[300px] xl:w-[340px] 2xl:w-[360px] sticky top-14 shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto hidden lg:block px-2 py-3 bg-transparent select-none">
      {/* User profile row */}
      {isAuthenticated && user && (
        <div
          onClick={onNavigateProfile}
          className="flex items-center space-x-3 px-2.5 py-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition mb-1 group"
        >
          <UserAvatar src={user.avatar} alt={user.fullName || user.username} size="md" className="w-9 h-9 rounded-full" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-[#e4e6eb] truncate block">
              {user.fullName || user.username || 'Người dùng'}
            </span>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="space-y-0.5">
        {displayedItems.map((item) => {
          const isActive = activeFilter === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`flex items-center space-x-3 px-2.5 py-2 rounded-xl cursor-pointer transition font-medium text-sm ${
                isActive
                  ? 'bg-blue-50 dark:bg-[#3a3b3c] text-[#2d88ff] font-semibold'
                  : 'text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60'
              }`}
            >
              <div className="shrink-0">{item.iconNode}</div>
              <span className="truncate">{item.label}</span>
            </div>
          );
        })}

        {/* See more / less button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full flex items-center space-x-3 px-2.5 py-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 text-gray-800 dark:text-[#e4e6eb] text-sm font-medium cursor-pointer transition"
        >
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-700 dark:text-[#e4e6eb]">
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`} />
          </div>
          <span>{showMore ? 'Ẩn bớt' : 'Xem thêm'}</span>
        </button>
      </div>

      <hr className="my-2.5 border-gray-200 dark:border-[#393a3b] mx-2" />

      {/* Lối tắt của bạn (Shortcuts Section) */}
      <div>
        <div className="flex items-center justify-between px-2.5 mb-1.5">
          <h4 className="text-sm font-semibold text-gray-500 dark:text-[#b0b3b8]">
            Lối tắt của bạn
          </h4>
        </div>

        <div className="space-y-0.5">
          <button
            onClick={() => onFilterChange && onFilterChange('groups')}
            className="w-full flex items-center space-x-3 px-2.5 py-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 text-[#2d88ff] text-xs font-semibold cursor-pointer transition"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#2d88ff]/20 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-[#2d88ff]" />
            </div>
            <span>Khám phá nhóm & cộng đồng</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
