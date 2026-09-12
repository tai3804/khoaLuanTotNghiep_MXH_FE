import React from 'react';
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
    setShowMore,
    displayedItems,
    handleItemClick,
  } = useSidebarLeftData({ activeFilter, onFilterChange, onNavigateSettings });

  return (
    <aside className="w-[300px] xl:w-[340px] 2xl:w-[360px] sticky top-14 shrink-0 h-[calc(100vh-3.5rem)] overflow-y-auto hidden lg:block px-2 py-3 bg-transparent select-none">
      <SidebarLeftUserProfile
        isAuthenticated={isAuthenticated}
        user={user}
        onNavigateProfile={onNavigateProfile}
      />

      <SidebarLeftNavList
        displayedItems={displayedItems}
        activeFilter={activeFilter}
        showMore={showMore}
        setShowMore={setShowMore}
        onItemClick={handleItemClick}
      />

      <hr className="my-2.5 border-gray-200 dark:border-[#393a3b] mx-2" />

      <SidebarLeftShortcuts onFilterChange={onFilterChange} />
    </aside>
  );
};
