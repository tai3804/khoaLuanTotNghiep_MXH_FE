import React from 'react';
import { UserStorageQuota } from '../../../services/mediaService';

interface StorageQuotaBarProps {
  quota: UserStorageQuota;
}

export const StorageQuotaBar: React.FC<StorageQuotaBarProps> = ({ quota }) => {
  return (
    <div className="px-5 py-3.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-gray-200/80 dark:border-[#393a3b]">
      <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-gray-700 dark:text-[#e4e6eb]">
        <span>
          Dung lượng đã sử dụng: <strong className="text-[#1877f2]">{quota.usedReadable}</strong> / {quota.maxQuotaReadable}
        </span>
        <span className="font-bold text-[#1877f2]">{quota.usedPercentage}%</span>
      </div>
      <div className="w-full h-2.5 bg-gray-200 dark:bg-[#3a3b3c] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1877f2] to-indigo-500 transition-all duration-500 rounded-full"
          style={{ width: `${Math.min(quota.usedPercentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
