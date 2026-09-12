import React from 'react';
import { Image, Smile, Video } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';

interface QuickCreatePostTriggerProps {
  user: any;
  userFirstName: string;
  isAuthenticated: boolean;
  onOpen: () => void;
}

export const QuickCreatePostTrigger: React.FC<QuickCreatePostTriggerProps> = ({
  user,
  userFirstName,
  isAuthenticated,
  onOpen,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-3 mb-4 border border-gray-200 dark:border-[#393a3b] transition-colors select-none">
      <div className="flex items-center space-x-2.5">
        <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="md" className="w-10 h-10 rounded-full" />
        <div
          onClick={onOpen}
          className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-500 dark:text-[#b0b3b8] rounded-full py-2.5 px-4 text-sm font-normal flex items-center justify-between cursor-pointer transition"
        >
          <span>
            {!isAuthenticated
              ? 'Đăng nhập để chia sẻ trạng thái của bạn...'
              : `${userFirstName} ơi, bạn đang nghĩ gì thế?`}
          </span>
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            <Video className="w-4 h-4 text-[#f3425f]" />
            <Image className="w-4 h-4 text-[#45bd62]" />
            <Smile className="w-4 h-4 text-[#f7b125]" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-[#393a3b] pt-2 mt-3 flex items-center justify-around gap-1">
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] text-xs sm:text-sm font-semibold transition cursor-pointer min-w-0"
        >
          <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#f3425f] shrink-0" />
          <span className="truncate">Video trực tiếp</span>
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] text-xs sm:text-sm font-semibold transition cursor-pointer min-w-0"
        >
          <Image className="w-4 h-4 sm:w-5 sm:h-5 text-[#45bd62] shrink-0" />
          <span className="truncate">Ảnh/video</span>
        </button>
        <button
          type="button"
          onClick={onOpen}
          className="flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] text-xs sm:text-sm font-semibold transition cursor-pointer min-w-0"
        >
          <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-[#f7b125] shrink-0" />
          <span className="truncate">Cảm xúc/hoạt động</span>
        </button>
      </div>
    </div>
  );
};
