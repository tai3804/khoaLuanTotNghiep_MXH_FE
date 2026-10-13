import React from 'react';

interface CallHistoryTabsProps {
  activeTab: 'all' | 'missed';
  onChangeTab: (tab: 'all' | 'missed') => void;
  missedCount?: number;
}

export const CallHistoryTabs: React.FC<CallHistoryTabsProps> = ({
  activeTab,
  onChangeTab,
  missedCount = 0,
}) => {
  return (
    <div className="flex px-6 pt-3 border-b border-gray-100 dark:border-[#393a3b] space-x-4 shrink-0">
      <button
        onClick={() => onChangeTab('all')}
        className={`pb-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
          activeTab === 'all'
            ? 'border-[#1877f2] text-[#1877f2] dark:border-blue-400 dark:text-blue-400'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Tất cả
      </button>
      <button
        onClick={() => onChangeTab('missed')}
        className={`pb-2.5 text-sm font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
          activeTab === 'missed'
            ? 'border-red-500 text-red-500'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <span>Cuộc gọi nhỡ & Từ chối</span>
        {missedCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 font-bold">
            {missedCount}
          </span>
        )}
      </button>
    </div>
  );
};
