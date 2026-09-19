import React from 'react';
import { Search, RefreshCw, Home, UserPlus, Sparkles, UserCheck, Heart, Users } from 'lucide-react';

interface FriendsSidebarNavProps {
  activeTab: string;
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

export const FriendsSidebarNav: React.FC<FriendsSidebarNavProps> = ({
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
  const navItems = [
    { id: 'home', label: t('friends.home'), icon: Home, bgColor: 'bg-[#1877f2]', count: null },
    { id: 'requests', label: t('friends.requests'), icon: UserPlus, bgColor: 'bg-blue-500', count: requestsCount },
    { id: 'suggestions', label: t('friends.suggestions'), icon: Sparkles, bgColor: 'bg-amber-500', count: suggestionsCount },
    { id: 'friends', label: t('friends.allFriends'), icon: UserCheck, bgColor: 'bg-emerald-500', count: friendsCount },
    { id: 'followers', label: t('friends.followers'), icon: Heart, bgColor: 'bg-rose-500', count: followersCount },
    { id: 'following', label: t('friends.following'), icon: Users, bgColor: 'bg-purple-500', count: followingCount },
  ];

  return (
    <>
      {/* 1. MOBILE TOP TAB NAVIGATION SLIDER (Visible on Mobile) */}
      <div className="md:hidden flex items-center space-x-2 overflow-x-auto p-3 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shrink-0 sticky top-14 z-30 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setSearchTerm('');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#1877f2] text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-[#1877f2]' : 'bg-red-500 text-white'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. DESKTOP LEFT SIDEBAR */}
      <aside className="hidden md:flex flex-col w-[300px] xl:w-[340px] fixed top-14 bottom-0 left-0 bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-[#393a3b] overflow-y-auto p-3.5 space-y-3.5 z-20 shadow-sm shrink-0 select-none">
        {/* Header Title */}
        <div className="flex items-center justify-between px-2 pt-1">
          <h1 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb] tracking-tight">
            {t('friends.title')}
          </h1>
          <button
            onClick={onRefresh}
            title="Làm mới dữ liệu API"
            className="p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Quick Filter Input Box */}
        <div className="relative px-1">
          <Search className="absolute left-4 top-2.5 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('friends.filterPlaceholder')}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition"
          />
        </div>

        {/* Menu Navigation Pills */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setSearchTerm('');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-[#3a3b3c] text-[#2d88ff] font-bold shadow-sm'
                    : 'text-gray-900 dark:text-[#e4e6eb] hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isActive
                        ? 'bg-[#1877f2] text-white shadow-md scale-105'
                        : `${item.bgColor} text-white shadow-sm`
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== null && item.count > 0 && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      item.id === 'requests'
                        ? 'bg-red-500 text-white animate-pulse'
                        : isActive
                        ? 'bg-[#1877f2] text-white'
                        : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
