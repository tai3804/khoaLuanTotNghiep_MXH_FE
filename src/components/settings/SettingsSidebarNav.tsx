import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Lock, Shield, Sun, Bell } from 'lucide-react';

export type SettingsSubTab = 'profile' | 'security' | 'privacy' | 'appearance' | 'notifications';

interface SettingsSidebarNavProps {
  activeSubTab: SettingsSubTab;
  onTabChange?: (tab: SettingsSubTab) => void;
}

export const SettingsSidebarNav: React.FC<SettingsSidebarNavProps> = ({
  activeSubTab,
  onTabChange,
}) => {
  const tabs: { id: SettingsSubTab; label: string; icon: React.ReactNode; path: string }[] = [
    { id: 'profile', label: 'Hồ sơ cá nhân', icon: <User className="w-4 h-4" />, path: '/settings/profile' },
    { id: 'security', label: 'Thiết bị & Bảo mật (2FA)', icon: <Lock className="w-4 h-4" />, path: '/settings/security' },
    { id: 'privacy', label: 'Quyền riêng tư', icon: <Shield className="w-4 h-4" />, path: '/settings/privacy' },
    { id: 'appearance', label: 'Giao diện & Ngôn ngữ', icon: <Sun className="w-4 h-4" />, path: '/settings/appearance' },
    { id: 'notifications', label: 'Cài đặt thông báo', icon: <Bell className="w-4 h-4" />, path: '/settings/notifications' },
  ];

  return (
    <div className="md:col-span-1 bg-white dark:bg-[#242526] rounded-2xl p-2 border border-gray-200 dark:border-[#393a3b] shadow-sm h-fit space-y-1 transition-colors">
      {tabs.map((tab) => {
        const isActive = activeSubTab === tab.id;
        return (
          <NavLink
            key={tab.id}
            to={tab.path}
            onClick={() => onTabChange?.(tab.id)}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              isActive
                ? 'bg-[#1877f2] text-white shadow-sm'
                : 'text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
