import React from 'react';
import { Sparkles } from 'lucide-react';
import { FacebookFriendCard } from './FacebookFriendCard';

interface FriendsOverviewTabProps {
  requests: any[];
  visibleSuggestions: any[];
  sentRequests: Set<string>;
  loading: boolean;
  t: (key: string) => string;
  setActiveTab: (tab: 'home' | 'requests' | 'suggestions' | 'friends' | 'followers' | 'following') => void;
  onAcceptRequest: (item: any) => void;
  onRejectRequest: (item: any) => void;
  onAddFriend: (targetId: string, name?: string) => void;
  onRemoveSuggestion: (id: string) => void;
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

export const FriendsOverviewTab: React.FC<FriendsOverviewTabProps> = ({
  requests,
  visibleSuggestions,
  sentRequests,
  loading,
  t,
  setActiveTab,
  onAcceptRequest,
  onRejectRequest,
  onAddFriend,
  onRemoveSuggestion,
  onViewProfile,
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Section A: Lời mời kết bạn */}
      {requests.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                {t('friends.requests')}
              </h2>
              <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-900">
                {requests.length}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('requests')}
              className="text-xs sm:text-sm font-bold text-[#1877f2] dark:text-[#2d88ff] hover:underline cursor-pointer"
            >
              {t('friends.seeAll')}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {requests.slice(0, 10).map((item) => (
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
        </section>
      )}

      {/* Section B: Những người bạn có thể biết (Gợi ý) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
              {t('friends.peopleYouMayKnow')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
              {t('friends.suggestionsSub')}
            </p>
          </div>
          {visibleSuggestions.length > 5 && (
            <button
              onClick={() => setActiveTab('suggestions')}
              className="text-xs sm:text-sm font-bold text-[#1877f2] dark:text-[#2d88ff] hover:underline cursor-pointer"
            >
              {t('friends.seeAll')}
            </button>
          )}
        </div>

        {loading && visibleSuggestions.length === 0 ? (
          <SkeletonCards />
        ) : visibleSuggestions.length === 0 ? (
          <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-2 shadow-sm">
            <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
              {t('friends.noSuggestions')}
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto">
              {t('friends.noSuggestionsSub')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {visibleSuggestions.slice(0, 15).map((item) => (
              <FacebookFriendCard
                key={item.id || item.userId}
                item={item}
                type="suggestion"
                isSent={sentRequests.has(String(item.id || item.userId))}
                onAdd={() => onAddFriend(String(item.id || item.userId), item.name || item.fullName)}
                onRemove={() => onRemoveSuggestion(String(item.id || item.userId))}
                onViewProfile={() => onViewProfile && onViewProfile(String(item.id || item.userId))}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
