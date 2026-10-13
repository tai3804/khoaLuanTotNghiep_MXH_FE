import React from 'react';
import { EyeOff, Users } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

export const ProfileVisitorsEmpty: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-[#1e1f20] rounded-2xl border border-dashed border-gray-200 dark:border-[#393a3b] my-4">
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] flex items-center justify-center mb-3">
        <Users className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] mb-1">
        {isEn ? 'No recent profile visitors' : 'Chưa có lượt xem hồ sơ mới'}
      </h4>
      <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mb-4 leading-relaxed">
        {isEn
          ? 'When people visit your profile, they will appear here. Share more engaging posts to attract visitors!'
          : 'Khi mọi người xem trang cá nhân của bạn, họ sẽ hiển thị ở đây. Hãy đăng tải thêm nhiều nội dung hấp dẫn để tăng lượt ghé thăm!'}
      </p>
      <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-[#b0b3b8] bg-gray-100 dark:bg-[#3a3b3c] px-3 py-1.5 rounded-full border border-gray-200/60 dark:border-[#393a3b]">
        <EyeOff className="w-3.5 h-3.5" />
        <span>{isEn ? 'Only you can see this list' : 'Chỉ mình bạn có thể nhìn thấy danh sách này'}</span>
      </div>
    </div>
  );
};
