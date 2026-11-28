import React from 'react';
import { User, Bell, BellOff, X } from 'lucide-react';
import { ChatUser } from '../types';
import { UserAvatar } from '../../../common/UserAvatar';
import { GroupAvatar } from '../../../common/GroupAvatar';

interface ChatDetailsHeaderProps {
  friend: ChatUser;
  memberCount?: number;
  onClose: () => void;
  onNavigateProfile?: (userId?: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const iconButton =
  'w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer';

/** Một hàng gọn: ảnh đại diện, tên + trạng thái bên trái; nút trang cá nhân, tắt chuông, đóng bên phải. */
export const ChatDetailsHeader: React.FC<ChatDetailsHeaderProps> = ({
  friend,
  memberCount,
  onClose,
  onNavigateProfile,
  isMuted,
  onToggleMute,
}) => {
  const targetUserId = friend.userId || (!friend.isGroup ? friend.id : undefined);

  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-[#393a3b] shrink-0">
      <div className="relative shrink-0">
        {friend.isGroup ? (
          <GroupAvatar name={friend.name} size="lg" shape="circle" className="w-12 h-12 text-lg" />
        ) : (
          <>
            <UserAvatar src={friend.avatar} alt={friend.name} size="lg" className="w-12 h-12" />
            {friend.online && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
            )}
          </>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb] truncate">{friend.name}</h2>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] flex items-center gap-1.5 truncate">
          {friend.isGroup ? (
            <span>{memberCount ? `${memberCount} thành viên` : 'Nhóm chat'}</span>
          ) : (
            <span className={friend.online ? 'text-green-600 dark:text-green-400' : ''}>
              {friend.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          )}
          {isMuted && (
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              · <BellOff className="w-3 h-3" /> Đã tắt chuông
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {targetUserId && onNavigateProfile && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onNavigateProfile(targetUserId);
            }}
            title="Trang cá nhân"
            aria-label="Trang cá nhân"
            className={iconButton}
          >
            <User className="w-[18px] h-[18px]" />
          </button>
        )}
        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? 'Bật chuông' : 'Tắt chuông'}
          aria-label={isMuted ? 'Bật chuông' : 'Tắt chuông'}
          aria-pressed={isMuted}
          className={
            isMuted
              ? 'w-9 h-9 rounded-full flex items-center justify-center bg-amber-100 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-600 dark:text-amber-400 transition cursor-pointer'
              : iconButton
          }
        >
          {isMuted ? <BellOff className="w-[18px] h-[18px]" /> : <Bell className="w-[18px] h-[18px]" />}
        </button>
        <span className="w-px h-6 bg-gray-200 dark:bg-[#393a3b] mx-1" />
        <button type="button" onClick={onClose} title="Đóng (Esc)" aria-label="Đóng" className={iconButton}>
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
