import React from 'react';
import { X } from 'lucide-react';
import { UserAvatar } from '../../../common/UserAvatar';

export interface TaggedFriend {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
}

interface TaggedFriendsChipsProps {
  taggedFriends: TaggedFriend[];
  onRemove: (friendId: string) => void;
}

export const TaggedFriendsChips: React.FC<TaggedFriendsChipsProps> = ({
  taggedFriends,
  onRemove,
}) => {
  if (taggedFriends.length === 0) return null;

  return (
    <div className="space-y-1.5 pb-2 border-b border-gray-100 dark:border-[#393a3b]">
      <div className="text-[11px] font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider">
        Đã gắn thẻ ({taggedFriends.length})
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
        {taggedFriends.map((f) => (
          <div
            key={f.id || f.userId}
            className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 rounded-full text-xs text-blue-700 dark:text-blue-300 font-semibold"
          >
            <UserAvatar src={f.avatar} alt={f.name} size="sm" className="w-4 h-4 rounded-full" />
            <span className="max-w-[120px] truncate">{f.name}</span>
            <button
              type="button"
              onClick={() => onRemove(f.id || f.userId)}
              className="text-blue-500 hover:text-red-500 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-full p-0.5 transition cursor-pointer"
              title="Gỡ thẻ"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
