import React from 'react';
import { X } from 'lucide-react';
import { ChatUser } from './types';
import { UserAvatar } from '../../common/UserAvatar';

interface ChatBoxMinimizedProps {
  friend: ChatUser;
  onRestore: () => void;
  onClose: () => void;
  offsetRight?: number;
}

export const ChatBoxMinimized: React.FC<ChatBoxMinimizedProps> = ({
  friend,
  onRestore,
  onClose,
  offsetRight,
}) => {
  const customStyle = offsetRight !== undefined ? { right: `${offsetRight}px` } : undefined;
  const positionClass = offsetRight !== undefined ? 'fixed bottom-0 z-50' : 'relative z-50';

  return (
    <div
      style={customStyle}
      onClick={onRestore}
      className={`${positionClass} flex items-center space-x-2.5 bg-white dark:bg-[#242526] border-t border-x border-gray-200 dark:border-[#393a3b] shadow-lg hover:shadow-xl rounded-t-2xl px-3.5 h-11 cursor-pointer transition-all duration-150 hover:bg-gray-50 dark:hover:bg-[#2d2e30] shrink-0 select-none group`}
      title={`Mở chat với ${friend.name}`}
    >
      <div className="relative shrink-0">
        <UserAvatar src={friend.avatar} alt={friend.name} size="sm" className="w-7 h-7 rounded-full" />
        {friend.online && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
        )}
      </div>

      <span className="text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] max-w-[120px] truncate">
        {friend.name}
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer shrink-0"
        title="Đóng"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
