import React from 'react';
import { X } from 'lucide-react';

interface EditModalHeaderProps {
  onClose: () => void;
  title?: string;
}

export const EditModalHeader: React.FC<EditModalHeaderProps> = ({
  onClose,
  title = 'Chỉnh sửa trang cá nhân',
}) => {
  return (
    <div className="px-5 py-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between relative bg-white dark:bg-[#242526] shrink-0">
      <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb] text-center w-full">
        {title}
      </h3>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-[#b0b3b8] dark:hover:text-[#e4e6eb] bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] rounded-full transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
