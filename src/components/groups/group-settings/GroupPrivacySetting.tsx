import React from 'react';
import { Globe, Lock } from 'lucide-react';

interface GroupPrivacySettingProps {
  privacy: 'PUBLIC' | 'PRIVATE';
  setPrivacy: (privacy: 'PUBLIC' | 'PRIVATE') => void;
  canEditSettings: boolean;
}

export const GroupPrivacySetting: React.FC<GroupPrivacySettingProps> = ({
  privacy,
  setPrivacy,
  canEditSettings,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
        Quyền riêng tư
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        {(['PUBLIC', 'PRIVATE'] as const).map((value) => (
          <button
            key={value}
            type="button"
            disabled={!canEditSettings}
            onClick={() => setPrivacy(value)}
            className={`text-left rounded-2xl border p-3.5 transition cursor-pointer disabled:opacity-60 ${
              privacy === value
                ? 'border-[#1877f2] bg-blue-50/70 dark:bg-blue-900/20 shadow-xs'
                : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/40'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb]">
              {value === 'PUBLIC' ? (
                <Globe className="w-4 h-4 text-[#1877f2]" />
              ) : (
                <Lock className="w-4 h-4 text-amber-500" />
              )}
              <span>{value === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</span>
            </div>
            <p className="mt-1 text-[11px] text-gray-500 dark:text-[#b0b3b8] leading-relaxed">
              {value === 'PUBLIC'
                ? 'Bất kỳ ai cũng có thể tìm thấy nhóm và xem bài viết.'
                : 'Chỉ thành viên mới nhìn thấy các thành viên và bài viết trong nhóm.'}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
