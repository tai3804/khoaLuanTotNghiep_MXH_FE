import React from 'react';
import { Clock, X } from 'lucide-react';

interface CallHistoryHeaderProps {
  onClose: () => void;
}

export const CallHistoryHeader: React.FC<CallHistoryHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#393a3b] shrink-0">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[#1877f2]">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Lịch sử cuộc gọi
        </h3>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-gray-400 transition cursor-pointer"
        aria-label="Đóng"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};
