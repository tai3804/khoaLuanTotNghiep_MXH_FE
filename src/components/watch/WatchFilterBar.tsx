import React from 'react';
import { Search, X, RefreshCw, PlaySquare, Flame, Clock } from 'lucide-react';

export type WatchTabType = 'for_you' | 'trending' | 'recent';

interface WatchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  loading: boolean;
  onRefresh: () => void;
  activeWatchTab: WatchTabType;
  onSelectTab: (tab: WatchTabType) => void;
}

export const WatchFilterBar: React.FC<WatchFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  loading,
  onRefresh,
  activeWatchTab,
  onSelectTab,
}) => {
  return (
    <div className="mb-4 space-y-2.5">
      {/* Row 1: Search Bar on Left, Reload Button on Top Right */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs sm:max-w-sm">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 dark:text-[#b0b3b8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm video..."
            className="w-full pl-8 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          title="Làm mới video"
          className="p-2 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Row 2: Option Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">

        <button
          type="button"
          onClick={() => onSelectTab('for_you')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeWatchTab === 'for_you'
              ? 'bg-[#1877f2] text-white shadow-xs font-bold'
              : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
          }`}
        >
          <PlaySquare className="w-4 h-4" />
          <span>Dành cho bạn</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('trending')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeWatchTab === 'trending'
              ? 'bg-[#1877f2] text-white shadow-xs font-bold'
              : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Thịnh hành</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('recent')}
          className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
            activeWatchTab === 'recent'
              ? 'bg-[#1877f2] text-white shadow-xs font-bold'
              : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Mới nhất</span>
        </button>
      </div>
    </div>
  );
};
