import React from 'react';
import { Globe, Lock, Users, Sparkles, MessageSquare, Image, Shield, Camera } from 'lucide-react';
import { GroupAvatar } from '../../common/GroupAvatar';
import { UserAvatar } from '../../common/UserAvatar';

interface CreateGroupDesktopPreviewProps {
  user: any;
  name: string;
  description: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  coverUrl?: string;
  onSelectCover?: () => void;
  uploadingCover?: boolean;
  memberCount: number;
}

export const CreateGroupDesktopPreview: React.FC<CreateGroupDesktopPreviewProps> = ({
  user,
  name,
  description,
  privacy,
  coverUrl,
  onSelectCover,
  uploadingCover,
  memberCount,
}) => {
  const displayName = name.trim() || 'Tên nhóm của bạn';

  return (
    <div className="w-full max-w-[880px] xl:max-w-[920px] bg-white dark:bg-[#242526] rounded-2xl shadow-xl border border-gray-200/90 dark:border-[#393a3b] overflow-hidden transition-all duration-300">
      {/* Cover Banner Mockup */}
      <div className="h-56 sm:h-72 w-full relative flex items-center justify-center overflow-hidden bg-gray-100 dark:bg-[#1a1b1d] border-b border-gray-200 dark:border-[#393a3b]">
        {coverUrl ? (
          <img src={coverUrl} alt="Cover Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-[#b0b3b8]">
            <div className="w-12 h-12 rounded-full bg-gray-200/80 dark:bg-[#2b2d30] flex items-center justify-center text-gray-500 dark:text-gray-400 shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-[#b0b3b8]">
              Chưa có ảnh bìa tùy chỉnh
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onSelectCover}
          disabled={uploadingCover}
          className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-60"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{coverUrl ? 'Chỉnh sửa ảnh bìa' : 'Thêm ảnh bìa'}</span>
        </button>
      </div>

      {/* Group Info Header */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-[#393a3b] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-[#e4e6eb] tracking-tight truncate leading-tight">
              {displayName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#b0b3b8] font-medium flex-wrap">
              <span className="flex items-center gap-1">
                {privacy === 'PUBLIC' ? (
                  <>
                    <Globe className="w-3.5 h-3.5 text-[#1877f2]" />
                    <span>Nhóm Công khai</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Nhóm Riêng tư</span>
                  </>
                )}
              </span>
              <span>·</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {memberCount} thành viên
              </span>
            </div>
          </div>

          {/* Action Buttons Mock */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              className="px-4 py-2 bg-[#1877f2] text-white text-xs font-bold rounded-xl shadow-xs pointer-events-none"
            >
              + Mời
            </button>
            <button
              type="button"
              className="px-3.5 py-2 bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] text-xs font-bold rounded-xl pointer-events-none"
            >
              Đã tham gia
            </button>
          </div>
        </div>

        {/* Tab Navigation Mockup */}
        <div className="flex items-center gap-3 pt-2 text-xs font-bold text-gray-500 dark:text-[#b0b3b8] border-t border-gray-100 dark:border-[#393a3b]">
          <span className="text-[#1877f2] border-b-2 border-[#1877f2] pb-2 font-black cursor-pointer">
            Giới thiệu
          </span>
          <span className="hover:text-gray-900 pb-2 cursor-pointer">Thảo luận</span>
          <span className="hover:text-gray-900 pb-2 cursor-pointer">Đáng chú ý</span>
          <span className="hover:text-gray-900 pb-2 cursor-pointer">Thành viên</span>
          <span className="hover:text-gray-900 pb-2 cursor-pointer">File phương tiện</span>
        </div>
      </div>

      {/* Feed Preview Area (Facebook 2-column layout) */}
      <div className="p-5 sm:p-6 bg-[#f0f2f5] dark:bg-[#18191a] grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: About this group */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              Giới thiệu về nhóm
            </h4>
            <p className="text-xs text-gray-600 dark:text-[#b0b3b8] leading-relaxed">
              {description.trim() || 'Chưa có phần giới thiệu. Bạn có thể cập nhật sau khi tạo nhóm.'}
            </p>

            <hr className="border-gray-100 dark:border-[#393a3b]" />

            <div className="space-y-2.5 text-xs text-gray-600 dark:text-[#b0b3b8]">
              <div className="flex items-start gap-2.5">
                {privacy === 'PUBLIC' ? (
                  <Globe className="w-4 h-4 text-[#1877f2] shrink-0 mt-0.5" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold text-gray-900 dark:text-[#e4e6eb] block">
                    {privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {privacy === 'PUBLIC'
                      ? 'Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và bài viết.'
                      : 'Chỉ thành viên mới nhìn thấy những người trong nhóm và bài viết.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Create Post Box & Feed Placeholder */}
        <div className="lg:col-span-7 space-y-4">
          {/* Create Post Mockup */}
          <div className="bg-white dark:bg-[#242526] p-3.5 rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] space-y-3">
            <div className="flex items-center space-x-2.5">
              <UserAvatar src={user?.avatar} size="sm" />
              <div className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] rounded-full px-4 py-2 text-xs text-gray-500 dark:text-[#b0b3b8] transition cursor-default">
                Bạn đang nghĩ gì?
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-[#393a3b] pt-2 flex items-center justify-around text-xs font-semibold text-gray-500">
              <span className="flex items-center gap-1.5 hover:text-green-600 cursor-default">
                <Image className="w-4 h-4 text-green-500" /> Ảnh/video
              </span>
              <span className="flex items-center gap-1.5 hover:text-blue-600 cursor-default">
                <Sparkles className="w-4 h-4 text-amber-500" /> Cảm xúc
              </span>
            </div>
          </div>

          {/* Empty State Mockup */}
          <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h5 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              Chưa có bài viết nào
            </h5>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-xs mx-auto">
              Hãy là người đầu tiên chia sẻ bài viết để khởi động cuộc thảo luận cho nhóm!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
