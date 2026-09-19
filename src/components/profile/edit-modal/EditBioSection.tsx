import React from 'react';

interface EditBioSectionProps {
  bio: string;
  setBio: (val: string) => void;
}

export const EditBioSection: React.FC<EditBioSectionProps> = ({ bio, setBio }) => {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#393a3b]">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
          Tiểu sử
        </h4>
      </div>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Mô tả bản thân của bạn..."
        maxLength={101}
        rows={3}
        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
      />
      <p className="text-[11px] text-right text-gray-400 dark:text-[#8a8d91]">
        Còn {101 - bio.length} ký tự
      </p>
    </div>
  );
};
