import React from 'react';
import { UserStorageQuota } from '../../../services/mediaService';
import { useLanguage } from '../../../context/LanguageContext';

interface StorageQuotaBarProps {
  quota: UserStorageQuota;
}

export const StorageQuotaBar: React.FC<StorageQuotaBarProps> = ({ quota }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="px-5 py-3.5 bg-gray-50 dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] transition-colors">
      <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-gray-700 dark:text-[#e4e6eb]">
        <span>
          {isEn ? 'Storage used: ' : 'Dung lượng đã sử dụng: '}
          <strong className="text-[#1877f2] dark:text-[#4599ff]">{quota.usedReadable}</strong> / {quota.maxQuotaReadable}
        </span>
        <span className="font-bold text-[#1877f2] dark:text-[#4599ff]">{quota.usedPercentage}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-[#3a3b3c] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1877f2] dark:bg-[#4599ff] transition-all duration-500 rounded-full"
          style={{ width: `${Math.min(quota.usedPercentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
