import React from 'react';
import { Loader2 } from 'lucide-react';

interface EditModalFooterProps {
  onClose: () => void;
  isSaving: boolean;
}

export const EditModalFooter: React.FC<EditModalFooterProps> = ({ onClose, isSaving }) => {
  return (
    <div className="pt-4 border-t border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
      <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
        Tất cả thông tin chỉnh sửa sẽ được lưu vào hồ sơ cá nhân của bạn.
      </p>
      <div className="flex items-center space-x-2 shrink-0">
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gray-200 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-300 dark:hover:bg-[#4e4f50] transition cursor-pointer"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#1877f2] text-white hover:bg-[#166fe5] shadow-md transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang lưu...</span>
            </>
          ) : (
            <span>Lưu thay đổi</span>
          )}
        </button>
      </div>
    </div>
  );
};
