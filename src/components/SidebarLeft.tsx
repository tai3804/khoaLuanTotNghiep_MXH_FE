import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserAvatar } from './UserAvatar';
import {
  Users,
  Bookmark,
  Home,
  Settings,
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

  const menuItems = [
    {
      id: 'all',
      label: t('feed') || 'Bảng tin',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-[#1877f2] flex items-center justify-center text-white shadow-sm">
          <Home className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'friends',
      label: t('friends') || 'Bạn bè',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <Users className="w-5 h-5" />
        </div>
      ),
    },
    {
      id: 'saved',
      label: t('saved') || 'Bài viết đã lưu',
      iconNode: (
        <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-sm">
          <Bookmark className="w-5 h-5" />
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
    <aside className="w-[280px] xl:w-[320px] 2xl:w-[360px] sticky top-14 shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto hidden lg:block px-2.5 py-3 bg-transparent select-none">
      {/* User profile row */}
      {isAuthenticated && user && (
        <div
          onClick={onNavigateProfile}
          className="flex items-center space-x-3 px-2.5 py-2.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition mb-1.5 group"
        >
          <UserAvatar src={user.avatar} alt={user.fullName || user.username} size="md" className="w-10 h-10 rounded-full" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-[#e4e6eb] truncate block">
              {user.fullName || user.username || 'Người dùng'}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-[#b0b3b8] block">Trang cá nhân</span>
          </div>
        </div>
      )}

      {/* Menu items */}
      <div className="space-y-0.5">
        {menuItems.map((item) => {
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
      </div>
    </aside>
  );
};
