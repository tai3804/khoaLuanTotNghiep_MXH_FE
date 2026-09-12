import React from 'react';
import { Search, Users } from 'lucide-react';
import { FacebookFriendCard } from './FacebookFriendCard';
import { ChatUser } from '../../chat/ChatBox';

interface FriendsAllTabProps {
  friends: any[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
  t: (key: string) => string;
  setActiveTab: (tab: 'home' | 'requests' | 'suggestions' | 'friends' | 'followers' | 'following') => void;
  onSelectChatUser?: (user: ChatUser) => void;
  onUnfriend: (friendId: string, friendName?: string) => void;
  onViewProfile?: (userId: string) => void;
}

const SkeletonCards = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
      <div
        key={i}
        className="bg-white dark:bg-[#242526] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#393a3b] shadow-sm animate-pulse flex flex-col"
      >
        <div className="w-full aspect-square bg-gray-200 dark:bg-[#3a3b3c]" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-[#3a3b3c] rounded w-3/4" />
          <div className="h-3 bg-gray-100 dark:bg-[#3a3b3c]/60 rounded w-1/2" />
          <div className="h-8 bg-gray-200 dark:bg-[#3a3b3c] rounded-xl w-full mt-2" />
        </div>
      </div>
    ))}
  </div>
);

export const FriendsAllTab: React.FC<FriendsAllTabProps> = ({
  friends,
  searchTerm,
  setSearchTerm,
  loading,
  t,
  setActiveTab,
  onSelectChatUser,
  onUnfriend,
  onViewProfile,
}) => {
  const filteredFriends = friends.filter(
    (f) => !searchTerm || (f.name && f.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200 dark:border-[#393a3b]">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb]">
            {t('friends.allFriends')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            {friends.length}
          </p>
        </div>

        {/* Search Friends Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('friends.searchPlaceholder')}
            className="w-full bg-white dark:bg-[#242526] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 pl-9 pr-4 py-2 rounded-full border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2] shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <SkeletonCards />
      ) : friends.length === 0 ? (
        <div className="bg-white dark:bg-[#242526] p-12 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-3 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb]">
            {t('friends.noFriends')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            {t('friends.noFriendsSub')}
          </p>
          <button
            onClick={() => setActiveTab('suggestions')}
            className="px-5 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            {t('friends.suggestions')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredFriends.map((item) => (
            <FacebookFriendCard
              key={item.id || item.userId}
              item={item}
              type="friend"
              onChat={() =>
                onSelectChatUser &&
                onSelectChatUser({
                  id: item.userId || item.id,
                  name: item.name,
                  avatar: item.avatar,
                  online: true,
                })
              }
              onUnfriend={() => onUnfriend(item.userId || item.id, item.name)}
              onViewProfile={() => onViewProfile && onViewProfile(item.userId || item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
