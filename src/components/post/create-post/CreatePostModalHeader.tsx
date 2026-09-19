import React from 'react';
import { X } from 'lucide-react';

interface CreatePostModalHeaderProps {
  onClose: () => void;
}

export const CreatePostModalHeader: React.FC<CreatePostModalHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 dark:border-[#393a3b]">
      <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">Tạo bài viết</h3>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-[#b0b3b8] transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
