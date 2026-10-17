import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldCheck, UserPlus, Search, UserMinus, UserX, Check, X, Lock, Crown, Undo2, Loader2 } from 'lucide-react';
import { groupService, GroupResponse, CommunityGroupMember } from '../../services/groupService';
import { UserAvatar } from '../common/UserAvatar';
import { ConfirmModal } from '../common/ConfirmModal';
import { Skeleton } from '../common/Skeleton';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';

interface GroupMembersTabProps {
  group: GroupResponse;
  onInviteClick?: () => void;
  onNavigateProfile?: (userId: string) => void;
}

type MemberAction = 'remove' | 'ban' | 'unban' | 'transfer';

const CONFIRM_COPY: Record<MemberAction, { title: string; confirmText: string; type: 'danger' | 'warning'; message: (name: string) => string; success: string }> = {
  remove: {
    title: 'Xóa khỏi nhóm?',
    confirmText: 'Xóa khỏi nhóm',
    type: 'danger',
    message: (name) => `${name} sẽ bị xóa khỏi nhóm nhưng vẫn có thể tham gia lại sau.`,
    success: 'Đã xóa thành viên khỏi nhóm.',
  },
  ban: {
    title: 'Cấm thành viên?',
    confirmText: 'Cấm khỏi nhóm',
    type: 'danger',
    message: (name) => `${name} sẽ bị cấm và không thể tham gia lại nhóm cho đến khi bạn gỡ cấm.`,
    success: 'Đã cấm thành viên khỏi nhóm.',
  },
  unban: {
    title: 'Gỡ cấm thành viên?',
    confirmText: 'Gỡ cấm',
    type: 'warning',
    message: (name) => `${name} sẽ có thể tham gia lại nhóm.`,
    success: 'Đã gỡ cấm thành viên.',
  },
  transfer: {
    title: 'Chuyển quyền chủ nhóm?',
    confirmText: 'Chuyển quyền',
    type: 'warning',
    message: (name) => `${name} sẽ trở thành chủ nhóm mới và bạn không còn là chủ nhóm. Thao tác này không thể tự hoàn tác.`,
    success: 'Đã chuyển quyền chủ nhóm.',
  },
};

const roleLabel = (role: CommunityGroupMember['role']) =>
  role === 'ADMIN' ? 'Quản trị viên' : role === 'MODERATOR' ? 'Người kiểm duyệt' : 'Thành viên';

