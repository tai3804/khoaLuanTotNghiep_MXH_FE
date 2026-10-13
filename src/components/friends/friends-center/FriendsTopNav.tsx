import React from 'react';
import { Search, RefreshCw, Home, UserPlus, Sparkles, UserCheck, Heart, Users } from 'lucide-react';

interface FriendsTopNavProps {
  activeTab: 'home' | 'requests' | 'suggestions' | 'friends' | 'followers' | 'following';
  setActiveTab: (tab: 'home' | 'requests' | 'suggestions' | 'friends' | 'followers' | 'following') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
  requestsCount: number;
  suggestionsCount: number;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  t: (key: string) => string;
  onRefresh: () => void;
}

export const FriendsTopNav: React.FC<FriendsTopNavProps> = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  loading,
  requestsCount,
  suggestionsCount,
  friendsCount,
  followersCount,
  followingCount,
  t,
  onRefresh,
}) => {
  const tabs = [
    { id: 'home', label: t('friends.home') || 'Tổng quan', icon: Home, count: null },
    { id: 'requests', label: t('friends.requests') || 'Lời mời kết bạn', icon: UserPlus, count: requestsCount },
    { id: 'suggestions', label: t('friends.suggestions') || 'Gợi ý kết bạn', icon: Sparkles, count: suggestionsCount },
    { id: 'friends', label: t('friends.allFriends') || 'Tất cả bạn bè', icon: UserCheck, count: friendsCount },
    { id: 'followers', label: t('friends.followers') || 'Người theo dõi', icon: Heart, count: followersCount },
    { id: 'following', label: t('friends.following') || 'Đang theo dõi', icon: Users, count: followingCount },
  ];

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-3.5 sm:p-4 border border-gray-200 dark:border-[#393a3b] shadow-sm mb-5 space-y-3">
      {/* Header Row: Title, Search, and Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full bg-[#1877f2]/10 dark:bg-blue-900/30 flex items-center justify-center text-[#1877f2]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-[#e4e6eb] tracking-tight">
              {t('friends.title') || 'Bạn bè'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              Quản lý danh sách kết nối, lời mời và bạn bè
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('friends.filterPlaceholder') || 'Tìm kiếm theo tên...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition"
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Làm mới danh sách"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchTerm('');
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-blue-50 dark:bg-[#3a3b3c] text-[#2d88ff] shadow-sm'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-[#1877f2] text-white'
                      : tab.id === 'requests'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 dark:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
