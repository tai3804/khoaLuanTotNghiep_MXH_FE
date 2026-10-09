import React from 'react';
import { EyeOff, Users } from 'lucide-react';

export const ProfileVisitorsEmpty: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700/60 my-4">
      <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-4 ring-8 ring-blue-500/10">
        <Users className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
        Chưa có lượt xem hồ sơ mới
      </h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
        Khi mọi người xem trang cá nhân của bạn, họ sẽ hiển thị ở đây. Hãy đăng tải thêm nhiều nội dung hấp dẫn để tăng lượt ghé thăm!
      </p>
      <div className="inline-flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
        <EyeOff className="w-3.5 h-3.5" />
        <span>Chỉ mình bạn có thể nhìn thấy danh sách này</span>
      </div>
    </div>
  );
};
