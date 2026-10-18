import React, { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, Check, ChevronDown, Clock, Globe, Image as ImageIcon, Link2, Loader2, Lock, LogOut, UserPlus } from 'lucide-react';
import { GroupNotificationLevel, GroupResponse } from '../../services/groupService';
import { UserAvatar } from '../common/UserAvatar';
import { GroupCover } from './GroupCover';

export type GroupTab = 'discussion' | 'about' | 'members' | 'media' | 'appeals' | 'management' | 'pending-posts' | 'reports' | 'settings';

export interface GroupTabItem {
  key: GroupTab;
  label: string;
  /** Số đỏ hiển thị cạnh tên tab (vd. số yêu cầu đang chờ xử lý). */
  badge?: number;
}

interface GroupBannerProps {
  group: GroupResponse;
  /** Chuyển tab (vd. bấm số thành viên để mở tab Thành viên). */
  setActiveTab: (tab: GroupTab) => void;
  joining?: boolean;
  uploadingCover?: boolean;
  onNavigateProfile?: (userId: string) => void;
  onInviteClick?: () => void;
  onJoin?: () => void;
  onCancelRequest?: () => void;
  onLeaveGroup?: () => void;
  onChangeCover?: (file: File) => void;
  onShare?: () => void;
  onNotificationLevelChange?: (level: GroupNotificationLevel) => void;
}

const MAX_AVATARS = 6;

const NOTIFICATION_OPTIONS: { level: GroupNotificationLevel; title: string; hint: string }[] = [
  { level: 'ALL', title: 'Tất cả bài viết', hint: 'Báo cho bạn mỗi khi có bài viết mới trong nhóm.' },
  { level: 'HIGHLIGHTS', title: 'Nổi bật', hint: 'Chỉ báo những việc liên quan trực tiếp tới bạn.' },
  { level: 'OFF', title: 'Tắt thông báo', hint: 'Không nhận thông báo hoạt động của nhóm.' },
];

/** Menu thả xuống: đóng khi bấm ra ngoài hoặc nhấn Esc. */
const useDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
};

const grayButton =
  'bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer';

