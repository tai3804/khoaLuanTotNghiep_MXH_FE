import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check, ChevronDown, ChevronUp, Crown, Loader2, Lock, Search, ShieldCheck, ShieldOff, UserPlus, Undo2, UserMinus, UserX, Users, X,
} from 'lucide-react';
import { CommunityGroupMember, groupService, GroupResponse, GroupRole, GroupStaffMember } from '../../services/groupService';
import { UserAvatar } from '../common/UserAvatar';
import { Skeleton } from '../common/Skeleton';
import { ConfirmModal } from '../common/ConfirmModal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { EmptyState, ErrorState, LoadMoreButton, TabCard, joinedLabel, normalizeText, requestedLabel, useInfiniteSentinel } from './groupTabUi';
import { MemberRow, MemberMenuItem } from './MemberRow';
import { MemberAction, MemberActionModal } from './MemberActionModal';
import { useGroupMemberList } from './useGroupMemberList';

interface GroupMembersTabProps {
  group: GroupResponse;
  onInviteClick?: () => void;
  onNavigateProfile?: (userId: string) => void;
}

const SearchBox: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="relative">
    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Tìm thành viên"
      aria-label="Tìm thành viên"
      maxLength={100}
      className="w-full rounded-full bg-gray-100 py-2.5 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1877f2] dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:placeholder-[#b0b3b8]"
    />
    {value && (
      <button type="button" onClick={() => onChange('')} aria-label="Xóa từ khóa" className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-[#4e4f50] cursor-pointer">
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

const RowsSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div aria-busy="true" className="space-y-1">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 px-2 py-2.5">
        <Skeleton variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="45%" height="0.9rem" />
          <Skeleton variant="text" width="25%" height="0.7rem" />
        </div>
      </div>
    ))}
  </div>
);

const SectionTitle: React.FC<{ icon?: React.ReactNode; children: React.ReactNode; aside?: React.ReactNode }> = ({ icon, children, aside }) => (
  <div className="mb-2 flex items-center justify-between gap-3 px-2">
    <h3 className="flex items-center gap-2 text-[17px] font-extrabold text-gray-900 dark:text-[#e4e6eb]">{icon}{children}</h3>
    {aside}
  </div>
);

