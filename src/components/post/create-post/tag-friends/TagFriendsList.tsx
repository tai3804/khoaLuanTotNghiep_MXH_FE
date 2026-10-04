import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { UserAvatar } from '../../../common/UserAvatar';
import { TaggedFriend } from './TaggedFriendsChips';

interface TagFriendsListProps {
  friends: any[];
  loading: boolean;
  selectedIds: Set<string>;
  onToggle: (friend: TaggedFriend) => void;
  maxHeight?: string;
}

export const TagFriendsList: React.FC<TagFriendsListProps> = ({
  friends,
  loading,
  selectedIds,
  onToggle,
  maxHeight = '45vh',
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-2 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-[#1877f2]" />
        <span className="text-xs">Đang tải danh sách bạn bè...</span>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-xs font-semibold text-gray-500 dark:text-[#8a8d91]">
        Không tìm thấy bạn bè nào phù hợp.
      </div>
    );
  }

  return (
    <div
      className="overflow-y-auto pr-1 space-y-1 custom-scrollbar divide-y divide-gray-50 dark:divide-[#393a3b]/30"
      style={{ maxHeight }}
    >
      {friends.map((friend) => {
        const uid = String(friend.id || friend.userId);
        const name = friend.name || friend.fullName || 'Người dùng';
        const avatar = friend.avatar || friend.avatarUrl || '/default-avatar.png';
        const isSelected = selectedIds.has(uid);

        return (
          <div
            key={uid}
            onClick={() => onToggle({ id: uid, userId: uid, name, avatar })}
            className="flex items-center justify-between p-2.5 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <UserAvatar src={avatar} alt={name} size="md" className="w-10 h-10 rounded-full shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] truncate">
                  {name}
                </div>
                {friend.mutualFriendsCount !== undefined && friend.mutualFriendsCount > 0 && (
                  <div className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate">
                    {friend.mutualFriendsCount} bạn chung
                  </div>
                )}
              </div>
            </div>

            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition shrink-0 ml-2 ${
                isSelected
                  ? 'bg-[#1877f2] border-[#1877f2]'
                  : 'border-gray-300 dark:border-gray-500'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};
