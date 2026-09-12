import React from 'react';
import { Phone, Video, Minus, X } from 'lucide-react';
import { ChatUser } from './types';
import { UserAvatar } from '../../common/UserAvatar';

interface ChatBoxHeaderProps {
  friend: ChatUser;
  onMinimize: () => void;
  onClose: () => void;
}

export const ChatBoxHeader: React.FC<ChatBoxHeaderProps> = ({ friend, onMinimize, onClose }) => {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shadow-sm">
      <div className="flex items-center space-x-2.5 cursor-pointer" onClick={onMinimize}>
        <div className="relative">
          <UserAvatar src={friend.avatar} alt={friend.name} size="sm" />
          {friend.online && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#242526] rounded-full" />
          )}
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight">
            {friend.name}
          </h4>
          <span className="text-[10px] text-gray-500 dark:text-[#b0b3b8]">
            {friend.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-0.5 text-[#1877f2] dark:text-[#4599ff]">
        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer" title="Cuộc gọi thoại">
          <Phone className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer" title="Cuộc gọi video">
          <Video className="w-4 h-4" />
        </button>
        <button
          onClick={onMinimize}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] transition cursor-pointer"
          title="Thu nhỏ"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] transition cursor-pointer"
          title="Đóng chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
