import React from 'react';
import { Check, Clock, Crown, Globe, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { GroupCover } from './GroupCover';

interface GroupCardProps {
  group: GroupResponse;
  /** Đang gửi yêu cầu/hủy yêu cầu/trả lời lời mời cho nhóm này */
  busy?: boolean;
  onOpen: (groupId: string) => void;
  /** Tham gia nhóm (nhóm có câu hỏi sẽ mở hộp thoại trả lời ở nơi xử lý) */
  onJoin: (group: GroupResponse) => void;
  onCancelRequest: (group: GroupResponse) => void;
  onRespondInvitation: (group: GroupResponse, accept: boolean) => void;
}

/** Nhãn vai trò của mình trong nhóm (chủ nhóm > quản trị viên > người kiểm duyệt). */
export const roleLabelOf = (group: GroupResponse): string | null => {
  if (group.isOwner) return 'Chủ nhóm';
  if (group.isAdmin) return 'Quản trị viên';
  if (group.isModerator) return 'Người kiểm duyệt';
  return null;
};

export const GroupCard: React.FC<GroupCardProps> = ({ group, busy = false, onOpen, onJoin, onCancelRequest, onRespondInvitation }) => {
  const isInvited = group.joinStatus === 'INVITED' && !group.isMember;
  const isPending = group.joinStatus === 'PENDING' && !group.isMember;
  const isBanned = group.joinStatus === 'BANNED';
  const isPublic = group.privacy === 'PUBLIC';
  const role = group.isMember ? roleLabelOf(group) : null;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(group.id);
    }
  };

  const stop = (handler: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    handler();
  };

  let action: React.ReactNode;
  if (group.isMember) {
    action = (
      <button
        type="button"
        onClick={stop(() => onOpen(group.id))}
        className="w-full py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#4e4f50] transition cursor-pointer"
      >
        <Check className="w-4 h-4 text-green-500" />
        Vào nhóm
      </button>
    );
  } else if (isBanned) {
    action = (
      <button
        type="button"
        disabled
        className="w-full py-2 px-3 rounded-lg text-sm font-bold bg-gray-100 dark:bg-[#3a3b3c] text-gray-400 cursor-not-allowed"
      >
        Bạn đã bị cấm khỏi nhóm
      </button>
    );
  } else if (isInvited) {
    action = (
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={stop(() => onRespondInvitation(group, true))}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          Chấp nhận
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={stop(() => onRespondInvitation(group, false))}
          className="flex-1 py-2 px-3 rounded-lg text-sm font-bold bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#4e4f50] transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          Từ chối
        </button>
      </div>
    );
  } else if (isPending) {
    action = (
      <button
        type="button"
        disabled={busy}
        onClick={stop(() => onCancelRequest(group))}
        title="Bấm để hủy yêu cầu tham gia nhóm"
        className="w-full py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
        Hủy yêu cầu
      </button>
    );
  } else {
    action = (
      <button
        type="button"
        disabled={busy}
        onClick={stop(() => onJoin(group))}
        className="w-full py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-[#1877f2] dark:text-[#4599ff] transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {busy && <Loader2 className="w-4 h-4 animate-spin" />}
        {isPublic ? 'Tham gia nhóm' : 'Gửi yêu cầu tham gia'}
      </button>
    );
  }

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`Mở nhóm ${group.name}`}
      onClick={() => onOpen(group.id)}
      onKeyDown={handleKeyDown}
      className="group bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200 overflow-hidden cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877f2]"
    >
      <div className="h-28 sm:h-32 w-full relative overflow-hidden">
        <GroupCover
          name={group.name}
          seed={group.id}
          coverUrl={group.coverUrl}
          className="w-full h-full group-hover:scale-105 transition duration-300"
          initialClassName="text-5xl"
        />
        <div className="absolute top-2.5 right-2.5 bg-black/55 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1">
          {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {isPublic ? 'Công khai' : 'Riêng tư'}
        </div>
        {role && (
          <div className="absolute bottom-2.5 left-2.5 bg-white/95 dark:bg-[#242526]/95 text-[#1877f2] px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
            {group.isOwner ? <Crown className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
            {role}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <h4 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb] line-clamp-1 group-hover:text-[#1877f2] transition" title={group.name}>
            {group.name}
          </h4>
          <span className="text-xs text-gray-500 dark:text-[#b0b3b8] font-medium block">
            {group.memberCount.toLocaleString('vi-VN')} thành viên
          </span>
          {isInvited && (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1877f2] dark:text-[#4599ff] pt-0.5">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              {group.invitedByName ? `${group.invitedByName} đã mời bạn` : 'Bạn được mời tham gia nhóm này'}
            </p>
          )}
          {group.description ? (
            <p className="text-xs text-gray-600 dark:text-[#b0b3b8] line-clamp-2 leading-relaxed pt-1">
              {group.description}
            </p>
          ) : (
            <p className="text-xs italic text-gray-400 dark:text-gray-500 pt-1">Chưa có mô tả</p>
          )}
        </div>
        {action}
      </div>
    </div>
  );
};
