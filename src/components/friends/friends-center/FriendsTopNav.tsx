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
    <div className="mb-4 space-y-2.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Navigation Option Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
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
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.id === 'requests'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Search & Refresh */}
        <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-auto">
          <div className="relative w-36 sm:w-52">
            <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400 dark:text-[#b0b3b8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('friends.filterPlaceholder') || 'Tìm kiếm...'}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 dark:placeholder-[#b0b3b8] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition shadow-2xs"
            />
          </div>
          <button
            onClick={onRefresh}
            title="Làm mới danh sách"
            className="p-1.5 rounded-xl bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
