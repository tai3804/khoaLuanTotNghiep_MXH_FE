import React from 'react';
import { Tag, UserCheck, Bell } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface ProfessionalSettingsToggleProps {
  showCategoryBadge: boolean;
  setShowCategoryBadge: (val: boolean) => void;
  allowPublicFollow: boolean;
  setAllowPublicFollow: (val: boolean) => void;
  enableInsightsNotification: boolean;
  setEnableInsightsNotification: (val: boolean) => void;
}

export const ProfessionalSettingsToggle: React.FC<ProfessionalSettingsToggleProps> = ({
  showCategoryBadge,
  setShowCategoryBadge,
  allowPublicFollow,
  setAllowPublicFollow,
  enableInsightsNotification,
  setEnableInsightsNotification,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="space-y-3 pt-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#b0b3b8]">
        {isEn ? 'Display and interaction options' : 'Tùy chọn hiển thị & Tương tác'}
      </h4>

      <div className="space-y-2.5">
        {/* Toggle 1: Show category badge on profile */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/50 dark:bg-[#3a3b3c]/20 hover:border-gray-300 dark:hover:border-gray-500 transition-colors gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-700 dark:text-[#e4e6eb] shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] block leading-tight">
                {isEn ? 'Show category on profile' : 'Hiển thị nhãn hạng mục trên trang cá nhân'}
              </span>
              <span className="text-xs text-gray-500 dark:text-[#b0b3b8] block mt-0.5">
                {isEn
                  ? 'Let visitors see your creator category on your profile header'
                  : 'Cho phép khách xem biết được lĩnh vực sáng tạo chuyên môn của bạn'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCategoryBadge(!showCategoryBadge)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              showCategoryBadge ? 'bg-[#1877f2]' : 'bg-gray-300 dark:bg-[#4e4f50]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                showCategoryBadge ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Allow Public Follow */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/50 dark:bg-[#3a3b3c]/20 hover:border-gray-300 dark:hover:border-gray-500 transition-colors gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-700 dark:text-[#e4e6eb] shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] block leading-tight">
                {isEn ? 'Allow public follow' : 'Bật nút theo dõi công khai'}
              </span>
              <span className="text-xs text-gray-500 dark:text-[#b0b3b8] block mt-0.5">
                {isEn
                  ? 'Anyone can follow your public posts without waiting for friend approval'
                  : 'Người dùng khác có thể theo dõi bạn mà không cần chờ đồng ý kết bạn'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAllowPublicFollow(!allowPublicFollow)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              allowPublicFollow ? 'bg-[#1877f2]' : 'bg-gray-300 dark:bg-[#4e4f50]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                allowPublicFollow ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 3: Receive Weekly Insights Digest */}
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/50 dark:bg-[#3a3b3c]/20 hover:border-gray-300 dark:hover:border-gray-500 transition-colors gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-700 dark:text-[#e4e6eb] shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] block leading-tight">
                {isEn ? 'Weekly performance digest' : 'Báo cáo hiệu suất hàng tuần'}
              </span>
              <span className="text-xs text-gray-500 dark:text-[#b0b3b8] block mt-0.5">
                {isEn
                  ? 'Receive insights summary about reach and top performing posts'
                  : 'Nhận thông báo tổng kết lượt tiếp cận & bài viết tăng trưởng tốt nhất'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEnableInsightsNotification(!enableInsightsNotification)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
              enableInsightsNotification ? 'bg-[#1877f2]' : 'bg-gray-300 dark:bg-[#4e4f50]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                enableInsightsNotification ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
