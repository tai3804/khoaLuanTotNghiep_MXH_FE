import React from 'react';
import { Camera, Upload, Link as LinkIcon, Loader2, Image as ImageIcon } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';

interface ProfileMediaBannerSectionProps {
  user: any;
  coverUrl: string;
  setCoverUrl: (val: string) => void;
  coverError: boolean;
  setCoverError: (val: boolean) => void;
  uploadingCover: boolean;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  avatarUrl: string;
  setAvatarUrl: (val: string) => void;
  uploadingAvatar: boolean;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  firstName: string;
  lastName: string;
  middleName: string;
  bio: string;
  showUrlInputs: boolean;
  setShowUrlInputs: (val: boolean) => void;
}

export const ProfileMediaBannerSection: React.FC<ProfileMediaBannerSectionProps> = ({
  user,
  coverUrl,
  setCoverUrl,
  coverError,
  setCoverError,
  uploadingCover,
  coverInputRef,
  handleCoverUpload,
  avatarUrl,
  setAvatarUrl,
  uploadingAvatar,
  avatarInputRef,
  handleAvatarUpload,
  firstName,
  lastName,
  middleName,
  bio,
  showUrlInputs,
  setShowUrlInputs,
}) => {
  return (
    <div className="bg-gray-50 dark:bg-[#18191a] border border-gray-200 dark:border-[#393a3b] rounded-2xl p-4 shadow-sm overflow-hidden space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-extrabold text-gray-700 dark:text-[#e4e6eb] uppercase tracking-wider flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-[#1877f2]" />
          <span>Ảnh Đại Diện & Ảnh Bìa</span>
        </h4>
        <button
          type="button"
          onClick={() => setShowUrlInputs(!showUrlInputs)}
          className="text-[11px] font-bold text-[#1877f2] hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{showUrlInputs ? 'Ẩn ô nhập URL' : 'Tùy chỉnh bằng URL trực tiếp'}</span>
        </button>
      </div>

      {/* Interactive Cover Photo Container */}
      <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] group">
        {coverUrl && !coverError ? (
          <img
            src={coverUrl}
            alt=""
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setCoverError(true)}
          />
        ) : null}

        {/* Cover photo upload trigger overlay */}
        <input
          type="file"
          ref={coverInputRef}
          onChange={handleCoverUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => coverInputRef.current?.click()}
          disabled={uploadingCover}
          className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-50"
        >
          {uploadingCover ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Camera className="w-3.5 h-3.5" />
          )}
          <span>{uploadingCover ? 'Đang tải lên...' : 'Đổi ảnh bìa'}</span>
        </button>
      </div>

      {/* Avatar and Info Header Overlap */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 px-3">
        <div className="flex items-end space-x-4">
          {/* Avatar circle container */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#242526] shadow-lg overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center">
              <UserAvatar
                src={avatarUrl || user?.avatar}
                alt={firstName || 'User'}
                size="xl"
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-1 right-1 p-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full shadow-md transition cursor-pointer border-2 border-white dark:border-[#242526] disabled:opacity-50"
              title="Thay đổi ảnh đại diện"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Name preview beside avatar */}
          <div className="pb-1">
            <h4 className="text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb] leading-snug">
              {[lastName, middleName, firstName].filter(Boolean).join(' ') || 'Tên của bạn'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              {bio ? `"${bio.length > 50 ? bio.substring(0, 50) + '...' : bio}"` : 'Thành viên KLTN Social'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 pb-1">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="px-3.5 py-1.5 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#1877f2]" />
            <span>Tải ảnh đại diện</span>
          </button>
        </div>
      </div>

      {/* Optional Direct URL Inputs */}
      {showUrlInputs && (
        <div className="pt-3 border-t border-gray-200 dark:border-[#393a3b] space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
              Đường dẫn Ảnh đại diện (Avatar URL)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
              Đường dẫn Ảnh bìa (Cover URL)
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
