import React from 'react';
import { UserPlus } from 'lucide-react';
import { FacebookFriendCard } from './FacebookFriendCard';

interface FriendsRequestsTabProps {
  requests: any[];
  loading: boolean;
  t: (key: string) => string;
  setActiveTab: (tab: 'home' | 'requests' | 'suggestions' | 'friends' | 'followers' | 'following') => void;
  onAcceptRequest: (item: any) => void;
  onRejectRequest: (item: any) => void;
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

export const FriendsRequestsTab: React.FC<FriendsRequestsTabProps> = ({
  requests,
  loading,
  t,
  setActiveTab,
  onAcceptRequest,
  onRejectRequest,
  onViewProfile,
}) => {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#393a3b]">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb]">
            {t('friends.requests')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            {requests.length}
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonCards />
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-[#242526] p-12 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-3 max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#1877f2]/10 text-[#1877f2] flex items-center justify-center mx-auto">
            <UserPlus className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb]">
            {t('friends.noRequests')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            {t('friends.noRequestsSub')}
          </p>
          <button
            onClick={() => setActiveTab('suggestions')}
            className="px-5 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            {t('friends.suggestions')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {requests.map((item) => (
            <FacebookFriendCard
              key={item.id}
              item={item}
              type="request"
              onAccept={() => onAcceptRequest(item)}
              onReject={() => onRejectRequest(item)}
              onViewProfile={() => onViewProfile && onViewProfile(item.requesterId || item.userId || item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
