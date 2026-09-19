import React from 'react';
import { X } from 'lucide-react';
import { ChatUser } from './types';
import { UserAvatar } from '../../common/UserAvatar';

interface ChatBoxMinimizedProps {
  friend: ChatUser;
  onRestore: () => void;
  onClose: () => void;
}

export const ChatBoxMinimized: React.FC<ChatBoxMinimizedProps> = ({ friend, onRestore, onClose }) => {
  return (
    <div className="fixed bottom-0 right-16 z-50 flex items-center space-x-2 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-xl rounded-t-xl px-3 py-2 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-[#3a3b3c]">
      <div className="relative" onClick={onRestore}>
        <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
        {friend.online && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
        )}
      </div>
      <span
        onClick={onRestore}
        className="text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] max-w-[100px] truncate"
      >
        {friend.name}
      </span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] p-1 cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
