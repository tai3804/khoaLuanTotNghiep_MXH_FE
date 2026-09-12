import React from 'react';
import { X } from 'lucide-react';

interface CommentModalHeaderProps {
  authorName: string;
  language: string;
  onClose: () => void;
}

export const CommentModalHeader: React.FC<CommentModalHeaderProps> = ({
  authorName,
  language,
  onClose,
}) => {
  return (
    <div className="relative px-4 py-3.5 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-center shrink-0">
      <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
        {language === 'en' ? `Post by ${authorName}` : `Bài viết của ${authorName}`}
      </h3>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3.5 top-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#e4e6eb] flex items-center justify-center transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
