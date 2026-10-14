import React from 'react';
import { Bell, Sparkles } from 'lucide-react';

export const NotificationSettingsHeader: React.FC = () => {
  return (
    <div className="pb-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb] tracking-tight">
          Cài đặt thông báo
        </h2>
        <p className="text-[13px] text-gray-500 dark:text-[#b0b3b8] mt-1">
          Chọn loại thông báo bạn muốn nhận và bật âm thanh khi có tương tác mới.
        </p>
      </div>
      <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1877f2] border border-blue-100 dark:border-blue-900/40 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Thông báo thời gian thực</span>
      </div>
    </div>
  );
};

