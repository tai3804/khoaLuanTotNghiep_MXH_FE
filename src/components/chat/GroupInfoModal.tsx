import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, LogOut, Edit2, Check, Shield, Loader2, Trash2 } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../common/UserAvatar';

interface GroupInfoModalProps {
  isOpen: boolean;
  conversationId: string;
  initialName?: string;
  onClose: () => void;
  onGroupUpdated?: (updated: any) => void;
  onLeaveGroup?: () => void;
}

export const GroupInfoModal: React.FC<GroupInfoModalProps> = ({
  isOpen,
  conversationId,
  initialName,
  onClose,
  onGroupUpdated,
  onLeaveGroup,
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [groupDetail, setGroupDetail] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(initialName || '');
  const [savingName, setSavingName] = useState(false);

  // Add members
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);

  // Profiles of members (resolved name, avatar)
  const [memberProfiles, setMemberProfiles] = useState<Record<string, { name: string; avatar: string }>>({});

  useEffect(() => {
    if (isOpen && conversationId) {
      fetchDetail();
      setShowAddMembers(false);
      setIsEditingName(false);
      setSelectedFriendIds(new Set());
    }
  }, [isOpen, conversationId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await chatService.getConversationDetail(conversationId);
      if (data) {
        setGroupDetail(data);
        setEditName(data.name || initialName || 'Nhóm chat');

        // Resolve member profiles
        if (Array.isArray(data.members)) {
          const profiles: Record<string, { name: string; avatar: string }> = {};
          await Promise.all(
            data.members.map(async (m: any) => {
              const uid = String(m.userId);
              try {
                const prof = await userService.getUserProfile(uid);
                const fullName =
                  prof.fullName ||
                  [prof.lastName, prof.middleName, prof.firstName].filter(Boolean).join(' ') ||
                  prof.username ||
                  m.nickname ||
                  'Thành viên';
                const avatar = prof.avatarUrl || prof.avatar || '/default-avatar.png';
                profiles[uid] = { name: fullName, avatar };
              } catch {
                profiles[uid] = { name: m.nickname || 'Thành viên', avatar: '/default-avatar.png' };
              }
            })
          );
          setMemberProfiles(profiles);
        }
      }
    } catch (err) {
      console.error('[GroupInfoModal] Error loading detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async () => {
    const currentMember = (groupDetail?.members || []).find((m: any) => String(m.userId) === String(user?.id));
    if (currentMember?.role !== 'ADMIN') {
      toast.showError('Chỉ quản trị viên mới có thể đổi tên nhóm.');
      return;
    }
    if (!editName.trim()) return;
    setSavingName(true);
    try {
      const updated = await chatService.updateGroupInfo(conversationId, { name: editName.trim() });
      toast.showSuccess('Đã cập nhật tên nhóm!');
      setIsEditingName(false);
      if (onGroupUpdated) {
        onGroupUpdated(updated);
      }
      window.dispatchEvent(new CustomEvent('group_chat_updated'));
      fetchDetail();
    } catch (err: any) {
      toast.showError('Không thể đổi tên: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingName(false);
    }
  };

  const handleOpenAddMembers = async () => {
    const currentMember = (groupDetail?.members || []).find((m: any) => String(m.userId) === String(user?.id));
    if (currentMember?.role !== 'ADMIN') {
      toast.showError('Chỉ quản trị viên mới có thể thêm thành viên.');
      return;
    }
    setShowAddMembers(true);
    setLoadingFriends(true);
    try {
      const data = await userService.getFriends();
      if (Array.isArray(data)) {
        // Exclude current members
        const currentMemberUids = new Set(
          (groupDetail?.members || []).map((m: any) => String(m.userId))
        );
        const eligible = data.filter((f) => !currentMemberUids.has(String(f.userId || f.id)));
        setFriends(eligible);
      }
    } catch (err) {
      console.error('Failed to load friends for adding', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleAddMembersSubmit = async () => {
    if (selectedFriendIds.size === 0) return;
    setAddingMembers(true);
    try {
      await chatService.addGroupMembers(conversationId, Array.from(selectedFriendIds));
      toast.showSuccess(`Đã thêm ${selectedFriendIds.size} thành viên vào nhóm!`);
      setShowAddMembers(false);
      setSelectedFriendIds(new Set());
      window.dispatchEvent(new CustomEvent('group_chat_updated'));
      fetchDetail();
    } catch (err: any) {
      toast.showError('Thêm thành viên thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingMembers(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn rời khỏi nhóm này không?')) return;
    try {
      await chatService.leaveGroup(conversationId);
      toast.showSuccess('Đã rời khỏi nhóm chat.');
      window.dispatchEvent(new CustomEvent('group_chat_updated'));
      onClose();
      if (onLeaveGroup) {
        onLeaveGroup();
      }
    } catch (err: any) {
      toast.showError('Rời nhóm thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRemoveMember = async (targetUserId: string, memberName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${memberName}" khỏi nhóm?`)) return;
    try {
      await chatService.removeGroupMember(conversationId, targetUserId);
      toast.showSuccess(`Đã xóa ${memberName} khỏi nhóm.`);
      fetchDetail();
    } catch (err: any) {
      toast.showError('Xóa thành viên thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!isOpen) return null;

  const currentMember = (groupDetail?.members || []).find(
    (m: any) => String(m.userId) === String(user?.id)
  );
  const isAdmin = currentMember?.role === 'ADMIN';

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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between sticky top-0 bg-white dark:bg-[#242526] z-10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1877f2]" />
            <h3 className="font-bold text-gray-900 dark:text-[#e4e6eb] text-base">
              Thông tin nhóm chat
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-[#b0b3b8] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#1877f2]" />
              <span className="text-xs font-medium">Đang tải thông tin nhóm...</span>
            </div>
          ) : (
            <>
              {/* Group Overview Banner */}
              <div className="flex flex-col items-center text-center space-y-2 pb-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-2xl shadow-md ring-4 ring-blue-50 dark:ring-blue-900/30">
                  <Users className="w-10 h-10" />
                </div>

                {isEditingName ? (
                  <div className="flex items-center gap-2 mt-1 w-full max-w-xs">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm bg-gray-50 dark:bg-[#3a3b3c] border border-gray-300 dark:border-[#4e4f50] rounded-lg text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                      placeholder="Nhập tên mới..."
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName || !editName.trim()}
                      className="p-2 bg-[#1877f2] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                      title="Lưu"
                    >
                      {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditName(groupDetail?.name || '');
                        setIsEditingName(false);
                      }}
                      className="p-2 bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8] rounded-lg hover:bg-gray-300 transition"
                      title="Hủy"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-lg text-gray-900 dark:text-[#e4e6eb]">
                      {groupDetail?.name || 'Nhóm chat'}
                    </h4>
                    {isAdmin && <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full transition"
                      title="Đổi tên nhóm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>}
                  </div>
                )}

                <span className="text-xs text-gray-500 dark:text-[#b0b3b8] font-medium">
                  {groupDetail?.members?.length || 0} thành viên
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleOpenAddMembers}
                  disabled={!isAdmin}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-[#1877f2] dark:text-[#4599ff] rounded-xl text-xs font-bold transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm thành viên
                </button>
                <button
                  onClick={handleLeaveGroup}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition"
                >
                  <LogOut className="w-4 h-4" />
                  Rời khỏi nhóm
                </button>
              </div>

              {/* Add Members Sub-Panel */}
              {showAddMembers && (
                <div className="p-3 bg-gray-50 dark:bg-[#3a3b3c]/30 rounded-xl border border-gray-200 dark:border-[#393a3b] space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb]">
                      Chọn bạn bè để thêm:
                    </h5>
                    <button
                      onClick={() => setShowAddMembers(false)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Đóng
                    </button>
                  </div>

                  {loadingFriends ? (
                    <div className="py-4 text-center text-xs text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-1 text-[#1877f2]" />
                      Đang tải danh sách bạn bè...
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="py-3 text-center text-xs text-gray-400">
                      Tất cả bạn bè của bạn đã ở trong nhóm.
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {friends.map((friend) => {
                        const fid = String(friend.userId || friend.id);
                        const isSelected = selectedFriendIds.has(fid);
                        const name = getFriendName(friend);
                        const avatar = friend.avatarUrl || friend.avatar || '/default-avatar.png';
                        return (
                          <div
                            key={fid}
                            onClick={() => {
                              setSelectedFriendIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(fid)) next.delete(fid);
                                else next.add(fid);
                                return next;
                              });
                            }}
                            className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <UserAvatar src={avatar} alt={name} size="sm" />
                              <span className="text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] truncate">
                                {name}
                              </span>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'bg-[#1877f2] border-[#1877f2]' : 'border-gray-300'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {friends.length > 0 && (
                    <button
                      onClick={handleAddMembersSubmit}
                      disabled={addingMembers || selectedFriendIds.size === 0}
                      className="w-full py-2 bg-[#1877f2] hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      {addingMembers && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Thêm {selectedFriendIds.size} bạn bè đã chọn
                    </button>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider">
                  Danh sách thành viên ({groupDetail?.members?.length || 0})
                </h5>

                <div className="space-y-1.5 divide-y divide-gray-100 dark:divide-[#393a3b]/40">
                  {(groupDetail?.members || []).map((m: any) => {
                    const uid = String(m.userId);
                    const prof = memberProfiles[uid];
                    const isCurrentUser = uid === String(user?.id);
                    const isMemberAdmin = m.role === 'ADMIN';

                    return (
                      <div
                        key={uid}
                        className="flex items-center justify-between pt-1.5 first:pt-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UserAvatar src={prof?.avatar} alt={prof?.name || 'Thành viên'} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] truncate">
                                {prof?.name || 'Đang tải...'}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[10px] text-gray-400 font-normal">(Bạn)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {isMemberAdmin ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                  <Shield className="w-2.5 h-2.5" /> Quản trị viên
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">Thành viên</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Admin Action: Remove other members */}
                        {isAdmin && !isCurrentUser && (
                          <button
                            onClick={() => handleRemoveMember(uid, prof?.name || 'thành viên')}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition"
                            title="Xóa khỏi nhóm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
