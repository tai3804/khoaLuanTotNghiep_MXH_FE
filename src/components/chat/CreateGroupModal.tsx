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
    if (selectedIds.size < 2) {
      toast.showError('Vui lòng chọn ít nhất 2 thành viên để tạo nhóm chat.');
      return;
    }
    setCreating(true);
    try {
      const memberIds = Array.from(selectedIds);
      const conversation = await chatService.createGroupChat(groupName.trim() || 'Nhóm chat mới', memberIds);
      toast.showSuccess('Tạo nhóm chat thành công!');
      onGroupCreated(conversation);
      onClose();
    } catch (err: any) {
      toast.showError('Tạo nhóm thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={!creating ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between sticky top-0 bg-white dark:bg-[#242526] z-10">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1877f2]" />
            Tạo nhóm chat mới
          </h3>
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
            <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">Tên nhóm (tùy chọn)</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhập tên nhóm..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c]/50 border border-gray-200 dark:border-[#393a3b] rounded-xl text-sm font-medium text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition"
            />
          </div>

          {/* Friend Selection */}
          <FriendSelectionList
            friends={friends}
            loading={loadingFriends}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectFriend}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            maxHeight="45vh"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#242526] sticky bottom-0 z-10 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 dark:text-[#b0b3b8]">
            Đã chọn: <span className={selectedIds.size < 2 ? "text-red-500" : "text-[#1877f2] dark:text-[#2d88ff]"}>{selectedIds.size}</span>
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
              disabled={creating || selectedIds.size < 2}
              className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Tạo Nhóm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
