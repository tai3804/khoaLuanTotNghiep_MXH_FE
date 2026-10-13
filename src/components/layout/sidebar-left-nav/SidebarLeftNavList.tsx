import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SidebarNavItem {
  id: string;
  label: string;
  iconNode: React.ReactNode;
}

interface SidebarLeftNavListProps {
  primaryItems: SidebarNavItem[];
  secondaryItems: SidebarNavItem[];
  activeFilter?: string;
  showMore: boolean;
  isCollapsed?: boolean;
  onToggleShowMore: () => void;
  onItemClick: (id: string) => void;
}

export const SidebarLeftNavList: React.FC<SidebarLeftNavListProps> = ({
  primaryItems,
  secondaryItems,
  activeFilter = 'all',
  showMore,
  isCollapsed = false,
  onToggleShowMore,
  onItemClick,
}) => {
  const renderItem = (item: SidebarNavItem) => {
    const isActive = activeFilter === item.id || (item.id === 'home' && activeFilter === 'all');
    return (
      <div
        key={item.id}
        onClick={() => onItemClick(item.id)}
        title={isCollapsed ? item.label : undefined}
        className={`flex items-center px-2 py-1.5 rounded-xl cursor-pointer transition-colors duration-150 font-medium text-xs sm:text-sm group ${
          isActive
            ? 'bg-blue-50 dark:bg-[#3a3b3c] text-[#2d88ff] font-semibold shadow-xs'
            : 'text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60'
        }`}
      >
        <div className="shrink-0 w-8 h-8 flex items-center justify-center">
          {item.iconNode}
        </div>
        <div
          className={`min-w-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ml-2.5 ${
            isCollapsed ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none' : 'max-w-[180px] opacity-100 translate-x-0'
          }`}
        >
          <span className="truncate block">{item.label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-0.5">
      {/* Primary Top Items */}
      {primaryItems.map(renderItem)}

      {/* Secondary Animated Items */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden space-y-0.5 ${
          showMore ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        {secondaryItems.map(renderItem)}
      </div>

      {/* See more / less button */}
      {secondaryItems.length > 0 && (
        <button
          onClick={onToggleShowMore}
          title={isCollapsed ? (showMore ? 'Ẩn bớt' : 'Xem thêm') : undefined}
          className="w-full flex items-center px-2 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 text-gray-800 dark:text-[#e4e6eb] text-xs sm:text-sm font-medium cursor-pointer transition-colors duration-150"
        >
          <div className="shrink-0 w-8 h-8 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center shrink-0 text-gray-700 dark:text-[#e4e6eb]">
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMore ? 'rotate-180' : ''}`} />
            </div>
          </div>
          <div
            className={`min-w-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ml-2.5 ${
              isCollapsed ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none' : 'max-w-[180px] opacity-100 translate-x-0'
            }`}
          >
            <span>{showMore ? 'Ẩn bớt' : 'Xem thêm'}</span>
          </div>
        </button>
      )}
    </div>
  );
};

