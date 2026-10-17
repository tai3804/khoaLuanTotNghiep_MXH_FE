import React, { useState, useEffect } from 'react';
import { Home, Tv, Users, UsersRound, User as UserIcon } from 'lucide-react';
import { userService } from '../../services/api';

interface MobileBottomNavProps {
  activeNavTab: string;
  onTabChange: (tab: string) => void;
  user?: any;
  onViewProfile?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeNavTab,
  onTabChange,
  user,
  onViewProfile,
}) => {
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    const fetchRequests = async () => {
      try {
        const reqs = await userService.getPendingRequests();
        if (mounted && Array.isArray(reqs)) {
          setPendingCount(reqs.length);
        }
      } catch {}
    };

    fetchRequests();

    const handleUpdate = () => fetchRequests();
    window.addEventListener('friend_status_updated', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('friend_status_updated', handleUpdate);
    };
  }, []);

  const navItems = [
    {
      id: 'home',
      label: 'Bảng tin',
      icon: Home,
      action: () => onTabChange('home'),
    },
    {
      id: 'watch',
      label: 'Watch',
      icon: Tv,
      action: () => onTabChange('watch'),
    },
    {
      id: 'friends',
      label: 'Bạn bè',
      icon: Users,
      badge: pendingCount > 0 ? pendingCount : undefined,
      action: () => onTabChange('friends'),
    },
    {
      id: 'groups',
      label: 'Nhóm',
      icon: UsersRound,
      action: () => onTabChange('groups'),
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 h-14 bg-white/90 dark:bg-[#242526]/90 backdrop-blur-md border-t border-gray-200/80 dark:border-[#393a3b] flex items-center justify-around md:hidden z-40 shadow-lg px-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeNavTab === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.action}
            className={`relative flex flex-col items-center justify-center w-14 h-full transition-all duration-150 cursor-pointer active:scale-90 ${
              isActive
                ? 'text-[#1877f2] font-bold'
                : 'text-gray-500 dark:text-[#b0b3b8] hover:text-gray-700 dark:hover:text-[#e4e6eb]'
            }`}
          >
            {/* Active top accent bar */}
            {isActive && (
              <span className="absolute top-0 inset-x-2 h-[2.5px] bg-[#1877f2] rounded-b-full shadow-xs" />
            )}

            <div className="relative">
              <Icon className="w-5 h-5 transition-transform" />
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs animate-pulse">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* User Profile tab button */}
      <button
        type="button"
        onClick={() => {
          if (onViewProfile) onViewProfile();
          else onTabChange('profile');
        }}
        className={`relative flex flex-col items-center justify-center w-14 h-full transition-all duration-150 cursor-pointer active:scale-90 ${
          activeNavTab === 'profile'
            ? 'text-[#1877f2] font-bold'
            : 'text-gray-500 dark:text-[#b0b3b8] hover:text-gray-700 dark:hover:text-[#e4e6eb]'
        }`}
      >
        {activeNavTab === 'profile' && (
          <span className="absolute top-0 inset-x-2 h-[2.5px] bg-[#1877f2] rounded-b-full shadow-xs" />
        )}

        {user?.avatar || user?.avatarUrl ? (
          <img
            src={user.avatar || user.avatarUrl}
            alt={user.name || 'Profile'}
            className={`w-5 h-5 rounded-full object-cover border ${
              activeNavTab === 'profile'
                ? 'border-[#1877f2] ring-1 ring-[#1877f2]'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          />
        ) : (
          <UserIcon className="w-5 h-5" />
        )}
        <span className="text-[10px] tracking-tight mt-0.5">Tôi</span>
      </button>
    </nav>
  );
};
