import React from 'react';
import { Search, X, Layers, Clock, Sparkles, CheckCircle2, ShieldOff } from 'lucide-react';

export type SupportInboxFilterStatus = 'ALL' | 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

interface SupportInboxFiltersProps {
  activeStatus: SupportInboxFilterStatus;
  onStatusChange: (status: SupportInboxFilterStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: Record<SupportInboxFilterStatus, number>;
}

export const SupportInboxFilters: React.FC<SupportInboxFiltersProps> = ({
  activeStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  const filterTabs: { id: SupportInboxFilterStatus; label: string; icon: any }[] = [
    { id: 'ALL', label: 'Tất cả', icon: Layers },
    { id: 'PENDING', label: 'Đang chờ', icon: Clock },
    { id: 'REVIEWING', label: 'Đang xem xét', icon: Sparkles },
    { id: 'RESOLVED', label: 'Đã xử lý', icon: CheckCircle2 },
    { id: 'DISMISSED', label: 'Không vi phạm', icon: ShieldOff },
  ];

  return (
    <div className="space-y-3 mb-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm báo cáo theo lý do, mô tả, mã bài viết..."
          className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-xl text-xs text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-[#1877f2]/30 focus:border-[#1877f2] transition shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeStatus === tab.id;
          const count = counts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onStatusChange(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                isActive
                  ? 'bg-[#1877f2] text-white shadow-xs'
                  : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
