import React from 'react';
import { User, Bell, BellOff, X, Sparkles } from 'lucide-react';
import { ChatUser } from '../types';
import { UserAvatar } from '../../../common/UserAvatar';
import { GroupAvatar } from '../../../common/GroupAvatar';

interface ChatDetailsHeaderProps {
  friend: ChatUser;
  memberCount?: number;
  onClose: () => void;
  onNavigateProfile?: (userId?: string) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

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
    <div className="bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shrink-0">
      {/* Top Modal Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
            Thông tin cuộc trò chuyện
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-400 hover:text-gray-700 dark:hover:text-[#e4e6eb] transition cursor-pointer"
          title="Đóng (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="flex flex-col items-center justify-center py-4 px-4 text-center bg-gray-50/50 dark:bg-[#1e1f20]/50">
        <div className="relative mb-2.5">
          {friend.isGroup ? (
            <GroupAvatar name={friend.name} size="lg" shape="circle" className="w-16 h-16 sm:w-20 sm:h-20 text-2xl shadow-md ring-2 ring-white dark:ring-[#242526]" />
          ) : (
            <>
              <UserAvatar src={friend.avatar} alt={friend.name} size="lg" className="w-16 h-16 sm:w-20 sm:h-20 shadow-md ring-2 ring-white dark:ring-[#242526]" />
              {friend.online && (
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full shadow-2xs" />
              )}
            </>
          )}
        </div>

        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight truncate max-w-sm sm:max-w-md">
          {friend.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1 flex items-center justify-center space-x-1">
          {friend.isGroup ? (
            <span>{memberCount ? `${memberCount} thành viên trong nhóm` : 'Nhóm chat'}</span>
          ) : (
            <span className={friend.online ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
              {friend.online ? '● Đang hoạt động' : 'Ngoại tuyến'}
            </span>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4 mt-3.5">
          {targetUserId && onNavigateProfile && (
            <button
              onClick={() => {
                onClose();
                onNavigateProfile(targetUserId);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#2d2e30] border border-gray-200 dark:border-[#393a3b] text-gray-700 dark:text-[#e4e6eb] hover:bg-[#1877f2]/10 hover:text-[#1877f2] dark:hover:text-[#4599ff] hover:border-[#1877f2]/30 text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Trang cá nhân</span>
            </button>
          )}

          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-2xs transition cursor-pointer ${
                isMuted
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-600/40 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-[#2d2e30] border-gray-200 dark:border-[#393a3b] text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
              }`}
            >
              {isMuted ? <BellOff className="w-3.5 h-3.5 text-amber-500" /> : <Bell className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Đang tắt chuông' : 'Tắt chuông'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