export const GroupMembersTab: React.FC<GroupMembersTabProps> = ({ group, onInviteClick, onNavigateProfile }) => {
  const toast = useToast();
  const { user } = useAuth();
  const myId = String(user?.id ?? '');
  const canModerate = Boolean(group.isAdmin || group.isModerator);
  const isPrivateLocked = group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin;

  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const searching = keyword.length > 0;
  useEffect(() => {
    const timer = window.setTimeout(() => setKeyword(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Quản trị viên / kiểm duyệt viên: danh sách nhỏ, không phân trang
  const [staff, setStaff] = useState<GroupStaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState('');
  const loadStaff = useCallback(async (silent = false) => {
    if (isPrivateLocked) {
      setStaff([]);
      setStaffLoading(false);
      return;
    }
    if (!silent) setStaffLoading(true);
    setStaffError('');
    try {
      setStaff(await groupService.getGroupStaff(group.id));
    } catch (err) {
      if (!silent) setStaffError(getApiErrorMessage(err, 'Không thể tải danh sách quản trị viên.'));
    } finally {
      setStaffLoading(false);
    }
  }, [group.id, isPrivateLocked]);
  useEffect(() => { void loadStaff(); }, [loadStaff]);

  const members = useGroupMemberList({ groupId: group.id, scope: 'members', keyword, pageSize: 20, enabled: !isPrivateLocked });
  const pending = useGroupMemberList({ groupId: group.id, scope: 'pending', pageSize: 20, enabled: canModerate && !isPrivateLocked });
  const invited = useGroupMemberList({ groupId: group.id, scope: 'invited', pageSize: 20, enabled: canModerate && !isPrivateLocked });
  const banned = useGroupMemberList({ groupId: group.id, scope: 'banned', pageSize: 20, enabled: canModerate && !isPrivateLocked });

  // Số thành viên đổi (có người vào/ra ở nơi khác): làm mới ngầm các danh sách
  const firstCount = useRef(true);
  useEffect(() => {
    if (firstCount.current) {
      firstCount.current = false;
      return;
    }
    void loadStaff(true);
    void members.reload(true);
    if (canModerate) {
      void pending.reload(true);
      void invited.reload(true);
      void banned.reload(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.memberCount]);

  const sentinel = useInfiniteSentinel(() => void members.loadMore(), !members.loading && !members.loadingMore && !members.last && !members.error);

  const [showInvited, setShowInvited] = useState(false);
  const [showBanned, setShowBanned] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [action, setAction] = useState<{ type: MemberAction; id: string; name: string } | null>(null);
  const [acceptAllOpen, setAcceptAllOpen] = useState(false);
  const [acceptingAll, setAcceptingAll] = useState(false);

  const afterChange = () => {
    void loadStaff(true);
    void members.reload(true);
  };

  const guarded = async (memberId: string, work: () => Promise<unknown>, success: string): Promise<boolean> => {
    setBusyId(memberId);
    try {
      await work();
      toast.showSuccess(success);
      return true;
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Thao tác không thành công, vui lòng thử lại.'));
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const review = async (member: CommunityGroupMember, approved: boolean) => {
    const ok = await guarded(
      member.id,
      () => groupService.reviewMember(group.id, member.id, approved),
      approved ? `Đã chấp nhận ${member.name} vào nhóm.` : `Đã từ chối yêu cầu của ${member.name}.`,
    );
    if (ok) {
      pending.removeLocal(member.id);
      if (approved) afterChange();
    }
  };

  const acceptAll = async () => {
    setAcceptingAll(true);
    let done = 0;
    for (const member of [...pending.items]) {
      try {
        await groupService.reviewMember(group.id, member.id, true);
        pending.removeLocal(member.id);
        done += 1;
      } catch {
        break;
      }
    }
    setAcceptingAll(false);
    setAcceptAllOpen(false);
    if (done > 0) toast.showSuccess(`Đã chấp nhận ${done} yêu cầu tham gia.`);
    else toast.showError('Không thể chấp nhận yêu cầu, vui lòng thử lại.');
    afterChange();
    void pending.reload(true);
  };

  const changeRole = async (member: { id: string; name: string }, role: GroupRole, success: string) => {
    const ok = await guarded(member.id, () => groupService.changeMemberRole(group.id, member.id, role), success);
    if (ok) afterChange();
  };

  const confirmAction = async (deleteContent: boolean) => {
    if (!action) return;
    const { type, id, name } = action;
    const work = {
      remove: () => groupService.removeMember(group.id, id, false, deleteContent),
      ban: () => groupService.removeMember(group.id, id, true, deleteContent),
      unban: () => groupService.unbanMember(group.id, id),
      transfer: () => groupService.transferOwnership(group.id, id),
    }[type];
    const success = {
      remove: `Đã xóa ${name} khỏi nhóm.`,
      ban: `Đã cấm ${name} khỏi nhóm.`,
      unban: `Đã gỡ cấm ${name}.`,
      transfer: `${name} là chủ nhóm mới.`,
    }[type];
    const ok = await guarded(id, work, success);
    if (ok) {
      members.removeLocal(id);
      if (type === 'unban') banned.removeLocal(id);
      if (type === 'ban') void banned.reload(true);
      setAction(null);
      afterChange();
    }
  };

  /** Quyền thao tác với một người: không ai tác động được lên chủ nhóm hoặc chính mình; kiểm duyệt viên không đụng được quản trị viên. */
  const menuFor = (member: { id: string; name: string; role: GroupRole }): MemberMenuItem[] => {
    if (member.id === myId || member.id === group.ownerId) return [];
    const items: MemberMenuItem[] = [];
    const target = { id: member.id, name: member.name };
    if (group.isAdmin) {
      if (member.role !== 'ADMIN') {
        items.push({ key: 'admin', label: 'Đặt làm quản trị viên', icon: <ShieldCheck className="h-4 w-4" />, onClick: () => void changeRole(target, 'ADMIN', `${member.name} giờ là quản trị viên.`) });
      }
      if (member.role !== 'MODERATOR') {
        items.push({ key: 'moderator', label: 'Đặt làm người kiểm duyệt', icon: <ShieldCheck className="h-4 w-4" />, onClick: () => void changeRole(target, 'MODERATOR', `${member.name} giờ là người kiểm duyệt.`) });
      }
      if (member.role !== 'MEMBER') {
        items.push({ key: 'demote', label: `Gỡ quyền ${member.role === 'ADMIN' ? 'quản trị viên' : 'kiểm duyệt'}`, icon: <ShieldOff className="h-4 w-4" />, onClick: () => void changeRole(target, 'MEMBER', `Đã gỡ quyền điều hành của ${member.name}.`) });
      }
    }
    if (group.isOwner) {
      items.push({ key: 'transfer', label: 'Chuyển quyền chủ nhóm', icon: <Crown className="h-4 w-4" />, onClick: () => setAction({ type: 'transfer', id: member.id, name: member.name }) });
    }
    if (canModerate && (member.role !== 'ADMIN' || group.isAdmin)) {
      items.push({ key: 'remove', label: 'Xóa khỏi nhóm', icon: <UserMinus className="h-4 w-4" />, danger: true, onClick: () => setAction({ type: 'remove', id: member.id, name: member.name }) });
      items.push({ key: 'ban', label: 'Cấm khỏi nhóm', icon: <UserX className="h-4 w-4" />, danger: true, onClick: () => setAction({ type: 'ban', id: member.id, name: member.name }) });
    }
    return items;
  };

  const visibleStaff = useMemo(() => {
    if (!searching) return staff;
    const q = normalizeText(keyword);
    return staff.filter((s) => normalizeText(s.name).includes(q));
  }, [staff, searching, keyword]);

  const memberCountLabel = group.memberCount;

  return (
    <div className="mx-auto w-full max-w-[760px] space-y-4">
      <TabCard className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
              Thành viên <span className="text-gray-500 dark:text-[#b0b3b8]">· {memberCountLabel}</span>
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">
              {group.privacy === 'PRIVATE'
                ? 'Chỉ thành viên mới nhìn thấy những người trong nhóm và những gì họ đăng.'
                : 'Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng.'}
            </p>
          </div>
          {group.isMember && onInviteClick && (
            <button
              type="button"
              onClick={onInviteClick}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1877f2] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#166fe5] cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Mời
            </button>
          )}
        </div>
        {!isPrivateLocked && <div className="mt-4"><SearchBox value={searchInput} onChange={setSearchInput} /></div>}
      </TabCard>

      {isPrivateLocked ? (
        <TabCard>
          <EmptyState
            icon={<Lock className="h-7 w-7" />}
            title="Danh sách thành viên ở chế độ riêng tư"
            hint="Chỉ thành viên của nhóm mới xem được những người trong nhóm này."
          />
        </TabCard>
      ) : (
        <>
          {/* Yêu cầu tham gia (chỉ quản trị/kiểm duyệt viên) */}
          {canModerate && !searching && pending.total > 0 && (
            <TabCard className="border-blue-200 p-3 sm:p-4 dark:border-blue-900/50">
              <SectionTitle
                icon={<UserPlus className="h-5 w-5 text-[#1877f2]" />}
                aside={pending.total > 1 ? (
                  <button
                    type="button"
                    onClick={() => setAcceptAllOpen(true)}
                    className="rounded-lg px-3 py-1.5 text-sm font-bold text-[#1877f2] hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                  >
                    Chấp nhận tất cả
                  </button>
                ) : undefined}
              >
                Yêu cầu tham gia ({pending.total})
              </SectionTitle>
              <ul className="divide-y divide-gray-100 dark:divide-[#393a3b]">
                {pending.items.map((member) => {
                  const busy = busyId === member.id;
                  return (
                    <li key={member.id} className="px-2 py-3">
                      <div className="flex items-start gap-3">
                        <button type="button" onClick={() => onNavigateProfile?.(member.id)} className="shrink-0 rounded-full cursor-pointer" aria-label={`Xem trang cá nhân của ${member.name}`}>
                          <UserAvatar src={member.avatar} alt={member.name} size="md" className="h-12 w-12 rounded-full" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <button type="button" onClick={() => onNavigateProfile?.(member.id)} className="block max-w-full truncate text-left text-[15px] font-bold text-gray-900 hover:underline dark:text-[#e4e6eb] cursor-pointer">
                            {member.name}
                          </button>
                          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">{requestedLabel(member.joinedAt)}</p>
                          {member.answers && member.answers.length > 0 && (
                            <dl className="mt-2 space-y-2 rounded-xl bg-gray-100 p-3 text-sm dark:bg-[#3a3b3c]">
                              {member.answers.map((answer, i) => (
                                <div key={i}>
                                  <dt className="text-xs font-bold text-gray-500 dark:text-[#b0b3b8]">{group.membershipQuestions[i] ?? `Câu hỏi ${i + 1}`}</dt>
                                  <dd className="mt-0.5 whitespace-pre-wrap break-words text-gray-900 dark:text-[#e4e6eb]">{answer}</dd>
                                </div>
                              ))}
                            </dl>
                          )}
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void review(member, true)}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1877f2] px-3 py-2 text-sm font-bold text-white hover:bg-[#166fe5] disabled:opacity-60 sm:flex-none sm:px-6 cursor-pointer"
                            >
                              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                              Chấp nhận
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void review(member, false)}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-200 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-300 disabled:opacity-60 dark:bg-[#4e4f50] dark:text-[#e4e6eb] dark:hover:bg-[#5a5b5c] sm:flex-none sm:px-6 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                              Từ chối
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {!pending.last && <LoadMoreButton loading={pending.loadingMore} onClick={() => void pending.loadMore()} label="Xem thêm yêu cầu" />}
            </TabCard>
          )}

          {/* Lời mời đang chờ (quản trị/kiểm duyệt viên) */}
          {canModerate && !searching && invited.total > 0 && (
            <TabCard className="p-3 sm:p-4">
              <button
                type="button"
                onClick={() => setShowInvited((v) => !v)}
                aria-expanded={showInvited}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[17px] font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                  <Users className="h-5 w-5 text-gray-500" />
                  Lời mời đang chờ ({invited.total})
                </span>
                {showInvited ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
              </button>
              {showInvited && (
                <div className="mt-2">
                  {invited.items.map((member) => (
                    <MemberRow
                      key={member.id}
                      id={member.id}
                      name={member.name}
                      avatar={member.avatar}
                      subtitle={member.invitedByName ? `Được ${member.invitedByName} mời` : 'Đang chờ trả lời lời mời'}
                      onOpenProfile={onNavigateProfile}
                    />
                  ))}
                  {!invited.last && <LoadMoreButton loading={invited.loadingMore} onClick={() => void invited.loadMore()} />}
                </div>
              )}
            </TabCard>
          )}

          {/* Quản trị viên và người kiểm duyệt */}
          {(staffLoading || staffError || visibleStaff.length > 0) && (
            <TabCard className="p-3 sm:p-4">
              <SectionTitle>Quản trị viên và người kiểm duyệt{!staffLoading && !staffError ? ` · ${visibleStaff.length}` : ''}</SectionTitle>
              {staffLoading ? (
                <RowsSkeleton count={2} />
              ) : staffError ? (
                <ErrorState message={staffError} onRetry={() => void loadStaff()} />
              ) : (
                visibleStaff.map((s) => (
                  <MemberRow
                    key={s.id}
                    id={s.id}
                    name={s.name}
                    avatar={s.avatar}
                    isOwner={s.isOwner}
                    role={s.role}
                    busy={busyId === s.id}
                    menuItems={menuFor({ id: s.id, name: s.name, role: s.role })}
                    onOpenProfile={onNavigateProfile}
                  />
                ))
              )}
            </TabCard>
          )}

          {/* Thành viên */}
          <TabCard className="p-3 sm:p-4">
            <SectionTitle>
              {searching ? `Kết quả cho "${keyword}"` : 'Thành viên'}
              {!members.loading && !members.error ? ` · ${members.total}` : ''}
            </SectionTitle>
            {members.loading ? (
              <RowsSkeleton />
            ) : members.error && members.items.length === 0 ? (
              <ErrorState message={members.error} onRetry={() => void members.reload(false)} />
            ) : members.items.length === 0 ? (
              <EmptyState
                icon={<Users className="h-7 w-7" />}
                title={searching ? 'Không tìm thấy thành viên nào' : 'Chưa có thành viên nào khác'}
                hint={searching ? 'Thử gõ tên khác hoặc bỏ bớt từ khóa.' : 'Hãy mời bạn bè cùng tham gia nhóm.'}
              />
            ) : (
              <>
                {members.items.map((member) => (
                  <MemberRow
                    key={member.id}
                    id={member.id}
                    name={member.name}
                    avatar={member.avatar}
                    subtitle={joinedLabel(member.joinedAt)}
                    busy={busyId === member.id}
                    menuItems={menuFor({ id: member.id, name: member.name, role: member.role })}
                    onOpenProfile={onNavigateProfile}
                  />
                ))}
                <div ref={sentinel} className="h-1" aria-hidden="true" />
                {members.loadingMore && <RowsSkeleton count={2} />}
                {members.error && <p className="px-2 py-2 text-center text-xs text-red-500">{members.error}</p>}
                {!members.last && !members.loadingMore && <LoadMoreButton loading={false} onClick={() => void members.loadMore()} />}
              </>
            )}
          </TabCard>

          {/* Thành viên bị cấm (quản trị/kiểm duyệt viên) */}
          {canModerate && !searching && banned.total > 0 && (
            <TabCard className="border-red-200 p-3 sm:p-4 dark:border-red-900/40">
              <button
                type="button"
                onClick={() => setShowBanned((v) => !v)}
                aria-expanded={showBanned}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 text-[17px] font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                  <UserX className="h-5 w-5 text-red-500" />
                  Thành viên bị cấm ({banned.total})
                </span>
                {showBanned ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
              </button>
              {showBanned && (
                <div className="mt-2">
                  {banned.items.map((member) => (
                    <MemberRow
                      key={member.id}
                      id={member.id}
                      name={member.name}
                      avatar={member.avatar}
                      subtitle="Đã bị cấm khỏi nhóm"
                      onOpenProfile={onNavigateProfile}
                      trailing={(
                        <button
                          type="button"
                          disabled={busyId === member.id}
                          onClick={() => setAction({ type: 'unban', id: member.id, name: member.name })}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-200 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer"
                        >
                          <Undo2 className="h-4 w-4" />
                          Gỡ cấm
                        </button>
                      )}
                    />
                  ))}
                  {!banned.last && <LoadMoreButton loading={banned.loadingMore} onClick={() => void banned.loadMore()} />}
                </div>
              )}
            </TabCard>
          )}
        </>
      )}

      <MemberActionModal
        action={action?.type ?? null}
        memberName={action?.name ?? ''}
        loading={Boolean(action && busyId === action.id)}
        onClose={() => { if (!busyId) setAction(null); }}
        onConfirm={(deleteContent) => void confirmAction(deleteContent)}
      />

      <ConfirmModal
        isOpen={acceptAllOpen}
        title="Chấp nhận tất cả yêu cầu?"
        message={`${pending.total} người đang chờ sẽ trở thành thành viên của nhóm.`}
        confirmText="Chấp nhận tất cả"
        type="info"
        loading={acceptingAll}
        onConfirm={() => void acceptAll()}
        onClose={() => { if (!acceptingAll) setAcceptAllOpen(false); }}
      />
    </div>
  );
};
