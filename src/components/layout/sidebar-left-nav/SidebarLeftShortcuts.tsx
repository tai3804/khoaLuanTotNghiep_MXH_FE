import React from 'react';
import { Compass } from 'lucide-react';

interface SidebarLeftShortcutsProps {
  isCollapsed?: boolean;
  onFilterChange?: (filter: string) => void;
}

export const SidebarLeftShortcuts: React.FC<SidebarLeftShortcutsProps> = ({ isCollapsed = false, onFilterChange }) => {
  return (
    <div>
      <div className="px-2 mb-1 overflow-hidden min-h-[16px]">
        <span
          className={`text-xs font-semibold text-gray-500 dark:text-[#b0b3b8] transition-all duration-300 ease-in-out block whitespace-nowrap overflow-hidden ${
            isCollapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-[180px] opacity-100 translate-x-0'
          }`}
        >
          Lối tắt của bạn
        </span>
      </div>

      <div className="space-y-0.5">
        <button
          onClick={() => onFilterChange && onFilterChange('groups')}
          title={isCollapsed ? 'Khám phá nhóm & cộng đồng' : undefined}
          className="w-full flex items-center px-2 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 text-[#2d88ff] text-xs font-semibold cursor-pointer transition-colors duration-150 group"
        >
          <div className="shrink-0 w-8 h-8 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#2d88ff]/20 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-[#2d88ff]" />
            </div>
          </div>
          <div
            className={`min-w-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ml-2.5 ${
              isCollapsed ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none' : 'max-w-[180px] opacity-100 translate-x-0'
            }`}
          >
            <span className="truncate block">Khám phá nhóm & cộng đồng</span>
          </div>
        </button>
      </div>
    </div>
  );
};
