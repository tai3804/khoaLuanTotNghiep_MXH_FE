import React, { useState } from 'react';
import {
  Search,
  Home,
  Tv,
  Store,
  Users,
  Gamepad2,
  Bell,
  MessageCircle,
  Sun,
  Moon,
  Globe,
  LogOut,
  LogIn,
  Settings,
} from 'lucide-react';
import { Logo } from './Logo';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ChatUser } from './ChatBox';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSelectChatUser?: (user: ChatUser) => void;
  onNavigateSettings?: () => void;
  onNavigateAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'home',
  onTabChange,
  onSelectChatUser,
  onNavigateSettings,
  onNavigateAuth,
}) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNavClick = (tab: string) => {
    if (onTabChange) onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors duration-200">
      {/* New Brand Logo & Search */}
      <div className="flex items-center space-x-4 shrink-0">
        {/* Click Logo or Text to go Home */}
        <Logo onClick={() => handleNavClick('home')} />

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('nav.search') || 'Tìm kiếm...'}
            className="w-48 md:w-60 pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-slate-700 dark:text-slate-100 text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <nav className="hidden md:flex items-center justify-center space-x-1 lg:space-x-4 h-full flex-1">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex items-center justify-center w-16 lg:w-20 h-full transition border-b-4 ${
            activeTab === 'home'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 border-transparent dark:text-slate-400 rounded-lg'
          }`}
          title={t('nav.home') || 'Trang chủ'}
        >
          <Home className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleNavClick('watch')}
          className={`flex items-center justify-center w-16 lg:w-20 h-full transition border-b-4 ${
            activeTab === 'watch'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 border-transparent dark:text-slate-400 rounded-lg'
          }`}
          title={t('nav.watch') || 'Watch'}
        >
          <Tv className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleNavClick('marketplace')}
          className={`flex items-center justify-center w-16 lg:w-20 h-full transition border-b-4 ${
            activeTab === 'marketplace'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 border-transparent dark:text-slate-400 rounded-lg'
          }`}
          title={t('nav.marketplace') || 'Marketplace'}
        >
          <Store className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleNavClick('groups')}
          className={`flex items-center justify-center w-16 lg:w-20 h-full transition border-b-4 ${
            activeTab === 'groups'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 border-transparent dark:text-slate-400 rounded-lg'
          }`}
          title={t('nav.groups') || 'Nhóm'}
        >
          <Users className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleNavClick('gaming')}
          className={`flex items-center justify-center w-16 lg:w-20 h-full transition border-b-4 ${
            activeTab === 'gaming'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 border-transparent dark:text-slate-400 rounded-lg'
          }`}
          title={t('nav.gaming') || 'Gaming'}
        >
          <Gamepad2 className="w-6 h-6" />
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Settings gear icon button */}
        <button
          onClick={() => {
            if (onNavigateSettings) onNavigateSettings();
          }}
          className={`w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition ${
            activeTab === 'settings' ? 'bg-blue-100 text-blue-600 dark:bg-slate-700 dark:text-blue-400' : 'text-gray-600 dark:text-slate-300'
          }`}
          title="Cài đặt hệ thống"
        >
          <Settings className="w-5 h-5" />
        </button>

        {/* Language switch button with fixed width w-14 */}
        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          className="w-14 h-9 flex items-center justify-center space-x-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
          title="Đổi Ngôn Ngữ"
        >
          <Globe className="w-4 h-4 text-blue-500" />
          <span className="uppercase font-bold">{language}</span>
        </button>

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 transition cursor-pointer"
          title="Chế độ Sáng / Tối"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {isAuthenticated ? (
          <>
            {/* Messenger button */}
            <button
              onClick={() => {
                setShowMsgMenu(!showMsgMenu);
                setShowNotifMenu(false);
                setShowUserMenu(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              title="Tin nhắn"
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            {/* Notification button */}
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowMsgMenu(false);
                setShowUserMenu(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile Avatar & User Dropdown */}
            <div className="relative pl-1">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifMenu(false);
                  setShowMsgMenu(false);
                }}
                className="flex items-center space-x-2 focus:outline-none cursor-pointer"
              >
                <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="sm" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-64 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl mb-1 flex items-center space-x-3">
                    <UserAvatar src={user?.avatar} alt={user?.fullName} size="md" />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-gray-900 dark:text-slate-100 truncate">
                        {user?.fullName || user?.username}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate">{user?.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onNavigateSettings) onNavigateSettings();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
                  >
                    <Settings className="w-4 h-4 text-blue-500" />
                    <span>Cài đặt tài khoản & riêng tư</span>
                  </button>

                  <hr className="my-1 border-gray-100 dark:border-slate-700" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-xl text-xs font-semibold transition"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => {
              if (onNavigateAuth) onNavigateAuth();
              else openLoginModal();
            }}
            className="w-32 h-9 flex items-center justify-center space-x-1.5 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition cursor-pointer shrink-0"
          >
            <LogIn className="w-4 h-4" />
            <span>{t('login') || 'Đăng nhập'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
