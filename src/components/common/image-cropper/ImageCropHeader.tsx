import React from 'react';
import { X, User, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface ImageCropHeaderProps {
  mode: 'avatar' | 'cover';
  onClose: () => void;
}

export const ImageCropHeader: React.FC<ImageCropHeaderProps> = ({ mode, onClose }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#393a3b]">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          {mode === 'avatar' ? (
            <User className="w-5 h-5" />
          ) : (
            <ImageIcon className="w-5 h-5" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">
            {mode === 'avatar'
              ? isEn
                ? 'Edit Profile Picture'
                : 'Chỉnh sửa ảnh đại diện'
              : isEn
              ? 'Edit Cover Photo'
              : 'Chỉnh sửa ảnh bìa'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            {mode === 'avatar'
              ? isEn
                ? 'Drag and zoom to position your avatar'
                : 'Kéo và phóng to để định vị khuôn hình đại diện'
              : isEn
              ? 'Drag and zoom to position your cover photo'
              : 'Kéo và phóng to để định vị vị trí ảnh bìa'}
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-[#b0b3b8] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