export const GroupBanner: React.FC<GroupBannerProps> = ({
  group,
  setActiveTab,
  joining = false,
  uploadingCover = false,
  onNavigateProfile,
  onInviteClick,
  onJoin,
  onCancelRequest,
  onLeaveGroup,
  onChangeCover,
  onShare,
  onNotificationLevelChange,
}) => {
  const joinedMenu = useDropdown();
  const pendingMenu = useDropdown();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const preview = group.memberPreview ?? [];
  const extraMembers = Math.max(0, group.memberCount - Math.min(preview.length, MAX_AVATARS));
  const isPublic = group.privacy === 'PUBLIC';
  const level = group.notificationLevel ?? 'HIGHLIGHTS';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) onChangeCover?.(file);
  };

  const joinedRoleLabel = group.isOwner ? 'Chủ nhóm' : group.isAdmin ? 'Quản trị viên' : group.isModerator ? 'Người kiểm duyệt' : null;

  return (
    <div className="w-full max-w-[1000px] bg-white dark:bg-[#242526] shadow-sm">
      {/* Ảnh bìa */}
      <div className="relative h-48 sm:h-auto sm:aspect-[2.7/1] w-full overflow-hidden">
        <GroupCover
          name={group.name}
          seed={group.id}
          coverUrl={group.coverUrl}
          className="w-full h-full"
          initialClassName="text-8xl"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent" aria-hidden="true" />
        {group.isAdmin && onChangeCover && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button
              type="button"
              disabled={uploadingCover}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-4 right-4 bg-white/95 dark:bg-[#3a3b3c]/95 hover:bg-white dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-70 disabled:cursor-wait"
            >
              {uploadingCover ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              <span>{uploadingCover ? 'Đang tải ảnh...' : group.coverUrl ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}</span>
            </button>
          </>
        )}
      </div>

      {/* Thông tin nhóm */}
      <div className="px-4 sm:px-6 pt-4">
        <h1 className="text-2xl sm:text-[32px] sm:leading-tight font-extrabold text-gray-900 dark:text-[#e4e6eb] break-words">{group.name}</h1>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-gray-500 dark:text-[#b0b3b8] font-medium">
          {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          <span>{isPublic ? 'Nhóm công khai' : 'Nhóm riêng tư'}</span>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className="font-semibold hover:underline cursor-pointer"
          >
            {group.memberCount.toLocaleString('vi-VN')} thành viên
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 pb-4">
          {/* Dải ảnh đại diện thành viên */}
          {preview.length > 0 && (
            <div className="flex items-center min-w-0">
              <div className="flex -space-x-2">
                {preview.slice(0, MAX_AVATARS).map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => onNavigateProfile?.(member.id)}
                    title={member.name}
                    aria-label={`Xem trang cá nhân của ${member.name}`}
                    className="rounded-full transition-transform hover:z-10 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                  >
                    <UserAvatar src={member.avatar} alt={member.name} size="sm" className="border-2 border-white dark:border-[#242526]" />
                  </button>
                ))}
              </div>
              {extraMembers > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('members')}
                  className="ml-2 text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:underline cursor-pointer"
                >
                  +{extraMembers.toLocaleString('vi-VN')}
                </button>
              )}
            </div>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {group.isMember && onInviteClick && (
              <button
                type="button"
                onClick={onInviteClick}
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Mời
              </button>
            )}

            {group.isMember ? (
              <div className="relative" ref={joinedMenu.ref}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={joinedMenu.open}
                  onClick={() => joinedMenu.setOpen((o) => !o)}
                  className={grayButton}
                >
                  <Check className="w-4 h-4" />
                  Đã tham gia
                  <ChevronDown className="w-4 h-4" />
                </button>
                {joinedMenu.open && (
                  <div role="menu" className="absolute right-0 mt-1 w-[300px] max-w-[calc(100vw-2rem)] z-30 rounded-xl border border-gray-200 dark:border-[#4e4f50] bg-white dark:bg-[#3a3b3c] shadow-xl py-1.5">
                    {joinedRoleLabel && (
                      <div className="px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-[#b0b3b8]">{joinedRoleLabel}</div>
                    )}
                    <div className="px-4 pt-1.5 pb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-[#b0b3b8]">
                      {level === 'OFF' ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                      Cài đặt thông báo
                    </div>
                    {NOTIFICATION_OPTIONS.map((option) => (
                      <button
                        key={option.level}
                        type="button"
                        role="menuitemradio"
                        aria-checked={level === option.level}
                        onClick={() => {
                          if (option.level !== level) onNotificationLevelChange?.(option.level);
                          joinedMenu.setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#4e4f50] flex items-start gap-3 cursor-pointer"
                      >
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${level === option.level ? 'border-[#1877f2]' : 'border-gray-400 dark:border-[#8a8d91]'}`}>
                          {level === option.level && <span className="h-2 w-2 rounded-full bg-[#1877f2]" />}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">{option.title}</span>
                          <span className="block text-xs text-gray-500 dark:text-[#b0b3b8]">{option.hint}</span>
                        </span>
                      </button>
                    ))}
                    <div className="my-1.5 border-t border-gray-200 dark:border-[#4e4f50]" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { joinedMenu.setOpen(false); onLeaveGroup?.(); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#4e4f50] flex items-center gap-3 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Rời nhóm
                    </button>
                  </div>
                )}
              </div>
            ) : group.joinStatus === 'BANNED' ? (
              <span className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] text-sm font-semibold text-gray-500">
                Bạn đã bị cấm khỏi nhóm
              </span>
            ) : group.joinStatus === 'PENDING' ? (
              <div className="relative" ref={pendingMenu.ref}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={pendingMenu.open}
                  disabled={joining}
                  onClick={() => pendingMenu.setOpen((o) => !o)}
                  className={`${grayButton} disabled:opacity-60`}
                >
                  {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                  Đã gửi yêu cầu
                  <ChevronDown className="w-4 h-4" />
                </button>
                {pendingMenu.open && (
                  <div role="menu" className="absolute right-0 mt-1 w-56 z-30 rounded-xl border border-gray-200 dark:border-[#4e4f50] bg-white dark:bg-[#3a3b3c] shadow-xl py-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => { pendingMenu.setOpen(false); onCancelRequest?.(); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#4e4f50] cursor-pointer"
                    >
                      Hủy yêu cầu tham gia
                    </button>
                  </div>
                )}
              </div>
            ) : group.joinStatus === 'INVITED' ? null : (
              <button
                type="button"
                disabled={joining}
                onClick={onJoin}
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer shadow-sm disabled:opacity-60"
              >
                {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                {isPublic ? 'Tham gia nhóm' : 'Gửi yêu cầu tham gia'}
              </button>
            )}

            <button
              type="button"
              onClick={onShare}
              title="Sao chép liên kết nhóm"
              className={grayButton}
            >
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

interface GroupTabsBarProps {
  tabs: GroupTabItem[];
  activeTab: GroupTab;
  setActiveTab: (tab: GroupTab) => void;
}

/** Các tab dành cho việc điều hành: khi có từ 3 tab trở lên thì gom vào menu "Quản lý nhóm" để thanh tab không quá dài. */
const MANAGE_TAB_KEYS: GroupTab[] = ['appeals', 'pending-posts', 'reports', 'management'];

const tabClass = (active: boolean) =>
  `relative shrink-0 whitespace-nowrap px-4 py-3.5 font-semibold text-[15px] border-b-[3px] transition cursor-pointer flex items-center gap-1.5 ${
    active
      ? 'text-[#1877f2] border-[#1877f2]'
      : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'
  }`;

const Badge: React.FC<{ value?: number }> = ({ value }) =>
  value ? (
    <span className="min-w-[18px] rounded-full bg-red-500 px-1.5 text-center text-[11px] font-bold leading-[18px] text-white">
      {value > 99 ? '99+' : value}
    </span>
  ) : null;

/** Thanh tab của nhóm: dính ngay dưới thanh header khi cuộn trang, cuộn ngang được trên màn hình nhỏ. */
export const GroupTabsBar: React.FC<GroupTabsBarProps> = ({ tabs, activeTab, setActiveTab }) => {
  const manageMenu = useDropdown();
  const manageTabs = tabs.filter((t) => MANAGE_TAB_KEYS.includes(t.key));
  const collapseManage = manageTabs.length >= 3;
  const inlineTabs = collapseManage ? tabs.filter((t) => !MANAGE_TAB_KEYS.includes(t.key)) : tabs;
  const manageActive = manageTabs.some((t) => t.key === activeTab);
  const manageBadge = manageTabs.reduce((sum, t) => sum + (t.key === 'management' ? 0 : t.badge ?? 0), 0)
    + (manageTabs.find((t) => t.key === 'management')?.badge ?? 0);

  const renderTab = (tab: GroupTabItem) => (
    <button
      key={tab.key}
      type="button"
      role="tab"
      aria-selected={activeTab === tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={tabClass(activeTab === tab.key)}
    >
      {tab.label}
      <Badge value={tab.badge} />
    </button>
  );

  return (
    <div className="sticky top-14 z-20 flex w-full justify-center">
      <div
        role="tablist"
        aria-label="Nội dung nhóm"
        className="no-scrollbar flex w-full max-w-[1000px] overflow-x-auto border-t border-gray-200 bg-white px-2 shadow-sm sm:overflow-visible sm:rounded-b-xl sm:px-4 dark:border-[#393a3b] dark:bg-[#242526]"
      >
        {inlineTabs.map(renderTab)}

        {collapseManage && (
          <>
            {/* Trên điện thoại: hiện đủ các tab quản lý và cuộn ngang */}
            <div className="flex sm:hidden">{manageTabs.map(renderTab)}</div>
            {/* Từ màn hình sm trở lên: gom vào một menu */}
            <div className="relative hidden sm:block" ref={manageMenu.ref}>
              <button
                type="button"
                role="tab"
                aria-selected={manageActive}
                aria-haspopup="menu"
                aria-expanded={manageMenu.open}
                onClick={() => manageMenu.setOpen((o) => !o)}
                className={tabClass(manageActive)}
              >
                Quản lý nhóm
                <ChevronDown className="h-4 w-4" />
                <Badge value={manageBadge || undefined} />
              </button>
              {manageMenu.open && (
                <div role="menu" className="absolute right-0 top-full z-30 mt-1 w-64 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl dark:border-[#4e4f50] dark:bg-[#3a3b3c]">
                  {manageTabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      role="menuitem"
                      onClick={() => { manageMenu.setOpen(false); setActiveTab(tab.key); }}
                      className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm font-semibold hover:bg-gray-100 dark:hover:bg-[#4e4f50] ${
                        activeTab === tab.key ? 'text-[#1877f2]' : 'text-gray-900 dark:text-[#e4e6eb]'
                      }`}
                    >
                      {tab.label}
                      <Badge value={tab.badge} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
