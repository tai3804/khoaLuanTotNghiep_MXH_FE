import React from 'react';
import { Check, Clock, Globe, Loader2, Lock } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { GroupCover } from './GroupCover';

interface GroupCardProps {
  group: GroupResponse;
  /** Đang gửi yêu cầu tham gia/hủy yêu cầu cho nhóm này */
  busy?: boolean;
  onOpen: (groupId: string) => void;
  onToggleJoin: (group: GroupResponse) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, busy = false, onOpen, onToggleJoin }) => {
  const isPending = group.joinStatus === 'PENDING' && !group.isMember;
  const isBanned = group.joinStatus === 'BANNED';
  const isPublic = group.privacy === 'PUBLIC';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(group.id);
    }
  };

  let action: React.ReactNode;
  if (group.isMember) {
    action = (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onOpen(group.id); }}
        className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#4e4f50] transition cursor-pointer"
      >
        <Check className="w-3.5 h-3.5 text-green-500" />
        Vào nhóm
      </button>
    );
  } else if (isBanned) {
    action = (
      <button
        type="button"
        disabled
        className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-gray-100 dark:bg-[#3a3b3c] text-gray-400 cursor-not-allowed"
      >
        Bạn đã bị cấm khỏi nhóm
      </button>
    );
  } else if (isPending) {
    action = (
      <button
        type="button"
        disabled={busy}
        onClick={(e) => { e.stopPropagation(); onToggleJoin(group); }}
        className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
        Hủy yêu cầu
      </button>
    );
  } else {
    action = (
      <button
        type="button"
        disabled={busy}
        onClick={(e) => { e.stopPropagation(); onToggleJoin(group); }}
        className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-sm transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {busy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
      className="group bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877f2]"
    >
      <div className="h-32 w-full relative overflow-hidden">
        <GroupCover
          name={group.name}
          seed={group.id}
          coverUrl={group.coverUrl}
          className="w-full h-full group-hover:scale-105 transition duration-300"
          initialClassName="text-5xl"
        />
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1">
          {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {isPublic ? 'Công khai' : 'Riêng tư'}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="space-y-1 flex-1">
          <h4 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb] line-clamp-1 group-hover:text-[#1877f2] transition">
            {group.name}
          </h4>
          <span className="text-xs text-gray-500 dark:text-[#b0b3b8] font-medium block">
            {group.memberCount} thành viên
          </span>
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
