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
  LayoutGrid,
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
    <header className="sticky top-0 z-50 flex items-center justify-between h-14 px-4 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shadow-sm transition-colors duration-200">
      {/* Brand Logo & Search */}
      <div className="flex items-center space-x-3 shrink-0">
        <Logo onClick={() => handleNavClick('home')} size="sm" />

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 dark:text-[#b0b3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('nav.search') || 'Tìm kiếm trên KLTN Social...'}
            className="w-48 md:w-60 pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#2d88ff] transition"
          />
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <nav className="hidden md:flex items-center justify-center space-x-1 lg:space-x-2 h-full flex-1 max-w-2xl mx-auto">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex items-center justify-center w-24 lg:w-28 h-full transition ${
            activeTab === 'home'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title="Trang chủ"
        >
          <Home className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleNavClick('watch')}
          className={`flex items-center justify-center w-24 lg:w-28 h-full transition ${
            activeTab === 'watch'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title="Watch"
        >
          <Tv className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleNavClick('marketplace')}
          className={`flex items-center justify-center w-24 lg:w-28 h-full transition ${
            activeTab === 'marketplace'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title="Marketplace"
        >
          <Store className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleNavClick('friends')}
          className={`relative flex items-center justify-center w-24 lg:w-28 h-full transition ${
            activeTab === 'friends' || activeTab === 'groups'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title="Bạn bè & Nhóm"
        >
          <Users className="w-6 h-6" />
          {pendingReqCount > 0 && (
            <span className="absolute top-2 right-4 lg:right-6 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
              {pendingReqCount}
            </span>
          )}
        </button>
        <button
          onClick={() => handleNavClick('gaming')}
          className={`flex items-center justify-center w-24 lg:w-28 h-full transition ${
            activeTab === 'gaming'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title="Chơi game"
        >
          <Gamepad2 className="w-6 h-6" />
        </button>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Menu (Grid) icon */}
        <button
          onClick={() => {
            if (onNavigateSettings) onNavigateSettings();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
          title="Menu"
        >
          <LayoutGrid className="w-5 h-5" />
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
                className={`w-10 h-10 flex items-center justify-center rounded-full transition cursor-pointer ${
                  showMsgMenu
                    ? 'bg-[#2d88ff]/20 text-[#2d88ff]'
                    : 'bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb]'
                }`}
                title="Messenger"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              {showMsgMenu && (
                <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl p-3 z-50 space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">Đoạn chat</h4>
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
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Profile Avatar & User Dropdown */}
            <div className="relative pl-0.5">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifMenu(false);
                  setShowMsgMenu(false);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none cursor-pointer hover:ring-2 hover:ring-[#2d88ff]/40 transition overflow-hidden"
              >
                <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="md" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-12 w-72 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl p-2.5 z-50 space-y-1">
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
                      <div className="text-[11px] text-[#2d88ff] font-semibold">Xem trang cá nhân của bạn</div>
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
                    <span>Cài đặt & quyền riêng tư</span>
                  </button>

                  <div className="flex items-center justify-between px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition">
                    <span className="flex items-center space-x-2">
                      <Moon className="w-4 h-4 text-purple-400" />
                      <span>Chế độ tối (Dark Mode)</span>
                    </span>
                    <button
                      onClick={toggleTheme}
                      className="px-2 py-1 bg-gray-200 dark:bg-[#4e4f50] rounded-md text-[11px] font-bold cursor-pointer"
                    >
                      {theme === 'dark' ? 'Bật' : 'Tắt'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition">
                    <span className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span>Ngôn ngữ</span>
                    </span>
                    <button
                      onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                      className="px-2 py-1 bg-gray-200 dark:bg-[#4e4f50] rounded-md text-[11px] font-bold uppercase cursor-pointer"
                    >
                      {language}
                    </button>
                  </div>

                  <hr className="my-1 border-gray-100 dark:border-[#393a3b]" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-xl text-xs font-semibold transition cursor-pointer"
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
