import React, { useState, useEffect } from 'react';
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
import { userService } from '../services/api';

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onSelectChatUser?: (user: ChatUser) => void;
  onNavigateSettings?: () => void;
  onNavigateProfile?: (userId?: string) => void;
  onNavigateAuth?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'home',
  onTabChange,
  onSelectChatUser,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
}) => {
  const { user, isAuthenticated, logout, openLoginModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chatContacts, setChatContacts] = useState<ChatUser[]>([]);
  const [loadingChatContacts, setLoadingChatContacts] = useState(false);
  const [msgSearch, setMsgSearch] = useState('');
  const [pendingReqCount, setPendingReqCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchPending = async () => {
      try {
        const reqs = await userService.getPendingRequests();
        setPendingReqCount(Array.isArray(reqs) ? reqs.length : 0);
      } catch {}
    };

    fetchPending();
    const timer = setInterval(fetchPending, 4000);
    const handleFriendUpdate = () => fetchPending();
    window.addEventListener('friend_status_updated', handleFriendUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener('friend_status_updated', handleFriendUpdate);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (showMsgMenu && isAuthenticated) {
      setLoadingChatContacts(true);
      userService
        .getFriends()
        .then((friends) => {
          setChatContacts(Array.isArray(friends) ? friends : []);
        })
        .catch(() => {
          setChatContacts([]);
        })
        .finally(() => setLoadingChatContacts(false));
    }
  }, [showMsgMenu, isAuthenticated]);

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
          className={`relative flex items-center justify-center w-16 lg:w-20 h-full transition border-b-4 ${
            activeTab === 'groups'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 border-transparent dark:text-slate-400 rounded-lg'
          }`}
          title={t('nav.groups') || 'Bạn bè & Nhóm'}
        >
          <Users className="w-6 h-6" />
          {pendingReqCount > 0 && (
            <span className="absolute top-2 right-3 lg:right-5 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
              {pendingReqCount}
            </span>
          )}
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
            {/* Messenger button & dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMsgMenu(!showMsgMenu);
                  setShowNotifMenu(false);
                  setShowUserMenu(false);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition cursor-pointer ${
                  showMsgMenu
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
                title="Tin nhắn"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {showMsgMenu && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-slate-100">Đoạn chat</h4>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
                      Đánh dấu đã đọc
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={msgSearch}
                      onChange={(e) => setMsgSearch(e.target.value)}
                      placeholder="Tìm kiếm trên Messenger..."
                      className="w-full bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {loadingChatContacts ? (
                      <div className="py-8 text-center text-xs text-gray-400">Đang tải cuộc trò chuyện...</div>
                    ) : chatContacts.filter(c => !msgSearch || c.name.toLowerCase().includes(msgSearch.toLowerCase())).length === 0 ? (
                      <div className="py-8 px-4 text-center space-y-2">
                        <MessageCircle className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto" />
                        <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">Chưa có bạn bè để trò chuyện</p>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500">
                          Kết bạn với người dùng khác để bắt đầu nhắn tin qua Messenger!
                        </p>
                      </div>
                    ) : (
                      chatContacts
                        .filter(c => !msgSearch || c.name.toLowerCase().includes(msgSearch.toLowerCase()))
                        .map((contact) => (
                          <div
                            key={contact.id}
                            onClick={() => {
                              if (onSelectChatUser) {
                                onSelectChatUser({
                                  ...contact,
                                  id: contact.userId || contact.id,
                                  userId: contact.userId || contact.id,
                                });
                              }
                              setShowMsgMenu(false);
                            }}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-700/60 rounded-xl cursor-pointer transition group"
                          >
                            <div className="relative shrink-0">
                              <UserAvatar src={contact.avatar} alt={contact.name} size="md" />
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-gray-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition">
                                {contact.name}
                              </div>
                              <div className="text-[11px] text-gray-400 truncate">Nhấn để nhắn tin ngay 👋</div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
                  <div
                    onClick={() => {
                      if (onNavigateProfile) onNavigateProfile();
                      setShowUserMenu(false);
                    }}
                    className="p-3 bg-gray-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl mb-1 flex items-center space-x-3 cursor-pointer transition group"
                  >
                    <UserAvatar src={user?.avatar} alt={user?.fullName} size="md" />
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-gray-900 dark:text-slate-100 truncate group-hover:underline group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {user?.fullName || user?.username}
                      </div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Xem trang cá nhân của bạn</div>
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
