import React from 'react';

interface GroupBasicInfoSettingProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  canEditSettings: boolean;
}

export const GroupBasicInfoSetting: React.FC<GroupBasicInfoSettingProps> = ({
  name,
  setName,
  description,
  setDescription,
  canEditSettings,
}) => {
  return (
    <div className="space-y-4">
      {/* Group Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-700 dark:text-[#b0b3b8] flex items-center justify-between">
          <span>
            Tên nhóm <span className="text-red-500">*</span>
          </span>
          <span className="text-[10px] text-gray-400 font-normal">{name.length}/100</span>
        </label>
        <input
          disabled={!canEditSettings}
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên nhóm..."
          className="w-full rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/80 dark:bg-[#1a1b1d] px-4 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] disabled:opacity-60 transition"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
          Giới thiệu về nhóm
        </label>
        <textarea
          disabled={!canEditSettings}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Mô tả mục đích hoạt động và chủ đề thảo luận của nhóm..."
          className="w-full rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/80 dark:bg-[#1a1b1d] px-4 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] disabled:opacity-60 transition resize-none"
        />
      </div>
    </div>
  );
};
