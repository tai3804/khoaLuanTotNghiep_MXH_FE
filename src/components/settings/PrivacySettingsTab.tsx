import React from 'react';
import { Shield } from 'lucide-react';

export const PrivacySettingsTab: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] border-b border-gray-100 dark:border-[#393a3b] pb-3 flex items-center space-x-2">
        <Shield className="w-4 h-4 text-indigo-500" />
        <span>Cài Đặt Quyền Riêng Tư</span>
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl border border-gray-200/60 dark:border-[#393a3b]">
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Ai có thể xem bài viết của bạn?</h4>
            <p className="text-[10px] text-gray-400 dark:text-[#8a8d91]">Mặc định đối tượng hiển thị bài viết</p>
          </div>
          <select className="bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b] text-xs font-bold rounded-xl px-3 py-1.5 text-gray-800 dark:text-[#e4e6eb] focus:outline-none">
            <option>Công khai (Public)</option>
            <option>Bạn bè (Friends)</option>
            <option>Chỉ mình tôi (Private)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
