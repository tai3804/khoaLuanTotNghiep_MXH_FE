import React from 'react';

interface ProfileFriendsBoxProps {
  friends: any[];
  onSeeAllFriends: () => void;
  onViewProfile?: (userId: string) => void;
}

export const ProfileFriendsBox: React.FC<ProfileFriendsBoxProps> = ({
  friends,
  onSeeAllFriends,
  onViewProfile,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-[#393a3b] transition">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">
            Bạn bè
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-[#8a8d91]">{friends.length} người bạn</p>
        </div>
        <button
          onClick={onSeeAllFriends}
          className="text-xs font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer"
        >
          Xem tất cả bạn bè
        </button>
      </div>

      {friends.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {friends.slice(0, 6).map((friend, i) => (
            <div
              key={i}
              onClick={() => onViewProfile && onViewProfile(friend.userId || friend.id)}
              className="cursor-pointer group"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] mb-1">
                <img
                  src={friend.avatar || friend.avatarUrl || '/default-avatar.png'}
                  alt={friend.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <p className="text-[11px] font-bold text-gray-800 dark:text-[#e4e6eb] truncate group-hover:underline">
                {friend.name || `${friend.lastName || ''} ${friend.firstName || ''}`.trim() || 'Bạn bè'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-gray-400 dark:text-[#8a8d91]">
          Chưa có bạn bè nào.
        </div>
      )}
    </div>
  );
};
