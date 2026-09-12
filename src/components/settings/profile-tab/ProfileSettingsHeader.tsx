import React from 'react';
import { User, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileSettingsHeaderProps {
  profileSuccess: string | null;
  profileError: string | null;
}

export const ProfileSettingsHeader: React.FC<ProfileSettingsHeaderProps> = ({
  profileSuccess,
  profileError,
}) => {
  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="border-b border-gray-100 dark:border-[#393a3b] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center space-x-2">
            <User className="w-5 h-5 text-[#1877f2]" />
            <span>Chỉnh Sửa Hồ Sơ Cá Nhân</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            Tùy chỉnh thông tin hiển thị, ảnh đại diện và thông tin liên hệ của bạn trên mạng xã hội.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-[#1877f2]/10 text-[#1877f2] border border-blue-100 dark:border-[#1877f2]/30 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hồ sơ công khai</span>
          </span>
        </div>
      </div>

      {profileSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {profileError && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2 text-red-700 dark:text-red-300 text-xs font-bold shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span>{profileError}</span>
        </div>
      )}
    </div>
  );
};
