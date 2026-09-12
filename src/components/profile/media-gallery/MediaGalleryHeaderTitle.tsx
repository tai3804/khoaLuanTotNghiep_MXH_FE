import React from 'react';
import { HardDrive } from 'lucide-react';

export const MediaGalleryHeaderTitle: React.FC = () => {
  return (
    <div className="flex items-center space-x-2.5">
      <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#3a3b3c] text-[#1877f2]">
        <HardDrive className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
          Thư viện Media & Dung lượng lưu trữ
        </h3>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
          Quản lý file ảnh, video đã tải lên
        </p>
      </div>
    </div>
  );
};
