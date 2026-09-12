import React from 'react';
import { Compass } from 'lucide-react';

interface SidebarLeftShortcutsProps {
  onFilterChange?: (filter: string) => void;
}

export const SidebarLeftShortcuts: React.FC<SidebarLeftShortcutsProps> = ({ onFilterChange }) => {
  return (
    <div>
      <div className="flex items-center justify-between px-2.5 mb-1.5">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-[#b0b3b8]">
          Lối tắt của bạn
        </h4>
      </div>

      <div className="space-y-0.5">
        <button
          onClick={() => onFilterChange && onFilterChange('groups')}
          className="w-full flex items-center space-x-3 px-2.5 py-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 text-[#2d88ff] text-xs font-semibold cursor-pointer transition"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-[#2d88ff]/20 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-[#2d88ff]" />
          </div>
          <span>Khám phá nhóm & cộng đồng</span>
        </button>
      </div>
    </div>
  );
};
