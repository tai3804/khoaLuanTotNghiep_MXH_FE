import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  Users,
  Bookmark,
  Clock,
  Store,
  Film,
  Tv,
  Users2,
  Settings,
} from 'lucide-react';

interface UseSidebarLeftDataProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onNavigateSettings?: () => void;
}

export const useSidebarLeftData = ({
  activeFilter = 'all',
  onFilterChange,
  onNavigateSettings,
}: UseSidebarLeftDataProps) => {
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

  return {
    user,
    isAuthenticated,
    showMore,
    setShowMore,
    displayedItems,
    handleItemClick,
  };
};
