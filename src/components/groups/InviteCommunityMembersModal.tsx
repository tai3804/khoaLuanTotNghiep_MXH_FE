import React, { useEffect, useMemo, useState } from 'react';
import { X, UserPlus, Search, Check, Loader2, Link2, Users } from 'lucide-react';
import { groupService, GroupResponse, getGroupLink } from '../../services/groupService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { UserAvatar } from '../common/UserAvatar';
import { Skeleton } from '../common/Skeleton';
import { normalizeText } from './groupTabUi';

interface InviteCommunityMembersModalProps {
  isOpen: boolean;
  group: GroupResponse;
  onClose: () => void;
  onMembersAdded: () => void;
}

interface FriendOption {
  id: string;
  name: string;
  avatar: string;
}

const friendNameOf = (friend: any): string => {
  if (!friend) return 'Bạn bè';
  if (typeof friend === 'string') return friend;
  for (const key of ['name', 'fullName', 'displayName']) {
    if (typeof friend[key] === 'string' && friend[key].trim()) return friend[key].trim();
  }
  const parts = [friend.lastName, friend.middleName, friend.firstName]
    .filter((p) => typeof p === 'string' && p.trim())
    .join(' ')
    .trim();
  if (parts) return parts;
  if (typeof friend.username === 'string' && friend.username.trim()) return friend.username.trim();
  if (typeof friend.email === 'string' && friend.email.trim()) return friend.email.trim();
  return 'Thành viên';
};

/**
 * Mời/thêm bạn bè vào nhóm. Mọi thành viên đều mời được: quản trị/kiểm duyệt viên thêm thẳng bạn vào nhóm,
 * thành viên thường gửi lời mời (người được mời phải chấp nhận).
 */
