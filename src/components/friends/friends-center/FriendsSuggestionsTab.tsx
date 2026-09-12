import React from 'react';
import { Sparkles } from 'lucide-react';
import { FacebookFriendCard } from './FacebookFriendCard';

interface FriendsSuggestionsTabProps {
  visibleSuggestions: any[];
  sentRequests: Set<string>;
  loading: boolean;
  t: (key: string) => string;
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

export const FriendsSuggestionsTab: React.FC<FriendsSuggestionsTabProps> = ({
  visibleSuggestions,
  sentRequests,
  loading,
  t,
  onAddFriend,
  onRemoveSuggestion,
  onViewProfile,
}) => {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-[#393a3b]">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-[#e4e6eb]">
            {t('friends.suggestions')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            {t('friends.suggestionsSub')}
          </p>
        </div>
      </div>

      {loading ? (
        <SkeletonCards />
      ) : visibleSuggestions.length === 0 ? (
        <div className="bg-white dark:bg-[#242526] p-12 rounded-2xl border border-gray-200 dark:border-[#393a3b] text-center space-y-3 max-w-lg mx-auto shadow-sm">
          <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb]">
            {t('friends.noSuggestions')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            {t('friends.noSuggestionsSub')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {visibleSuggestions.map((item) => (
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
    </div>
  );
};
