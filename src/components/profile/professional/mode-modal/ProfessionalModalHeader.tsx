import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

export type ProfessionalModalTab = 'overview' | 'category' | 'preview';

interface ProfessionalModalHeaderProps {
  activeTab: ProfessionalModalTab;
  onTabChange: (tab: ProfessionalModalTab) => void;
  isCurrentlyEnabled: boolean;
  onClose: () => void;
}

export const ProfessionalModalHeader: React.FC<ProfessionalModalHeaderProps> = ({
  activeTab,
  onTabChange,
  isCurrentlyEnabled,
  onClose,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] p-5 sm:p-6 shrink-0 transition-colors">
      {/* Header Top Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-xl sm:text-2xl text-gray-900 dark:text-[#e4e6eb] tracking-tight">
            {isCurrentlyEnabled
              ? isEn
                ? 'Manage professional mode'
                : 'Quản lý chế độ chuyên nghiệp'
              : isEn
                ? 'Turn on professional mode'
                : 'Bật chế độ chuyên nghiệp'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-[#b0b3b8] mt-1 max-w-lg leading-relaxed">
            {isEn
              ? 'Get paid for your content and view insights about your audience.'
              : 'Nhận tiền từ nội dung của bạn và xem thông tin chi tiết về đối tượng người xem.'}
          </p>
        </div>

        <button
          onClick={onClose}
          aria-label={isEn ? 'Close' : 'Đóng'}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#e4e6eb] transition cursor-pointer shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Clean Text-only Navigation Tabs */}
      <div className="flex items-center gap-2 mt-5 border-t border-gray-100 dark:border-[#393a3b]/60 pt-4 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => onTabChange('overview')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-gray-900 text-white dark:bg-[#3a3b3c] dark:text-[#e4e6eb]'
              : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50'
          }`}
        >
          {isEn ? 'Benefits' : 'Quyền lợi & Tính năng'}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('category')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'category'
              ? 'bg-gray-900 text-white dark:bg-[#3a3b3c] dark:text-[#e4e6eb]'
              : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50'
          }`}
        >
          {isEn ? 'Creator category' : 'Hạng mục sáng tạo'}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('preview')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'preview'
              ? 'bg-gray-900 text-white dark:bg-[#3a3b3c] dark:text-[#e4e6eb]'
              : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50'
          }`}
        >
          {isEn ? 'Profile preview' : 'Xem trước hồ sơ'}
        </button>
      </div>
    </div>
  );
};
