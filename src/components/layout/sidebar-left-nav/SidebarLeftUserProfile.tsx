import React from 'react';
import { UserAvatar } from '../../common/UserAvatar';

interface SidebarLeftUserProfileProps {
  isAuthenticated: boolean;
  user: any;
  isCollapsed?: boolean;
  onNavigateProfile?: () => void;
}

export const SidebarLeftUserProfile: React.FC<SidebarLeftUserProfileProps> = ({
  isAuthenticated,
  user,
  isCollapsed = false,
  onNavigateProfile,
}) => {
  if (!isAuthenticated || !user) return null;

  const displayName = user.fullName || user.username || 'Người dùng';

  return (
    <div
      onClick={onNavigateProfile}
      title={isCollapsed ? displayName : undefined}
      className="flex items-center px-2 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition-colors duration-150 mb-1 group"
    >
      <div className="shrink-0 w-8 h-8 flex items-center justify-center">
        <UserAvatar src={user.avatar} alt={displayName} size="md" className="w-8 h-8 rounded-full" />
      </div>
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ml-2.5 ${
          isCollapsed ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none' : 'max-w-[180px] opacity-100 translate-x-0'
        }`}
      >
        <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] truncate block">
          {displayName}
        </span>
      </div>
    </div>
  );
};
