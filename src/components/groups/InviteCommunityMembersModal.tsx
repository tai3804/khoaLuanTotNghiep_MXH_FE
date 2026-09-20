import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Check, Loader2 } from 'lucide-react';
import { groupService, GroupResponse } from '../../services/groupService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../common/UserAvatar';

interface InviteCommunityMembersModalProps {
  isOpen: boolean;
  group: GroupResponse;
  onClose: () => void;
  onMembersAdded: () => void;
}

export const InviteCommunityMembersModal: React.FC<InviteCommunityMembersModalProps> = ({
  isOpen,
  group,
  onClose,
  onMembersAdded,
}) => {
  const toast = useToast();
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (isOpen && group) {
      setSelectedIds(new Set());
      setSearchQuery('');
      loadEligibleFriends();
    }
  }, [isOpen, group?.id]);

  const loadEligibleFriends = async () => {
    setLoading(true);
    try {
      const data = await userService.getFriends();
      if (Array.isArray(data)) {
        const currentMemberIds = new Set(group.memberIds || [group.ownerId]);
        const eligible = data.filter((f) => !currentMemberIds.has(String(f.userId || f.id)));
        setFriends(eligible);
      }
    } catch (err) {
      console.error('Failed to load friends for invite', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (uid: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleInviteSubmit = async () => {
    if (selectedIds.size === 0) return;
    setInviting(true);
    try {
      const ids = Array.from(selectedIds);
      await groupService.addGroupMembers(group.id, ids);
      toast.showSuccess(`Đã thêm ${ids.length} thành viên vào nhóm!`);
      onMembersAdded();
      onClose();
    } catch (err) {
      console.error('Failed to invite members', err);
      toast.showError('Không thể mời thành viên, vui lòng thử lại.');
    } finally {
      setInviting(false);
    }
  };

  const getFriendName = (friend: any): string => {
    if (!friend) return 'Bạn bè';
    if (typeof friend === 'string') return friend;
    if (friend.name && typeof friend.name === 'string' && friend.name.trim()) return friend.name.trim();
    if (friend.fullName && typeof friend.fullName === 'string' && friend.fullName.trim()) return friend.fullName.trim();
    if (friend.displayName && typeof friend.displayName === 'string' && friend.displayName.trim()) return friend.displayName.trim();
    const parts = [friend.lastName, friend.middleName, friend.firstName]
      .filter((p) => typeof p === 'string' && p.trim())
      .join(' ')
      .trim();
    if (parts) return parts;
    if (friend.username && typeof friend.username === 'string' && friend.username.trim()) return friend.username.trim();
    if (friend.email && typeof friend.email === 'string' && friend.email.trim()) return friend.email.trim();
    return 'Thành viên';
  };

  if (!isOpen) return null;

  const filteredFriends = friends.filter((f) => {
    const name = getFriendName(f);
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={!inviting ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between sticky top-0 bg-white dark:bg-[#242526] z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-[#e4e6eb] text-base">
                Mời bạn bè vào nhóm
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] truncate max-w-[240px]">
                {group.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={inviting}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-[#393a3b] bg-gray-50/50 dark:bg-[#242526]">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bạn bè theo tên..."
              className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 text-xs pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-transparent focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#1877f2]" />
              <span className="text-xs">Đang tải danh sách bạn bè...</span>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="py-10 text-center text-xs text-gray-400">
              {friends.length === 0
                ? 'Tất cả bạn bè của bạn đã tham gia nhóm này.'
                : 'Không tìm thấy bạn bè nào phù hợp.'}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredFriends.map((friend) => {
                const uid = String(friend.userId || friend.id);
                const name = getFriendName(friend);
                const avatar = friend.avatarUrl || friend.avatar || '/default-avatar.png';
                const isSelected = selectedIds.has(uid);

                return (
                  <div
                    key={uid}
                    onClick={() => toggleSelect(uid)}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar src={avatar} alt={name} size="md" className="w-10 h-10 rounded-full" />
                      <span className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                        {name}
                      </span>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        isSelected
                          ? 'bg-[#1877f2] border-[#1877f2]'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#242526] flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-[#b0b3b8]">
            Đã chọn: <span className="text-[#1877f2] font-bold">{selectedIds.size}</span> bạn bè
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={inviting}
              className="px-4 py-2 text-xs font-bold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#3a3b3c] rounded-xl transition"
            >
              Hủy
            </button>
            <button
              onClick={handleInviteSubmit}
              disabled={inviting || selectedIds.size === 0}
              className="px-5 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/30"
            >
              {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Mời vào nhóm ({selectedIds.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
