import React from 'react';
import { UserAvatar } from '../../common/UserAvatar';

interface SidebarLeftUserProfileProps {
  isAuthenticated: boolean;
  user: any;
  onNavigateProfile?: () => void;
}

export const SidebarLeftUserProfile: React.FC<SidebarLeftUserProfileProps> = ({
  isAuthenticated,
  user,
  onNavigateProfile,
}) => {
  if (!isAuthenticated || !user) return null;

  return (
    <div
      onClick={onNavigateProfile}
      className="flex items-center space-x-3 px-2.5 py-2 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 cursor-pointer transition mb-1 group"
    >
      <UserAvatar src={user.avatar} alt={user.fullName || user.username} size="md" className="w-9 h-9 rounded-full" />
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-sm text-gray-900 dark:text-[#e4e6eb] truncate block">
          {user.fullName || user.username || 'Người dùng'}
        </span>
      </div>
    </div>
  );
};