export const GroupMembersTab: React.FC<GroupMembersTabProps> = ({ group, onInviteClick, onNavigateProfile }) => {
  const toast = useToast();
  const [members, setMembers] = useState<CommunityGroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMemberId, setActionMemberId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ action: MemberAction; member: CommunityGroupMember } | null>(null);
  const loadSeq = useRef(0);

  const canModerate = Boolean(group.isAdmin || group.isModerator);
  const isPrivateLocked = group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin;

  const loadMembers = useCallback(async (silent = false) => {
    const seq = ++loadSeq.current;
    if (isPrivateLocked) {
      setMembers([]);
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      const data = await groupService.getGroupMembers(group.id, canModerate);
      if (seq === loadSeq.current) setMembers(data);
    } catch (err) {
      if (seq === loadSeq.current) setLoadError(getApiErrorMessage(err, 'Không thể tải danh sách thành viên.'));
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  }, [group.id, canModerate, isPrivateLocked]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers, group.memberCount]);

  const query = searchQuery.trim().toLowerCase();
  const approved = members.filter((m) => !m.status || m.status === 'APPROVED');
  const matching = approved.filter((m) => m.name.toLowerCase().includes(query));
  const staff = matching.filter((m) => m.role === 'ADMIN' || m.role === 'MODERATOR');
  const regularMembers = matching.filter((m) => m.role !== 'ADMIN' && m.role !== 'MODERATOR');
  const pendingMembers = members.filter((m) => m.status === 'PENDING');
  const bannedMembers = members.filter((m) => m.status === 'BANNED');

  const runAction = async (memberId: string, action: () => Promise<unknown>, successMessage: string) => {
    try {
      setActionMemberId(memberId);
      await action();
      toast.showSuccess(successMessage);
      await loadMembers(true);
      return true;
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Thao tác không thành công, vui lòng thử lại.'));
      return false;
    } finally {
      setActionMemberId(null);
    }
  };

  const confirmAction = async () => {
    if (!confirm) return;
    const { action, member } = confirm;
    const run = {
      remove: () => groupService.removeMember(group.id, member.id, false),
      ban: () => groupService.removeMember(group.id, member.id, true),
      unban: () => groupService.unbanMember(group.id, member.id),
      transfer: () => groupService.transferOwnership(group.id, member.id),
    }[action];
    await runAction(member.id, run, CONFIRM_COPY[action].success);
    setConfirm(null);
  };

  /** Quản trị viên chỉ bị xóa/cấm bởi quản trị viên khác; chủ nhóm thì không ai được xóa. */
  const canRemove = (member: CommunityGroupMember) =>
    canModerate && member.id !== group.ownerId && (member.role !== 'ADMIN' || group.isAdmin);

  const renderMember = (member: CommunityGroupMember) => {
    const busy = actionMemberId === member.id;
    const isOwnerRow = member.id === group.ownerId;
    return (
      <div
        key={member.id}
        className="flex items-center justify-between gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/60 transition border border-gray-100 dark:border-transparent"
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onNavigateProfile?.(member.id)}
            title={`Xem trang cá nhân của ${member.name}`}
            aria-label={`Xem trang cá nhân của ${member.name}`}
            className="rounded-full shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
          >
            <UserAvatar src={member.avatar} alt={member.name} size="md" className="w-11 h-11 rounded-full" />
          </button>
          <div className="min-w-0">
            <div className="font-semibold text-sm text-gray-900 dark:text-[#e4e6eb] truncate">{member.name}</div>
            {isOwnerRow ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                <Crown className="w-3 h-3" /> Chủ nhóm
              </span>
            ) : member.role !== 'MEMBER' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-[#1877f2]">
                <ShieldCheck className="w-3 h-3" /> {roleLabel(member.role)}
              </span>
            ) : (
              <div className="text-xs text-gray-500 dark:text-[#b0b3b8]">Thành viên nhóm</div>
            )}
          </div>
        </div>

        {!isOwnerRow && (group.isAdmin || canRemove(member)) && (
          <div className="flex items-center gap-1 shrink-0">
            {group.isAdmin && (
              <select
                disabled={busy}
                value={member.role}
                aria-label={`Vai trò của ${member.name}`}
                onChange={(e) => {
                  const role = e.target.value as CommunityGroupMember['role'];
                  void runAction(member.id, () => groupService.changeMemberRole(group.id, member.id, role), 'Đã cập nhật vai trò.');
                }}
                className="text-xs rounded-lg bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] p-1.5 border border-transparent focus:outline-none cursor-pointer"
              >
                <option value="ADMIN">Quản trị viên</option>
                <option value="MODERATOR">Kiểm duyệt</option>
                <option value="MEMBER">Thành viên</option>
              </select>
            )}
            {group.isOwner && (
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirm({ action: 'transfer', member })}
                title="Chuyển quyền chủ nhóm"
                aria-label={`Chuyển quyền chủ nhóm cho ${member.name}`}
                className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition cursor-pointer disabled:opacity-50"
              >
                <Crown className="w-4 h-4" />
              </button>
            )}
            {canRemove(member) && (
              <>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirm({ action: 'remove', member })}
                  title="Xóa khỏi nhóm"
                  aria-label={`Xóa ${member.name} khỏi nhóm`}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition cursor-pointer disabled:opacity-50"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirm({ action: 'ban', member })}
                  title="Cấm khỏi nhóm"
                  aria-label={`Cấm ${member.name} khỏi nhóm`}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition cursor-pointer disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">
            Thành viên · <span className="text-[#1877f2]">{group.memberCount}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
            {group.privacy === 'PRIVATE'
              ? 'Chỉ thành viên mới nhìn thấy những người trong nhóm và những gì họ đăng.'
              : 'Những người trong nhóm này có thể xem và chia sẻ bài viết cùng nhau.'}
          </p>
        </div>

        {canModerate && onInviteClick && (
          <button
            type="button"
            onClick={onInviteClick}
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Mời bạn bè
          </button>
        )}
      </div>

      {isPrivateLocked ? (
        <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">Danh sách thành viên ở chế độ riêng tư</h3>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto leading-relaxed">
            Chỉ thành viên của nhóm mới có thể xem toàn bộ danh sách thành viên trong nhóm này.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thành viên theo tên..."
                aria-label="Tìm thành viên"
                className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-5 grid grid-cols-1 sm:grid-cols-2 gap-3" aria-busy="true">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton variant="circular" width="44px" height="44px" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" height="0.9rem" />
                    <Skeleton variant="text" width="35%" height="0.7rem" />
                  </div>
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div role="alert" className="bg-white dark:bg-[#242526] rounded-2xl border border-red-200 dark:border-red-900/50 p-8 text-center">
              <p className="text-sm text-red-600 dark:text-red-300">{loadError}</p>
              <button type="button" onClick={() => void loadMembers()} className="mt-3 px-4 py-2 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold cursor-pointer">
                Thử lại
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {canModerate && pendingMembers.length > 0 && (
                <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-blue-200 dark:border-blue-900/50 p-5">
                  <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb] mb-4">
                    Yêu cầu tham gia cần duyệt ({pendingMembers.length})
                  </h3>
                  <div className="space-y-2">
                    {pendingMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-[#393a3b] p-3 hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/40 transition">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar src={member.avatar} alt={member.name} size="md" />
                          <span className="font-semibold text-sm text-gray-900 dark:text-[#e4e6eb] truncate">{member.name}</span>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={actionMemberId === member.id}
                            onClick={() => runAction(member.id, () => groupService.reviewMember(group.id, member.id, true), 'Đã duyệt yêu cầu tham gia.')}
                            className="rounded-lg bg-[#1877f2] hover:bg-[#166fe5] px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer disabled:opacity-60 inline-flex items-center"
                          >
                            {actionMemberId === member.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                            Duyệt
                          </button>
                          <button
                            type="button"
                            disabled={actionMemberId === member.id}
                            onClick={() => runAction(member.id, () => groupService.reviewMember(group.id, member.id, false), 'Đã từ chối yêu cầu tham gia.')}
                            className="rounded-lg bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer disabled:opacity-60 inline-flex items-center"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Từ chối
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {staff.length > 0 && (
                <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-5 h-5 text-[#1877f2]" />
                    <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
                      Quản trị viên & Người kiểm duyệt ({staff.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{staff.map(renderMember)}</div>
                </div>
              )}

              <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-5">
                <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb] mb-4">Thành viên ({regularMembers.length})</h3>
                {regularMembers.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500 dark:text-[#b0b3b8]">
                    {query ? 'Không tìm thấy thành viên nào phù hợp với tìm kiếm.' : 'Chưa có thêm thành viên nào khác.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{regularMembers.map(renderMember)}</div>
                )}
              </div>

              {canModerate && bannedMembers.length > 0 && (
                <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-red-200 dark:border-red-900/40 p-5">
                  <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb] mb-4">Thành viên bị cấm ({bannedMembers.length})</h3>
                  <div className="space-y-2">
                    {bannedMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-[#393a3b] p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar src={member.avatar} alt={member.name} size="md" />
                          <span className="font-semibold text-sm text-gray-900 dark:text-[#e4e6eb] truncate">{member.name}</span>
                        </div>
                        <button
                          type="button"
                          disabled={actionMemberId === member.id}
                          onClick={() => setConfirm({ action: 'unban', member })}
                          className="shrink-0 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer disabled:opacity-60 inline-flex items-center"
                        >
                          <Undo2 className="w-3.5 h-3.5 mr-1" />
                          Gỡ cấm
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={Boolean(confirm)}
        title={confirm ? CONFIRM_COPY[confirm.action].title : undefined}
        message={confirm ? CONFIRM_COPY[confirm.action].message(confirm.member.name) : ''}
        confirmText={confirm ? CONFIRM_COPY[confirm.action].confirmText : undefined}
        type={confirm ? CONFIRM_COPY[confirm.action].type : 'danger'}
        loading={Boolean(confirm && actionMemberId === confirm.member.id)}
        onConfirm={confirmAction}
        onClose={() => { if (!actionMemberId) setConfirm(null); }}
      />
    </div>
  );
};
