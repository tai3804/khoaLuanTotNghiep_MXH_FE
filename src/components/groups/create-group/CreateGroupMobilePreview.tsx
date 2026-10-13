import React from 'react';
import { Globe, Lock, MessageSquare, Image, Wifi, BatteryMedium } from 'lucide-react';
import { GroupAvatar } from '../../common/GroupAvatar';
import { UserAvatar } from '../../common/UserAvatar';

interface CreateGroupMobilePreviewProps {
  user: any;
  name: string;
  description: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  memberCount: number;
}

export const CreateGroupMobilePreview: React.FC<CreateGroupMobilePreviewProps> = ({
  user,
  name,
  description,
  privacy,
  memberCount,
}) => {
  const displayName = name.trim() || 'Tên nhóm của bạn';

  return (
    <div className="w-[330px] sm:w-[360px] bg-[#1a1b1e] rounded-[44px] p-3 shadow-2xl border-4 border-gray-700/70 transition-all duration-300">
      {/* Phone Notch & Speaker */}
      <div className="w-28 h-4 bg-black rounded-full mx-auto mb-2.5 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-gray-900 border border-gray-800" />
      </div>

      {/* Screen Frame */}
      <div className="bg-[#f0f2f5] dark:bg-[#18191a] rounded-[34px] overflow-hidden flex flex-col min-h-[580px] max-h-[640px] shadow-inner text-xs scrollbar-none">
        {/* Status Bar */}
        <div className="px-5 py-2 flex items-center justify-between text-[11px] font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#242526]">
          <span>9:41</span>
          <div className="flex items-center space-x-1.5">
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Mobile Cover Banner */}
        <div className="h-32 w-full relative flex items-center justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 overflow-hidden">
          <div className="opacity-35 transform scale-110">
            <GroupAvatar name={displayName} size="xl" shape="squircle" />
          </div>
        </div>

        {/* Mobile Header Info */}
        <div className="bg-white dark:bg-[#242526] p-4 space-y-3 border-b border-gray-200 dark:border-[#393a3b]">
          <div>
            <h3 className="text-base font-black text-gray-900 dark:text-[#e4e6eb] leading-tight">
              {displayName}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-1">
              {privacy === 'PUBLIC' ? (
                <>
                  <Globe className="w-3 h-3 text-[#1877f2]" />
                  <span>Công khai</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-500" />
                  <span>Riêng tư</span>
                </>
              )}
              <span>·</span>
              <span>{memberCount} thành viên</span>
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              className="flex-1 py-1.5 bg-[#1877f2] text-white font-bold text-xs rounded-lg text-center"
            >
              + Mời
            </button>
            <button
              type="button"
              className="px-3 py-1.5 bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-gray-300 font-bold text-xs rounded-lg"
            >
              Đã tham gia
            </button>
          </div>

          {/* Mobile Tabs */}
          <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-[#393a3b] text-[11px] font-bold text-gray-500">
            <span className="text-[#1877f2] border-b-2 border-[#1877f2] pb-1">Thảo luận</span>
            <span className="pb-1">Đáng chú ý</span>
            <span className="pb-1">Thành viên</span>
          </div>
        </div>

        {/* Mobile Feed Area */}
        <div className="p-3 space-y-3 overflow-y-auto flex-1">
          {description.trim() && (
            <div className="bg-white dark:bg-[#242526] p-3 rounded-xl shadow-xs border border-gray-200/80 dark:border-[#393a3b] space-y-1">
              <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 block">Giới thiệu</span>
              <p className="text-[10px] text-gray-600 dark:text-[#b0b3b8] line-clamp-2 leading-relaxed">
                {description.trim()}
              </p>
            </div>
          )}

          {/* Mobile Create Post Box */}
          <div className="bg-white dark:bg-[#242526] p-2.5 rounded-xl shadow-xs border border-gray-200/80 dark:border-[#393a3b] flex items-center space-x-2">
            <UserAvatar src={user?.avatar} size="xs" />
            <div className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] rounded-full px-3 py-1.5 text-[10px] text-gray-400">
              Bạn đang nghĩ gì?
            </div>
            <Image className="w-4 h-4 text-green-500 shrink-0" />
          </div>

          {/* Mobile Empty Post state */}
          <div className="bg-white dark:bg-[#242526] p-5 rounded-xl shadow-xs border border-gray-200/80 dark:border-[#393a3b] text-center space-y-1.5">
            <MessageSquare className="w-6 h-6 text-[#1877f2] mx-auto" />
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              Chưa có bài viết
            </span>
            <p className="text-[10px] text-gray-400">
              Hãy đăng bài viết đầu tiên cho nhóm!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
