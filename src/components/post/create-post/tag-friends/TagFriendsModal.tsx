import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { userService } from '../../../../services/userService';
import { TaggedFriend, TaggedFriendsChips } from './TaggedFriendsChips';
import { TagFriendsList } from './TagFriendsList';

interface TagFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taggedFriends: TaggedFriend[];
  onSaveTags: (tags: TaggedFriend[]) => void;
}

export const TagFriendsModal: React.FC<TagFriendsModalProps> = ({
  isOpen,
  onClose,
  taggedFriends: initialTaggedFriends,
  onSaveTags,
}) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<TaggedFriend[]>(initialTaggedFriends);

  useEffect(() => {
    if (isOpen) {
      setSelectedTags(initialTaggedFriends);
      setSearchQuery('');
      loadFriends();
    }
  }, [isOpen, initialTaggedFriends]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const data = await userService.getFriends(0, 100);
      setFriends(Array.isArray(data) ? data : []);
    } catch {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedIds = new Set(selectedTags.map((t) => t.id || t.userId));

  const handleToggle = (friend: TaggedFriend) => {
    const fid = friend.id || friend.userId;
    if (selectedIds.has(fid)) {
      setSelectedTags((prev) => prev.filter((t) => (t.id || t.userId) !== fid));
    } else {
      setSelectedTags((prev) => [...prev, friend]);
    }
  };

  const handleRemoveChip = (fid: string) => {
    setSelectedTags((prev) => prev.filter((t) => (t.id || t.userId) !== fid));
  };

  const handleDone = () => {
    onSaveTags(selectedTags);
    onClose();
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredFriends = friends.filter((f) => {
    const name = (f.name || f.fullName || '').toLowerCase();
    return !normalizedQuery || name.includes(normalizedQuery);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-4 py-3.5 border-b border-gray-100 dark:border-[#393a3b] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-gray-500 dark:text-[#b0b3b8] transition cursor-pointer"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb] text-center flex-1">
            Gắn thẻ người khác
          </h3>

          <button
            type="button"
            onClick={handleDone}
            className="text-sm font-bold text-[#1877f2] hover:text-[#166fe5] px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition cursor-pointer"
          >
            Xong
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1 overflow-hidden flex flex-col">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bạn bè..."
              className="w-full pl-9 pr-8 py-2 bg-gray-100 dark:bg-[#3a3b3c] border border-transparent focus:border-[#1877f2] rounded-xl text-sm text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none transition"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tagged Chips */}
          <TaggedFriendsChips taggedFriends={selectedTags} onRemove={handleRemoveChip} />

          {/* Friends List */}
          <div className="flex-1 overflow-hidden">
            <div className="text-[11px] font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider mb-2">
              Bạn bè
            </div>
            <TagFriendsList
              friends={filteredFriends}
              loading={loading}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              maxHeight="42vh"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
