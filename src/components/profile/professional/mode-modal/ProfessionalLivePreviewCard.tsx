import React from 'react';
import { useLanguage } from '../../../../context/LanguageContext';

interface ProfessionalLivePreviewCardProps {
  fullName: string;
  avatarUrl?: string;
  selectedCategory: string;
  followerCount?: number;
}

export const ProfessionalLivePreviewCard: React.FC<ProfessionalLivePreviewCardProps> = ({
  fullName,
  avatarUrl,
  selectedCategory,
  followerCount = 1250,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#b0b3b8]">
          {isEn ? 'Public profile card preview' : 'Xem trước thẻ hồ sơ công khai'}
        </h4>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
          {isEn
            ? 'This is how your profile header will appear to visitors with professional mode enabled.'
            : 'Đây là cách trang cá nhân của bạn sẽ hiển thị với người theo dõi và khách truy cập.'}
        </p>
      </div>

      {/* Profile Card Mockup - Clean Facebook Dark/Light Style */}
      <div className="rounded-xl border border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] shrink-0 border border-gray-200 dark:border-[#393a3b]">
            <img
              src={avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : '/default-avatar.png'}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
          </div>

          {/* User Info & Text Badge */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h5 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb] truncate">
                {fullName || (isEn ? 'User' : 'Người dùng')}
              </h5>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]">
                {selectedCategory}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1 font-normal">
              <span className="font-semibold text-gray-800 dark:text-[#e4e6eb]">
                {followerCount.toLocaleString(isEn ? 'en-US' : 'vi-VN')}
              </span>{' '}
              {isEn ? 'followers • Public profile' : 'người theo dõi • Trang cá nhân công khai'}
            </p>

            {/* Action Buttons Mockup */}
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                type="button"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1877f2] text-white hover:bg-[#166fe5] transition cursor-default"
              >
                {isEn ? 'Follow' : 'Theo dõi'}
              </button>

              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#4e4f50] transition cursor-default"
              >
                {isEn ? 'Message' : 'Nhắn tin'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