export const InviteCommunityMembersModal: React.FC<InviteCommunityMembersModalProps> = ({
  isOpen,
  group,
  onClose,
  onMembersAdded,
}) => {
  const toast = useToast();
  const isStaff = Boolean(group.isAdmin || group.isModerator);
  const [friends, setFriends] = useState<FriendOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadEligibleFriends = async () => {
    setLoading(true);
    setLoadError('');
    try {
      // Loại những người đã ở trong nhóm (danh sách thành viên đã duyệt, ai cũng gọi được) khỏi danh sách có thể mời
      const [data, existing] = await Promise.all([
        userService.getFriends(),
        groupService.getGroupMembers(group.id, false).catch(() => []),
      ]);
      const inGroup = new Set<string>([group.ownerId, ...existing.map((m) => m.id)]);
      const options: FriendOption[] = (Array.isArray(data) ? data : [])
        .map((f: any) => ({
          id: String(f.userId || f.id),
          name: friendNameOf(f),
          avatar: f.avatarUrl || f.avatar || '/default-avatar.png',
        }))
        .filter((f) => !inGroup.has(f.id));
      setFriends(options);
    } catch (err) {
      setLoadError(getApiErrorMessage(err, 'Không thể tải danh sách bạn bè.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && group) {
      setSelectedIds(new Set());
      setSearchQuery('');
      setCopied(false);
      void loadEligibleFriends();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, group?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !inviting) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, inviting, onClose]);

  const filteredFriends = useMemo(() => {
    const q = normalizeText(searchQuery);
    return q ? friends.filter((f) => normalizeText(f.name).includes(q)) : friends;
  }, [friends, searchQuery]);

  const selectedFriends = useMemo(() => friends.filter((f) => selectedIds.has(f.id)), [friends, selectedIds]);

  const toggleSelect = (uid: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getGroupLink(group.id));
      setCopied(true);
      toast.showSuccess('Đã sao chép liên kết nhóm.');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.showError('Không sao chép được liên kết, hãy thử lại.');
    }
  };

  const handleInviteSubmit = async () => {
    if (selectedIds.size === 0 || inviting) return;
    setInviting(true);
    try {
      const ids = Array.from(selectedIds);
      await groupService.addGroupMembers(group.id, ids);
      toast.showSuccess(isStaff ? `Đã thêm ${ids.length} thành viên vào nhóm.` : `Đã gửi lời mời tới ${ids.length} bạn bè.`);
      onMembersAdded();
      onClose();
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể mời bạn bè, vui lòng thử lại.'));
    } finally {
      setInviting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="invite-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!inviting ? onClose : undefined} />

      <div className="relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#242526]">
        <div className="relative border-b border-gray-200 px-5 py-4 text-center dark:border-[#393a3b]">
          <h3 id="invite-title" className="text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb]">Mời bạn bè vào nhóm</h3>
          <p className="mx-auto mt-0.5 max-w-[300px] truncate text-xs text-gray-500 dark:text-[#b0b3b8]">{group.name}</p>
          <button
            type="button"
            onClick={onClose}
            disabled={inviting}
            aria-label="Đóng"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:text-[#b0b3b8] dark:hover:bg-[#4e4f50] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 border-b border-gray-100 p-4 dark:border-[#393a3b]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bạn bè theo tên"
              aria-label="Tìm bạn bè"
              className="w-full rounded-full bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1877f2] dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
            />
          </div>

          {selectedFriends.length > 0 && (
            <div className="flex flex-wrap gap-1.5" aria-label="Bạn bè đã chọn">
              {selectedFriends.map((f) => (
                <span key={f.id} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-1 pr-2 text-xs font-semibold text-[#1877f2] dark:bg-blue-900/30">
                  <UserAvatar src={f.avatar} alt={f.name} size="sm" className="h-5 w-5 rounded-full" />
                  <span className="max-w-[120px] truncate">{f.name}</span>
                  <button type="button" onClick={() => toggleSelect(f.id)} aria-label={`Bỏ chọn ${f.name}`} className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 cursor-pointer">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div aria-busy="true" className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5">
                  <Skeleton variant="circular" width="40px" height="40px" />
                  <Skeleton variant="text" width="45%" height="0.9rem" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div role="alert" className="py-10 text-center">
              <p className="text-sm text-red-600 dark:text-red-300">{loadError}</p>
              <button type="button" onClick={() => void loadEligibleFriends()} className="mt-3 rounded-xl bg-[#1877f2] px-4 py-2 text-sm font-bold text-white cursor-pointer">Thử lại</button>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Users className="mb-2 h-9 w-9 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-semibold text-gray-700 dark:text-[#e4e6eb]">
                {friends.length === 0 ? 'Không còn bạn bè nào để mời' : 'Không tìm thấy bạn bè phù hợp'}
              </p>
              <p className="mt-1 max-w-[260px] text-xs text-gray-500 dark:text-[#b0b3b8]">
                {friends.length === 0 ? 'Tất cả bạn bè của bạn đã ở trong nhóm. Bạn vẫn có thể gửi liên kết nhóm cho họ.' : 'Thử gõ tên khác.'}
              </p>
            </div>
          ) : (
            <ul>
              {filteredFriends.map((friend) => {
                const isSelected = selectedIds.has(friend.id);
                return (
                  <li key={friend.id}>
                    <button
                      type="button"
                      onClick={() => toggleSelect(friend.id)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center justify-between rounded-xl p-2.5 text-left transition cursor-pointer ${isSelected ? 'bg-blue-50/70 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'}`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <UserAvatar src={friend.avatar} alt={friend.name} size="md" className="h-10 w-10 rounded-full" />
                        <span className="truncate text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">{friend.name}</span>
                      </span>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${isSelected ? 'border-[#1877f2] bg-[#1877f2]' : 'border-gray-300 dark:border-gray-600'}`}>
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-3 border-t border-gray-200 bg-gray-50 px-5 py-3.5 dark:border-[#393a3b] dark:bg-[#242526]">
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            {isStaff
              ? 'Bạn bè được chọn sẽ được thêm thẳng vào nhóm và nhận thông báo.'
              : group.privacy === 'PRIVATE'
                ? 'Bạn bè sẽ nhận lời mời. Nhóm riêng tư cần quản trị viên duyệt sau khi họ chấp nhận.'
                : 'Bạn bè sẽ nhận lời mời và vào nhóm khi chấp nhận.'}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c] cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
              {copied ? 'Đã sao chép' : 'Sao chép liên kết'}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={inviting}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleInviteSubmit}
                disabled={inviting || selectedIds.size === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877f2] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {inviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                {isStaff ? `Thêm vào nhóm (${selectedIds.size})` : `Gửi lời mời (${selectedIds.size})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
