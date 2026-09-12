import React, { RefObject } from 'react';
import { Settings, Moon, Globe, LogOut } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';

interface HeaderUserDropdownProps {
  userMenuRef: RefObject<HTMLDivElement | null>;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowNotifMenu: (show: boolean) => void;
  setShowMsgMenu: (show: boolean) => void;
  user: any;
  theme: string;
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: 'vi' | 'en') => void;
  logout: () => void;
  t: (key: string) => string;
  onNavigateProfile?: (userId?: string) => void;
  onNavigateSettings?: () => void;
}

export const HeaderUserDropdown: React.FC<HeaderUserDropdownProps> = ({
  userMenuRef,
  showUserMenu,
  setShowUserMenu,
  setShowNotifMenu,
  setShowMsgMenu,
  user,
  theme,
  toggleTheme,
  language,
  setLanguage,
  logout,
  t,
  onNavigateProfile,
  onNavigateSettings,
}) => {
  return (
    <div ref={userMenuRef} className="relative pl-0.5">
      <button
        onClick={() => {
          setShowUserMenu((prev) => !prev);
          setShowNotifMenu(false);
          setShowMsgMenu(false);
        }}
        className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none cursor-pointer hover:ring-2 hover:ring-[#2d88ff]/40 transition overflow-hidden"
      >
        <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="md" />
      </button>

      {showUserMenu && (
        <div className="absolute right-0 top-12 w-[calc(100vw-1.5rem)] max-w-[18rem] sm:w-72 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl p-2.5 z-50 space-y-1">
          <div
            onClick={() => {
              if (onNavigateProfile) onNavigateProfile();
              setShowUserMenu(false);
            }}
            className="p-3 bg-gray-50 dark:bg-[#3a3b3c]/50 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl mb-1 flex items-center space-x-3 cursor-pointer transition group shadow-sm"
          >
            <UserAvatar src={user?.avatar} alt={user?.fullName} size="md" />
            <div className="min-w-0">
              <div className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb] truncate group-hover:underline">
                {user?.fullName || user?.username}
              </div>
              <div className="text-[11px] text-[#2d88ff] font-semibold">{t('userMenu.seeProfile')}</div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onNavigateSettings) onNavigateSettings();
              setShowUserMenu(false);
            }}
            className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#2d88ff]" />
            <span>{t('userMenu.settings')}</span>
          </button>

          <div className="flex items-center justify-between px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition">
            <span className="flex items-center space-x-2">
              <Moon className="w-4 h-4 text-purple-400" />
              <span>{t('userMenu.darkMode')}</span>
            </span>
            <button
              onClick={toggleTheme}
              className="px-2 py-1 bg-gray-200 dark:bg-[#4e4f50] rounded-md text-[11px] font-bold cursor-pointer"
            >
              {theme === 'dark' ? t('userMenu.on') : t('userMenu.off')}
            </button>
          </div>

          <div className="flex items-center justify-between px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition">
            <span className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>{t('userMenu.language')}</span>
            </span>
            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="px-2 py-1 bg-gray-200 dark:bg-[#4e4f50] rounded-md text-[11px] font-bold uppercase cursor-pointer"
            >
              {language.toUpperCase()}
            </button>
          </div>

          <hr className="my-1 border-gray-100 dark:border-[#393a3b]" />

          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>{t('logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
