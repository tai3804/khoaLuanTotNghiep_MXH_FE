import React from 'react';
import { Bell } from 'lucide-react';

export const NotificationSettingsHeader: React.FC = () => {
  return (
    <div className="pb-4 border-b border-gray-200 dark:border-[#393a3b]">
      <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Cài đặt thông báo</h2>
      <p className="text-[13px] text-gray-500 dark:text-[#b0b3b8] mt-1">
        Chọn loại thông báo bạn muốn nhận và bật âm thanh khi có tương tác mới.
      </p>
    </div>
  );
};
