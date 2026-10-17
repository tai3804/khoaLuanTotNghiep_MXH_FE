import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Clock, Globe, Image as ImageIcon, Loader2, Lock, LogOut, UserPlus } from 'lucide-react';
import { CommunityGroupMember, GroupResponse } from '../../services/groupService';
import { UserAvatar } from '../common/UserAvatar';
import { GroupCover } from './GroupCover';

export type GroupTab = 'discussion' | 'members' | 'media' | 'appeals' | 'management' | 'pending-posts' | 'settings';

export interface GroupTabItem {
  key: GroupTab;
  label: string;
}

interface GroupBannerProps {
  group: GroupResponse;
  tabs: GroupTabItem[];
  activeTab: GroupTab;
  setActiveTab: (tab: GroupTab) => void;
  members?: CommunityGroupMember[];
  canInvite?: boolean;
  joining?: boolean;
  uploadingCover?: boolean;
  onNavigateProfile?: (userId: string) => void;
  onInviteClick?: () => void;
  onToggleJoin?: () => void;
  onLeaveGroup?: () => void;
  onChangeCover?: (file: File) => void;
}

const MAX_AVATARS = 5;

export const GroupBanner: React.FC<GroupBannerProps> = ({
  group,
  tabs,
  activeTab,
  setActiveTab,
  members = [],
  canInvite = false,
  joining = false,
  uploadingCover = false,
  onNavigateProfile,
  onInviteClick,
  onToggleJoin,
  onLeaveGroup,
  onChangeCover,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const approvedMembers = members.filter((m) => m.status !== 'PENDING' && m.status !== 'BANNED' && m.status !== 'REJECTED');
  const extraMembers = Math.max(0, group.memberCount - MAX_AVATARS);
  const isPublic = group.privacy === 'PUBLIC';

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onChangeCover?.(file);
  };

  return (
    <div className="w-full max-w-[1000px] bg-white dark:bg-[#242526] shadow-sm sm:rounded-b-lg overflow-hidden">
      {/* Ảnh bìa */}
      <div className="relative h-44 sm:h-72 w-full overflow-hidden">
        <GroupCover
          name={group.name}
          seed={group.id}
          coverUrl={group.coverUrl}
          className="w-full h-full"
          initialClassName="text-8xl"
        />
        {group.isAdmin && onChangeCover && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button
              type="button"
              disabled={uploadingCover}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 bg-white/90 dark:bg-[#3a3b3c]/90 hover:bg-white dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer backdrop-blur-sm disabled:opacity-70 disabled:cursor-wait"
            >
              {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              <span>{uploadingCover ? 'Đang tải ảnh...' : group.coverUrl ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}</span>
            </button>
          </>
        )}
      </div>

      {/* Thông tin nhóm */}
      <div className="px-4 sm:px-8 pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-[#e4e6eb] break-words">{group.name}</h1>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-[#b0b3b8] mt-1 font-medium">
          {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
          <span>{isPublic ? 'Nhóm công khai' : 'Nhóm riêng tư'}</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-gray-900 dark:text-[#e4e6eb]">{group.memberCount} thành viên</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pb-4 border-b border-gray-200 dark:border-[#393a3b]">
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {approvedMembers.slice(0, MAX_AVATARS).map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => onNavigateProfile?.(member.id)}
                  title={`Xem trang cá nhân của ${member.name}`}
                  aria-label={`Xem trang cá nhân của ${member.name}`}
                  className="rounded-full transition-transform hover:z-10 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                >
                  <UserAvatar src={member.avatar} alt={member.name} size="sm" className="border-2 border-white dark:border-[#242526]" />
                </button>
              ))}
            </div>
            {extraMembers > 0 && approvedMembers.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab('members')}
                className="ml-2 text-xs font-bold text-gray-600 dark:text-[#b0b3b8] hover:underline cursor-pointer"
              >
                +{extraMembers}
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {canInvite && onInviteClick && (
              <button
                type="button"
                onClick={onInviteClick}
                className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-[#1877f2] px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Mời bạn bè
              </button>
            )}

            {group.isMember ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  className="bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
                >
                  <Check className="w-4 h-4 text-green-600" />
                  Đã tham gia
                  <ChevronDown className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div role="menu" className="absolute right-0 mt-1 w-52 z-20 rounded-xl border border-gray-200 dark:border-[#4e4f50] bg-white dark:bg-[#3a3b3c] shadow-lg py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); onLeaveGroup?.(); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-gray-100 dark:hover:bg-[#4e4f50] flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Rời nhóm
                    </button>
                  </div>
                )}
              </div>
            ) : group.joinStatus === 'BANNED' ? (
              <span className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-sm font-semibold text-gray-500">
                Bạn đã bị cấm khỏi nhóm
              </span>
            ) : group.joinStatus === 'PENDING' ? (
              <button
                type="button"
                disabled={joining}
                onClick={onToggleJoin}
                className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
                title="Bấm để hủy yêu cầu tham gia nhóm"
              >
                {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                Hủy yêu cầu tham gia
              </button>
            ) : (
              <button
                type="button"
                disabled={joining}
                onClick={onToggleJoin}
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-60"
              >
                {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPublic ? 'Tham gia nhóm' : 'Gửi yêu cầu tham gia'}
              </button>
            )}
          </div>
        </div>

        {/* Thanh tab: cuộn ngang được trên màn hình nhỏ */}
        <div role="tablist" aria-label="Nội dung nhóm" className="flex overflow-x-auto no-scrollbar -mx-4 sm:-mx-8 px-2 sm:px-6">
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 whitespace-nowrap px-4 py-4 font-bold text-sm border-b-[3px] transition cursor-pointer ${
                  active
                    ? 'text-[#1877f2] border-[#1877f2]'
                    : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
