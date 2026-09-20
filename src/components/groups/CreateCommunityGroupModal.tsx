import React, { useState, useEffect } from 'react';
import { X, Users, Globe, Lock, Loader2, UserPlus, Check, Search } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../common/UserAvatar';

interface CreateCommunityGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: (group: any) => void;
}

export const CreateCommunityGroupModal: React.FC<CreateCommunityGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  const [friendSearch, setFriendSearch] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSelectedFriendIds(new Set());
      setFriendSearch('');
      loadFriends();
    }
  }, [isOpen]);

  const loadFriends = async () => {
    setLoadingFriends(true);
    try {
      const data = await userService.getFriends();
      if (Array.isArray(data)) {
        setFriends(data);
      }
    } catch (err) {
      console.error('Failed to load friends', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  if (!isOpen) return null;

  const toggleFriend = (id: string) => {
    setSelectedFriendIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

  const filteredFriends = friends.filter((f) => {
    const n = getFriendName(f);
    return n.toLowerCase().includes(friendSearch.toLowerCase());
  });

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      toast.showError('Vui lòng nhập tên nhóm cộng đồng.');
      return;
    }
    try {
      setCreating(true);
      const group = await groupService.createGroup({
        name: name.trim(),
        description: description.trim(),
        privacy: privacy,
        initialMemberIds: Array.from(selectedFriendIds),
      });
      toast.showSuccess(`Đã tạo nhóm "${group.name}" thành công!`);
      onClose();
      if (onGroupCreated) {
        onGroupCreated(group);
      }
      navigate(`/groups/${group.id}`);
    } catch (error: any) {
      console.error('Failed to create group', error);
      toast.showError('Không thể tạo nhóm, vui lòng thử lại sau.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">
                Tạo nhóm cộng đồng
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                Kết nối nhiều người có chung sở thích
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={creating}
            className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] rounded-full text-gray-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
              Tên nhóm cộng đồng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Hội yêu thích công nghệ IUH..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c]/50 border border-gray-200 dark:border-[#393a3b] rounded-xl text-sm text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
              Mô tả nhóm <span className="text-gray-400 font-normal">(tùy chọn)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả mục đích hoạt động của nhóm..."
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c]/50 border border-gray-200 dark:border-[#393a3b] rounded-xl text-sm text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
              Quyền riêng tư
            </label>
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${privacy === 'PUBLIC' ? 'border-[#1877f2] bg-blue-50/70 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50'}`}>
                <input type="radio" name="privacy" checked={privacy === 'PUBLIC'} onChange={() => setPrivacy('PUBLIC')} className="mt-1 text-[#1877f2]" />
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-gray-900 dark:text-[#e4e6eb]">
                    <Globe className="w-3.5 h-3.5 text-[#1877f2]" /> Công khai
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-0.5">Bất kỳ ai cũng có thể tìm thấy nhóm và xem bài viết.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${privacy === 'PRIVATE' ? 'border-[#1877f2] bg-blue-50/70 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50'}`}>
                <input type="radio" name="privacy" checked={privacy === 'PRIVATE'} onChange={() => setPrivacy('PRIVATE')} className="mt-1 text-[#1877f2]" />
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-1.5 text-xs text-gray-900 dark:text-[#e4e6eb]">
                    <Lock className="w-3.5 h-3.5 text-amber-500" /> Riêng tư
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-0.5">Chỉ thành viên mới nhìn thấy ai trong nhóm và nội dung đăng.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Invite friends (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8] flex items-center gap-1">
                <UserPlus className="w-3.5 h-3.5 text-[#1877f2]" /> Mời bạn bè <span className="text-gray-400 font-normal">(tùy chọn)</span>
              </label>
              {selectedFriendIds.size > 0 && (
                <span className="text-xs font-bold text-[#1877f2]">
                  Đã chọn {selectedFriendIds.size} bạn bè
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Tìm bạn bè để thêm vào nhóm..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-[#3a3b3c]/50 border border-gray-200 dark:border-[#393a3b] rounded-lg text-xs text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2]"
              />
            </div>

            <div className="max-h-36 overflow-y-auto border border-gray-200 dark:border-[#393a3b] rounded-xl p-1 divide-y divide-gray-100 dark:divide-gray-800">
              {loadingFriends ? (
                <div className="py-4 flex items-center justify-center text-xs text-gray-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1877f2]" /> Đang tải danh sách bạn bè...
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400">
                  {friends.length === 0 ? 'Bạn chưa có bạn bè nào trong danh sách.' : 'Không tìm thấy bạn bè nào phù hợp.'}
                </div>
              ) : (
                filteredFriends.map((f) => {
                  const uid = String(f.userId || f.id);
                  const name = getFriendName(f);
                  const isSelected = selectedFriendIds.has(uid);
                  return (
                    <div
                      key={uid}
                      onClick={() => toggleFriend(uid)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                        isSelected ? 'bg-blue-50/70 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <UserAvatar src={f.avatarUrl || f.avatar || '/default-avatar.png'} alt={name} size="sm" className="w-7 h-7 rounded-full" />
                        <span className="text-xs font-semibold text-gray-900 dark:text-[#e4e6eb] truncate">
                          {name}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                          isSelected ? 'bg-[#1877f2] border-[#1877f2]' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#242526] flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#3a3b3c] rounded-xl transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            disabled={!name.trim() || creating}
            onClick={handleCreateGroup}
            className="px-6 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/30 cursor-pointer"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Tạo nhóm {selectedFriendIds.size > 0 ? `(${selectedFriendIds.size + 1} người)` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

