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
    <div className="max-w-[1280px] mx-auto py-6 px-3 sm:px-6 w-full">
      <div className="flex flex-col md:flex-row gap-6 h-full min-h-[82vh] items-start">
        {/* Settings Sidebar Navigation */}
        <SettingsSidebarNav activeSubTab={activeSubTab} onTabChange={handleTabChange} />

        {/* Content Details Panel with Sub-routes */}
        <div className="w-full md:flex-1 min-w-0 bg-white/80 dark:bg-[#242526]/80 backdrop-blur-md rounded-2xl p-5 sm:p-7 border border-gray-200/90 dark:border-[#393a3b] shadow-xs transition-colors">
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
