import React, { useState, useEffect } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { userService } from '../../services/api';
import { chatService } from '../../services/chatService';
import { useToast } from '../../context/ToastContext';
import { FriendSelectionList } from '../common/FriendSelectionList';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (conversation: any) => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
}) => {
  const toast = useToast();
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setGroupName('');
      setSearchQuery('');
      setSelectedIds(new Set());
      fetchFriends();
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    setLoadingFriends(true);
    try {
      const data = await userService.getFriends();
      if (Array.isArray(data)) {
        setFriends(data);
      }
    } catch (err) {
      console.error('Failed to fetch friends for group chat', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const toggleSelectFriend = (friendId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  };



  const handleCreateGroup = async () => {
    if (selectedIds.size < 1) {
      toast.showError('Vui lòng chọn ít nhất 1 bạn bè để tạo nhóm chat.');
      return;
    }
    setCreating(true);
    try {
      const memberIds = Array.from(selectedIds);
      const conversation = await chatService.createGroupChat(groupName.trim() || 'Nhóm chat mới', memberIds);
      toast.showSuccess('Tạo nhóm chat thành công!');
      
      // Notify components to refresh conversations/groups
      window.dispatchEvent(new CustomEvent('group_chat_created', { detail: conversation }));
      
      onGroupCreated(conversation);
      onClose();
    } catch (err: any) {
      toast.showError('Tạo nhóm thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const selectedFriendsList = friends.filter((f) => selectedIds.has(String(f.userId || f.id)));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={!creating ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#242526] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between sticky top-0 bg-white dark:bg-[#242526] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1877f2]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                Tạo nhóm chat mới
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                Trò chuyện cùng lúc với nhiều bạn bè
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={creating}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] rounded-full text-gray-500 dark:text-[#b0b3b8] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Group Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
              Tên nhóm chat <span className="text-gray-400 font-normal">(tùy chọn)</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Đặt tên nhóm (vd: Nhóm Học Tập, Bạn Thân...)"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c]/50 border border-gray-200 dark:border-[#393a3b] rounded-xl text-sm font-medium text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition"
            />
          </div>

          {/* Selected chips list */}
          {selectedFriendsList.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
                Đã chọn ({selectedFriendsList.length}):
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-gray-50 dark:bg-[#3a3b3c]/30 rounded-xl border border-gray-100 dark:border-[#393a3b]">
                {selectedFriendsList.map((friend) => {
                  const fid = String(friend.userId || friend.id);
                  const name = friend.fullName || [friend.lastName, friend.middleName, friend.firstName].filter(Boolean).join(' ') || friend.username || 'Bạn bè';
                  const avatar = friend.avatarUrl || friend.avatar || '/default-avatar.png';
                  return (
                    <div
                      key={fid}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-[#1877f2] dark:text-[#4599ff] border border-blue-200/60 dark:border-blue-800/40 rounded-full text-xs font-semibold"
                    >
                      <img src={avatar} alt={name} className="w-4 h-4 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} />
                      <span className="max-w-[120px] truncate">{name}</span>
                      <button
                        type="button"
                        onClick={() => toggleSelectFriend(fid)}
                        className="hover:text-red-500 rounded-full p-0.5 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Friend Selection List */}
          <FriendSelectionList
            friends={friends}
            loading={loadingFriends}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectFriend}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            maxHeight="38vh"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#242526] sticky bottom-0 z-10 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-[#b0b3b8]">
            Đã chọn: <span className={selectedIds.size === 0 ? "text-gray-400" : "text-[#1877f2] font-bold dark:text-[#2d88ff]"}>{selectedIds.size} bạn bè</span>
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#3a3b3c] transition"
            >
              Hủy
            </button>
            <button
              onClick={handleCreateGroup}
              disabled={creating || selectedIds.size < 1}
              className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 shadow-sm shadow-blue-500/30"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Tạo Nhóm ({selectedIds.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
