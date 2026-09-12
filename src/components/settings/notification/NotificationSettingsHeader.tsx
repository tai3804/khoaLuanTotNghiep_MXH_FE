import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationSettingsHeader: React.FC = () => {
  return (
    <div className="border-b border-gray-100 dark:border-[#393a3b] pb-3">
      <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center gap-2">
        <Bell className="w-4 h-4 text-blue-500" />
        <span>Cấu hình thông báo (UC-NO05)</span>
      </h3>
      <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
        Chọn loại thông báo bạn muốn nhận và bật âm thanh khi có tương tác mới.
      </p>
    </div>
  );
};
