import React from 'react';
import { Search, Check, Loader2 } from 'lucide-react';

export interface FriendSelectionListProps {
  friends: any[];
  loading: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (userId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  maxHeight?: string;
}

export const FriendSelectionList: React.FC<FriendSelectionListProps> = ({
  friends,
  loading,
  selectedIds,
  onToggleSelect,
  searchQuery,
  onSearchChange,
  maxHeight = '45vh',
}) => {
  const getFriendName = (friend: any): string => {
    if (!friend || typeof friend !== 'object') return 'Người dùng';
    const composedName = [friend.lastName, friend.middleName, friend.firstName]
      .filter((part) => typeof part === 'string' && part.trim())
      .join(' ')
      .trim();
    return String(friend.name || friend.fullName || composedName || friend.displayName || friend.username || friend.email || 'Người dùng');
  };
  const safeFriends = Array.isArray(friends) ? friends.filter(Boolean) : [];
  const normalizedQuery = String(searchQuery || '').trim().toLocaleLowerCase('vi-VN');
  const filteredFriends = safeFriends.filter((f) => {
    return getFriendName(f).toLocaleLowerCase('vi-VN').includes(normalizedQuery);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search Input */}
      <div className="space-y-1.5 pt-2">
        <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">Tìm kiếm bạn bè</label>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nhập tên bạn bè..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#3a3b3c]/50 border border-gray-200 dark:border-[#393a3b] rounded-xl text-sm font-medium text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] transition"
          />
        </div>
      </div>

      {/* List */}
      <div 
        className="mt-3 overflow-y-auto pr-1 space-y-1 custom-scrollbar" 
        style={{ maxHeight }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#1877f2]" />
            <span className="text-xs">Đang tải danh sách...</span>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-xs font-semibold text-gray-500 dark:text-[#8a8d91]">
            Không tìm thấy ai.
          </div>
        ) : (
          filteredFriends.map((f) => {
            const uid = String(f.userId || f.id);
            const name = getFriendName(f);
            const avatar = f.avatarUrl || f.avatar || '/default-avatar.png';
            const isSelected = selectedIds.has(uid);

            return (
              <div
                key={uid}
                onClick={() => onToggleSelect(uid)}
                className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition"
              >
                <div className="flex items-center space-x-3">
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} />
                  <span className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">{name}</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'bg-[#1877f2] border-[#1877f2]' : 'border-gray-300 dark:border-gray-500'}`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
