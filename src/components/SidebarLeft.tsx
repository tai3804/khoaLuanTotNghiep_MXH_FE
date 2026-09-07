import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserAvatar } from './UserAvatar';
import {
  Users,
  Bookmark,
  Clock,
  Store,
  Calendar,
  ChevronDown,
  Tv,
  Globe,
} from 'lucide-react';

interface SidebarLeftProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  activeFilter = 'all',
  onFilterChange,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [showMore, setShowMore] = useState(false);

  const menuItems = [
    { id: 'all', icon: Globe, label: 'Bảng tin toàn bộ', color: 'text-blue-500' },
    { id: 'friends', icon: Users, label: t('friends') || 'Bạn bè', color: 'text-blue-500' },
    { id: 'saved', icon: Bookmark, label: t('saved') || 'Đã lưu', color: 'text-purple-500' },
    { id: 'memories', icon: Clock, label: t('memories') || 'Kỷ niệm', color: 'text-amber-500' },
    { id: 'video', icon: Tv, label: t('video') || 'Video Feeds', color: 'text-teal-500' },
    { id: 'marketplace', icon: Store, label: t('marketplace') || 'Marketplace', color: 'text-blue-600' },
    { id: 'events', icon: Calendar, label: t('events') || 'Sự kiện', color: 'text-red-500' },
  ];

  const shortcuts = [
    { name: 'Cộng đồng ReactJS Việt Nam', members: '12.5k thành viên', icon: '⚛️' },
    { name: 'Lập trình Web & Mobile App', members: '45k thành viên', icon: '💻' },
    { name: 'Chợ Mua Bán Đồ Công Nghệ', members: '8.9k thành viên', icon: '🛒' },
  ];

  const displayedItems = showMore ? menuItems : menuItems.slice(0, 5);

  return (
    <aside className="w-64 fixed left-0 top-14 h-[calc(100vh-3.5rem)] overflow-y-auto hidden lg:block p-3 bg-white dark:bg-slate-800/80 border-r border-gray-200 dark:border-slate-700/60 transition-colors duration-200">
      {/* User profile banner - Only display if authenticated */}
      {isAuthenticated && user && (
        <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition mb-2">
          <UserAvatar src={user.avatar} alt={user.fullName} size="sm" />
          <div className="min-w-0">
            <span className="font-bold text-sm text-gray-900 dark:text-slate-100 truncate block">
              {user.fullName || user.username}
            </span>
            <span className="text-[10px] text-green-500 font-medium">● Đang hoạt động</span>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {displayedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onFilterChange && onFilterChange(item.id)}
              className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer transition font-medium text-sm ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${item.color}`} />
              <span className="truncate">{item.label}</span>
            </div>
          );
        })}

        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold cursor-pointer transition"
        >
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
            <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-slate-300 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </div>
          <span>{showMore ? 'Ẩn bớt' : t('seeMore') || 'Xem thêm'}</span>
        </button>
      </div>

      <hr className="my-3 border-gray-200 dark:border-slate-700" />

      {/* Shortcuts */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider px-2 mb-2">
          Lối tắt của bạn
        </h4>
        <div className="space-y-1">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition group"
            >
              <span className="text-lg">{sc.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  {sc.name}
                </p>
                <span className="text-[10px] text-gray-400 dark:text-slate-400 block">{sc.members}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
