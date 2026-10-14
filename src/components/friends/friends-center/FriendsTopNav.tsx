import React from 'react';
import { RefreshCw, Search, UserPlus, Sparkles, UserCheck, X } from 'lucide-react';

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
  t,
  onRefresh,
}) => {
  // Chỉ giữ lại 3 option: Tất cả, Lời mời, Gợi ý
  const tabs = [
    { id: 'friends', label: t('friends.allFriends') || 'Tất cả bạn bè', icon: UserCheck, count: friendsCount },
    { id: 'requests', label: t('friends.requests') || 'Lời mời kết bạn', icon: UserPlus, count: requestsCount },
    { id: 'suggestions', label: t('friends.suggestions') || 'Gợi ý kết bạn', icon: Sparkles, count: suggestionsCount },
  ];

  return (
    <div className="mb-4 space-y-2.5">
      {/* Row 1: Search Bar on Left, Reload Button alongside on the same row */}
      <div className="flex items-center gap-2">
        <div className="relative w-64 sm:w-80 max-w-[calc(100%-3rem)]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 dark:text-[#b0b3b8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'requests'
                ? 'Tìm lời mời...'
                : activeTab === 'suggestions'
                ? 'Tìm gợi ý...'
                : 'Tìm bạn bè...'
            }
            className="w-full pl-8 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          onClick={onRefresh}
          title="Làm mới danh sách"
          className="p-2 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Row 2: Option Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
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
    </div>
  );
};
