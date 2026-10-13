import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

interface ImageCropFooterProps {
  mode: 'avatar' | 'cover';
  isProcessing: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ImageCropFooter: React.FC<ImageCropFooterProps> = ({
  mode,
  isProcessing,
  onClose,
  onSave,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#393a3b] rounded-b-2xl">
      <button
        onClick={onClose}
        disabled={isProcessing}
        className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#e4e6eb] bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] rounded-xl transition cursor-pointer disabled:opacity-50"
      >
        {isEn ? 'Cancel' : 'Hủy'}
      </button>

      <button
        onClick={onSave}
        disabled={isProcessing}
        className="flex items-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1877f2] hover:bg-[#166fe5] rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{isEn ? 'Saving...' : 'Đang xử lý & lưu...'}</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span>
              {mode === 'avatar'
                ? isEn
                  ? 'Save Profile Picture'
                  : 'Lưu ảnh đại diện'
                : isEn
                ? 'Save Cover Photo'
                : 'Lưu ảnh bìa'}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
