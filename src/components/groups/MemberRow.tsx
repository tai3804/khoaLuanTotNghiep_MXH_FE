import React, { useEffect, useRef, useState } from 'react';
import { Crown, Loader2, MoreHorizontal, ShieldCheck } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export interface MemberMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick: () => void;
}

interface MemberRowProps {
  id: string;
  name: string;
  avatar: string;
  /** Dòng phụ dưới tên: "Tham gia 3 ngày trước"... */
  subtitle?: React.ReactNode;
  isOwner?: boolean;
  role?: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  /** Các lệnh trong menu "..." (rỗng/undefined: không hiện nút). */
  menuItems?: MemberMenuItem[];
  busy?: boolean;
  onOpenProfile?: (userId: string) => void;
  /** Nội dung bên phải thay cho menu (vd. nút "Gỡ cấm"). */
  trailing?: React.ReactNode;
}

/** Một dòng thành viên: ảnh, tên (bấm mở trang cá nhân), vai trò, menu "..." lệnh quản trị. */
export const MemberRow: React.FC<MemberRowProps> = ({ id, name, avatar, subtitle, isOwner, role, menuItems, busy, onOpenProfile, trailing }) => {
  const [open, setOpen] = useState(false);
  // Gần đáy màn hình (nhất là có thanh điều hướng dưới trên di động) thì mở menu lên phía trên nút
  const [dropUp, setDropUp] = useState(false);
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

  const hasMenu = Boolean(menuItems && menuItems.length > 0);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/50" data-member-id={id}>
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => onOpenProfile?.(id)}
          aria-label={`Xem trang cá nhân của ${name}`}
          className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877f2] cursor-pointer"
        >
          <UserAvatar src={avatar} alt={name} size="md" className="h-12 w-12 rounded-full" />
        </button>
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpenProfile?.(id)}
            className="block max-w-full truncate text-left text-[15px] font-bold text-gray-900 hover:underline dark:text-[#e4e6eb] cursor-pointer"
          >
            {name}
          </button>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            {isOwner ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <Crown className="h-3 w-3" /> Chủ nhóm
              </span>
            ) : role === 'ADMIN' ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-bold text-[#1877f2] dark:bg-blue-900/30 dark:text-blue-300">
                <ShieldCheck className="h-3 w-3" /> Quản trị viên
              </span>
            ) : role === 'MODERATOR' ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                <ShieldCheck className="h-3 w-3" /> Người kiểm duyệt
              </span>
            ) : null}
            {subtitle && <span className="text-xs text-gray-500 dark:text-[#b0b3b8]">{subtitle}</span>}
          </div>
        </div>
      </div>

      {trailing ? (
        <div className="shrink-0">{trailing}</div>
      ) : hasMenu ? (
        <div className="relative shrink-0" ref={ref}>
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label={`Tùy chọn cho ${name}`}
            disabled={busy}
            onClick={() => {
              if (!open && ref.current) setDropUp(window.innerHeight - ref.current.getBoundingClientRect().bottom < 300);
              setOpen((v) => !v);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-5 w-5" />}
          </button>
          {open && (
            <div role="menu" className={`absolute right-0 z-30 w-64 ${dropUp ? 'bottom-full mb-1' : 'mt-1'} rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-[#4e4f50] dark:bg-[#242526]`}>
              {menuItems!.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  onClick={() => { setOpen(false); item.onClick(); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold cursor-pointer ${
                    item.danger
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                      : 'text-gray-800 hover:bg-gray-100 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c]'
                  }`}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
