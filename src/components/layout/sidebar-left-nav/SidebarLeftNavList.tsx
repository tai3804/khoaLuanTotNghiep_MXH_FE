import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SidebarLeftNavListProps {
  displayedItems: Array<{
    id: string;
    label: string;
    iconNode: React.ReactNode;
  }>;
  activeFilter?: string;
  showMore: boolean;
  setShowMore: (show: boolean | ((prev: boolean) => boolean)) => void;
  onItemClick: (id: string) => void;
}

export const SidebarLeftNavList: React.FC<SidebarLeftNavListProps> = ({
  displayedItems,
  activeFilter = 'all',
  showMore,
  setShowMore,
  onItemClick,
}) => {
  return (
    <div className="space-y-0.5">
      {displayedItems.map((item) => {
        const isActive = activeFilter === item.id;
        return (
          <div
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={`flex items-center space-x-3 px-2.5 py-2 rounded-xl cursor-pointer transition font-medium text-sm ${
              isActive
                ? 'bg-blue-50 dark:bg-[#3a3b3c] text-[#2d88ff] font-semibold'
                : 'text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60'
            }`}
          >
            <div className="shrink-0">{item.iconNode}</div>
            <span className="truncate">{item.label}</span>
          </div>
        );
      })}

      {/* See more / less button */}
      <button
        onClick={() => setShowMore((prev) => !prev)}
        className="w-full flex items-center space-x-3 px-2.5 py-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 text-gray-800 dark:text-[#e4e6eb] text-sm font-medium cursor-pointer transition"
      >
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-700 dark:text-[#e4e6eb]">
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`} />
        </div>
        <span>{showMore ? 'Ẩn bớt' : 'Xem thêm'}</span>
      </button>
    </div>
  );
};
