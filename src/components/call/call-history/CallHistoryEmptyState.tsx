import React from 'react';
import { Phone } from 'lucide-react';

interface CallHistoryEmptyStateProps {
  isMissedTab: boolean;
}

export const CallHistoryEmptyState: React.FC<CallHistoryEmptyStateProps> = ({ isMissedTab }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center py-16 text-center text-gray-400 dark:text-gray-500">
      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#3a3b3c]/50 flex items-center justify-center mb-3">
        <Phone className="w-8 h-8 opacity-40 text-gray-400 dark:text-gray-300" />
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-[#e4e6eb]">
        {isMissedTab ? 'Không có cuộc gọi nhỡ nào' : 'Chưa có cuộc gọi nào trong nhật ký'}
      </p>
      <p className="text-xs text-gray-400 dark:text-[#b0b3b8] mt-1 max-w-xs">
        {isMissedTab
          ? 'Các cuộc gọi nhỡ hoặc bị từ chối sẽ hiển thị tại đây.'
          : 'Lịch sử các cuộc gọi thoại và video của bạn sẽ được lưu tại đây.'}
      </p>
    </div>
  );
};
