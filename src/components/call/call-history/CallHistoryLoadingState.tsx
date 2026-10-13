import React from 'react';
import { Loader2 } from 'lucide-react';

export const CallHistoryLoadingState: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
      <Loader2 className="w-8 h-8 animate-spin text-[#1877f2] mb-2" />
      <p className="text-xs font-medium">Đang tải nhật ký cuộc gọi...</p>
    </div>
  );
};
