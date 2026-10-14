import React from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { useSidebarLeftData } from './useSidebarLeftData';
import { SidebarLeftUserProfile } from './SidebarLeftUserProfile';
import { SidebarLeftNavList } from './SidebarLeftNavList';
import { SidebarLeftShortcuts } from './SidebarLeftShortcuts';

export interface SidebarLeftProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  onNavigateProfile?: () => void;
  onNavigateSettings?: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  activeFilter = 'all',
  onFilterChange,
  onNavigateProfile,
  onNavigateSettings,
}) => {
  const {
    user,
    isAuthenticated,
    showMore,
    isCollapsed,
    toggleCollapse,
    toggleShowMore,
    primaryItems,
    secondaryItems,
    handleItemClick,
  } = useSidebarLeftData({ activeFilter, onFilterChange, onNavigateSettings });

  return (
    <aside
      className={`sticky top-14 shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden hidden lg:block px-2 py-2.5 bg-transparent select-none transition-[width] duration-300 ease-in-out will-change-[width] ${
        isCollapsed
          ? 'w-[64px]'
          : 'w-[240px] xl:w-[260px] 2xl:w-[280px]'
      }`}
    >
      {/* Top Header Row with Toggle Button */}
      <div className="flex items-center justify-between px-1 mb-1.5 min-h-[28px]">
        <span
          className={`text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91] transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
            isCollapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-[100px] opacity-100 translate-x-0'
          }`}
        >
          Menu
        </span>
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          className="p-1.5 rounded-lg hover:bg-gray-200/70 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-[#b0b3b8] transition cursor-pointer shrink-0"
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      <SidebarLeftUserProfile
        isAuthenticated={isAuthenticated}
        user={user}
        isCollapsed={isCollapsed}
        onNavigateProfile={onNavigateProfile}
      />

      <SidebarLeftNavList
        primaryItems={primaryItems}
        secondaryItems={secondaryItems}
        activeFilter={activeFilter}
        showMore={showMore}
        isCollapsed={isCollapsed}
        onToggleShowMore={toggleShowMore}
        onItemClick={handleItemClick}
      />

      {!isCollapsed && (
        <>
          <hr className="my-2 border-gray-200 dark:border-[#393a3b] mx-1" />
          <SidebarLeftShortcuts isCollapsed={isCollapsed} onFilterChange={onFilterChange} />
        </>
      )}
    </aside>
  );
};
