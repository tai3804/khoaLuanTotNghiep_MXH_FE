import React from 'react';
import { useLanguage } from '../../../../context/LanguageContext';
import { ProfessionalModalTab } from './ProfessionalModalHeader';

interface ProfessionalModalFooterProps {
  isCurrentlyEnabled: boolean;
  activeTab: ProfessionalModalTab;
  onTabChange: (tab: ProfessionalModalTab) => void;
  loading: boolean;
  onToggle: (enable: boolean) => void;
  onClose: () => void;
}

export const ProfessionalModalFooter: React.FC<ProfessionalModalFooterProps> = ({
  isCurrentlyEnabled,
  activeTab,
  onTabChange,
  loading,
  onToggle,
  onClose,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] shrink-0 transition-colors">
      {/* Left button: Turn off if already enabled, or Cancel */}
      {isCurrentlyEnabled ? (
        <button
          type="button"
          onClick={() => onToggle(false)}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition cursor-pointer disabled:opacity-50"
        >
          {isEn ? 'Turn off professional mode' : 'Tắt chế độ chuyên nghiệp'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-lg transition cursor-pointer"
        >
          {isEn ? 'Cancel' : 'Để sau'}
        </button>
      )}

      {/* Right buttons: Tab navigation & Main Action */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {activeTab === 'overview' && (
          <button
            type="button"
            onClick={() => onTabChange('category')}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg font-semibold text-sm bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer"
          >
            {isEn ? 'Choose category' : 'Chọn hạng mục'}
          </button>
        )}

        {activeTab === 'category' && (
          <button
            type="button"
            onClick={() => onTabChange('preview')}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg font-semibold text-sm bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer"
          >
            {isEn ? 'Preview profile' : 'Xem trước hồ sơ'}
          </button>
        )}

        <button
          type="button"
          onClick={() => onToggle(true)}
          disabled={loading}
          className="flex-1 sm:flex-initial px-5 py-2 rounded-lg font-semibold text-sm bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          {loading
            ? isEn
              ? 'Saving...'
              : 'Đang lưu...'
            : isCurrentlyEnabled
              ? isEn
                ? 'Save changes'
                : 'Lưu thay đổi'
              : isEn
                ? 'Turn on'
                : 'Bật'}
        </button>
      </div>
    </div>
  );
};
