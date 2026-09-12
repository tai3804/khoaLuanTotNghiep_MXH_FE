import React from 'react';
import { UserAvatar } from '../../common/UserAvatar';
import { Camera, Loader2 } from 'lucide-react';

interface EditAvatarSectionProps {
  avatarUrl: string;
  currentUserAvatar?: string;
  firstName: string;
  uploadingAvatar: boolean;
  onAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EditAvatarSection: React.FC<EditAvatarSectionProps> = ({
  avatarUrl,
  currentUserAvatar,
  firstName,
  uploadingAvatar,
  onAvatarUpload,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
          Ảnh đại diện
        </h4>
        <label
          htmlFor="edit-modal-avatar-file-input"
          className="text-xs font-bold text-[#1877f2] hover:underline cursor-pointer flex items-center space-x-1"
        >
          {uploadingAvatar ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <span>Chỉnh sửa</span>
          )}
        </label>
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative group">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-gray-100 dark:border-[#3a3b3c] shadow-md overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center">
            <UserAvatar
              src={avatarUrl || currentUserAvatar}
              alt={firstName || 'User'}
              size="xl"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            id="edit-modal-avatar-file-input"
            type="file"
            onChange={onAvatarUpload}
            accept="image/*"
            className="hidden"
          />
          <label
            htmlFor="edit-modal-avatar-file-input"
            className="absolute bottom-1 right-1 p-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full shadow-md transition cursor-pointer border-2 border-white dark:border-[#242526]"
          >
            {uploadingAvatar ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </label>
        </div>
      </div>
    </div>
  );
};
