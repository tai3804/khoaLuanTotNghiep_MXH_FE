import React from 'react';
import { Heart } from 'lucide-react';
import { FacebookFriendCard } from './FacebookFriendCard';

interface FriendsFollowersTabProps {
  activeTab: 'followers' | 'following';
  followers: any[];
  following: any[];
  loading: boolean;
  t: (key: string) => string;
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

export const FriendsFollowersTab: React.FC<FriendsFollowersTabProps> = ({
  activeTab,
  followers,
  following,
  loading,
  t,
  onViewProfile,
}) => {
  const currentList = activeTab === 'followers' ? followers : following;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <h2 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb] pb-2 border-b border-gray-200 dark:border-[#393a3b]">
        {activeTab === 'followers' ? t('friends.followers') : t('friends.following')}
      </h2>
      {loading ? (
        <SkeletonCards />
      ) : currentList.length === 0 ? (
        <div className="bg-white dark:bg-[#242526] p-12 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-2 max-w-lg mx-auto shadow-sm">
          <Heart className="w-12 h-12 text-rose-500 mx-auto" />
          <h4 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
            {activeTab === 'followers' ? t('friends.noFollowers') : t('friends.noFollowing')}
          </h4>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {currentList.map((item) => (
            <FacebookFriendCard
              key={item.id || item.userId}
              item={item}
              type="follower"
              onViewProfile={() => onViewProfile && onViewProfile(item.userId || item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
