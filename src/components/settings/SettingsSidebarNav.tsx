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
  const menuGroups = [
    {
      title: 'Trung tâm tài khoản',
      items: [
        { id: 'profile', label: 'Hồ sơ cá nhân', icon: <User className="w-[18px] h-[18px]" />, path: '/settings/profile' },
        { id: 'security', label: 'Mật khẩu và bảo mật', icon: <Lock className="w-[18px] h-[18px]" />, path: '/settings/security' },
      ],
    },
    {
      title: 'Tùy chọn',
      items: [
        { id: 'appearance', label: 'Giao diện & Ngôn ngữ', icon: <Sun className="w-[18px] h-[18px]" />, path: '/settings/appearance' },
        { id: 'notifications', label: 'Thông báo', icon: <Bell className="w-[18px] h-[18px]" />, path: '/settings/notifications' },
      ],
    },
    {
      title: 'Đối tượng và chế độ hiển thị',
      items: [
        { id: 'privacy', label: 'Quyền riêng tư của trang cá nhân', icon: <Shield className="w-[18px] h-[18px]" />, path: '/settings/privacy' },
      ],
    },
  ];

  return (
    <div className="w-full md:w-1/4 shrink-0 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-sm h-fit overflow-hidden transition-colors">
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Cài đặt</h2>
      </div>

      <div className="flex flex-col space-y-4 px-2 pb-4">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h3 className="px-3 text-[13px] font-bold text-gray-500 dark:text-[#b0b3b8] mb-2">{group.title}</h3>
            {group.items.map((tab) => {
              const isActive = activeSubTab === tab.id;
              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  onClick={() => onTabChange?.(tab.id as SettingsSubTab)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/80 dark:bg-[#3a3b3c] text-[#1877f2] dark:text-[#e4e6eb]'
                      : 'text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/80'
                  }`}
                >
                  <div className={`flex items-center justify-center ${isActive ? 'text-[#1877f2] dark:text-[#2d88ff]' : 'text-gray-500 dark:text-[#b0b3b8]'}`}>
                    {tab.icon}
                  </div>
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
