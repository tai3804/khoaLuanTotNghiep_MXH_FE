import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SettingsSidebarNav, SettingsSubTab } from './SettingsSidebarNav';
import { ProfileSettingsTab } from './ProfileSettingsTab';
import { SecuritySettingsTab } from './SecuritySettingsTab';
import { PrivacySettingsTab } from './PrivacySettingsTab';
import { AppearanceSettingsTab } from './AppearanceSettingsTab';
import { NotificationSettingsTab } from './NotificationSettingsTab';

export const SettingsView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active sub-tab based on URL path
  const path = location.pathname;
  let activeSubTab: SettingsSubTab = 'profile';
  if (path.includes('/security')) activeSubTab = 'security';
  else if (path.includes('/privacy')) activeSubTab = 'privacy';
  else if (path.includes('/appearance')) activeSubTab = 'appearance';
  else if (path.includes('/notifications')) activeSubTab = 'notifications';

  const handleTabChange = (tab: SettingsSubTab) => {
    navigate(`/settings/${tab}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Settings Header */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-[#393a3b] mb-5 flex items-center justify-between transition-colors">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center space-x-2">
            <span>⚙️</span>
            <span>Cài Đặt Hệ Thống & Tài Khoản</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
            Quản lý thông tin cá nhân, quyền riêng tư, thiết bị đăng nhập và bảo mật tài khoản.
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-[#1877f2]/20 text-[#1877f2] dark:text-[#4599ff] font-bold text-xs">
          Phiên bản KLTN 2026
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Settings Sidebar Navigation */}
        <SettingsSidebarNav activeSubTab={activeSubTab} onTabChange={handleTabChange} />

        {/* Content Details Panel with Sub-routes */}
        <div className="md:col-span-3 bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-200 dark:border-[#393a3b] shadow-sm transition-colors">
          <Routes>
            <Route index element={<ProfileSettingsTab />} />
            <Route path="profile" element={<ProfileSettingsTab />} />
            <Route path="security" element={<SecuritySettingsTab />} />
            <Route path="privacy" element={<PrivacySettingsTab />} />
            <Route path="appearance" element={<AppearanceSettingsTab />} />
            <Route path="notifications" element={<NotificationSettingsTab />} />
            <Route path="*" element={<Navigate to="/settings/profile" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
