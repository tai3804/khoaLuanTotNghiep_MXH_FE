import React, { useState, useEffect, useRef } from 'react';
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
import { Logo } from '../common/Logo';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { NotificationDropdown } from '../notification/NotificationDropdown';
import { ChatUser } from '../chat/ChatBox';
import { userService, postService } from '../../services/api';


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
  const { unreadCount } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: any[]; posts: any[] }>({ users: [], posts: [] });
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showMsgMenu, setShowMsgMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chatContacts, setChatContacts] = useState<ChatUser[]>([]);
  const [loadingChatContacts, setLoadingChatContacts] = useState(false);
  const [msgSearch, setMsgSearch] = useState('');
  const [pendingReqCount, setPendingReqCount] = useState(0);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const msgMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (msgMenuRef.current && !msgMenuRef.current.contains(target)) {
        setShowMsgMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchResults(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setShowNotifMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ users: [], posts: [] });
      setShowSearchResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      setShowSearchResults(true);
      try {
        const [users, posts] = await Promise.all([
          userService.searchUsers(searchQuery.trim()).catch(() => []),
          postService.searchPosts ? postService.searchPosts(searchQuery.trim()).catch(() => []) : Promise.resolve([]),
        ]);
        setSearchResults({
          users: Array.isArray(users) ? users : [],
          posts: Array.isArray(posts) ? posts : [],
        });
      } catch {
        setSearchResults({ users: [], posts: [] });
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between h-14 px-4 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shadow-sm transition-colors duration-200">
      {/* Brand Logo & Search */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <Logo onClick={() => handleNavClick('home')} size="sm" />

        <div ref={searchRef} className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500 dark:text-[#b0b3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            placeholder={t('nav.search') || 'Tìm kiếm...'}
            className="w-24 xs:w-32 sm:w-40 md:w-44 lg:w-60 pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#2d88ff] transition"
          />

          {/* Search Dropdown Popover */}
          {showSearchResults && (
            <div className="absolute top-12 left-0 w-72 sm:w-80 md:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-gray-100 dark:border-[#393a3b] flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider">{t('search.results')}</span>
                <button
                  onClick={() => setShowSearchResults(false)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  {t('search.close')}
                </button>
              </div>

              {searching ? (
                <div className="py-6 text-center text-xs text-gray-400 dark:text-[#b0b3b8] flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin" />
                  <span>{t('search.searching')}</span>
                </div>
              ) : searchResults.users.length === 0 && searchResults.posts.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 dark:text-[#b0b3b8]">{t('search.noResults')}</div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-[#393a3b]">
                  {/* Users results */}
                  {searchResults.users.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-2 text-[11px] font-bold text-[#1877f2] dark:text-[#2d88ff]">{t('search.people')}</div>
                      {searchResults.users.map((u: any) => {
                        const uid = String(u.userId || u.id);
                        const name = [u.lastName, u.middleName, u.firstName].filter(Boolean).join(' ').trim() || u.fullName || u.username || (language === 'en' ? 'User' : 'Người dùng');
                        const avatar = u.avatarUrl || u.avatar || '/default-avatar.png';

                        return (
                          <div
                            key={uid}
                            onClick={() => {
                              setShowSearchResults(false);
                              if (onNavigateProfile) onNavigateProfile(uid);
                            }}
                            className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition"
                          >
                            <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb] truncate">{name}</p>
                              <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] truncate">@{u.username || 'user'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Posts results */}
                  {searchResults.posts.length > 0 && (
                    <div className="p-2 space-y-1">
                      <div className="px-2 text-[11px] font-bold text-[#1877f2] dark:text-[#2d88ff]">{t('search.posts')}</div>
                      {searchResults.posts.map((p: any) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setShowSearchResults(false);
                            if (onTabChange) onTabChange('home');
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition"
                        >
                          <p className="text-xs font-medium text-gray-800 dark:text-[#e4e6eb] line-clamp-2">{p.content}</p>
                          <p className="text-[10px] text-gray-400 dark:text-[#b0b3b8] mt-1">{p.authorName || (language === 'en' ? 'Member' : 'Thành viên')} • {p.createdAt || (language === 'en' ? 'Just now' : 'Vừa xong')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation - Fully Adaptive for md/lg/xl screens */}
      <nav className="hidden md:flex items-center justify-center space-x-0.5 lg:space-x-1 xl:space-x-2 h-full flex-1 max-w-xl lg:max-w-2xl mx-2">
        <button
          onClick={() => handleNavClick('home')}
          className={`flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
            activeTab === 'home'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title={t('nav.home')}
        >
          <Home className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
        <button
          onClick={() => handleNavClick('watch')}
          className={`flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
            activeTab === 'watch'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title={t('nav.watch')}
        >
          <Tv className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
        <button
          onClick={() => handleNavClick('marketplace')}
          className={`flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
            activeTab === 'marketplace'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title={t('nav.marketplace')}
        >
          <Store className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
        <button
          onClick={() => handleNavClick('friends')}
          className={`relative flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
            activeTab === 'friends' || activeTab === 'groups'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title={language === 'en' ? 'Friends & Groups' : 'Bạn bè & Nhóm'}
        >
          <Users className="w-5 h-5 lg:w-6 lg:h-6" />
          {pendingReqCount > 0 && (
            <span className="absolute top-2 right-1 sm:right-2 lg:right-6 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm animate-pulse">
              {pendingReqCount}
            </span>
          )}
        </button>
        <button
          onClick={() => handleNavClick('gaming')}
          className={`flex items-center justify-center w-12 md:w-14 lg:w-24 xl:w-28 h-full transition ${
            activeTab === 'gaming'
              ? 'text-[#2d88ff] border-b-[3px] border-[#2d88ff]'
              : 'text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/60 border-b-[3px] border-transparent rounded-lg h-12 my-1'
          }`}
          title={t('nav.gaming')}
        >
          <Gamepad2 className="w-5 h-5 lg:w-6 lg:h-6" />
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
            <div ref={msgMenuRef} className="relative">
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
                <div className="absolute right-0 top-12 w-[calc(100vw-1.5rem)] max-w-sm sm:w-96 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl p-3 z-50 space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">{t('messenger.chats')}</h4>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">
                      {t('messenger.markRead')}
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={msgSearch}
                      onChange={(e) => setMsgSearch(e.target.value)}
                      placeholder={t('messenger.search')}
                      className="w-full bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-full text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {loadingChatContacts ? (
                      <div className="py-8 text-center text-xs text-gray-400">{t('messenger.loading')}</div>
                    ) : chatContacts.filter(c => !msgSearch || c.name.toLowerCase().includes(msgSearch.toLowerCase())).length === 0 ? (
                      <div className="py-8 px-4 text-center space-y-2">
                        <MessageCircle className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto" />
                        <p className="text-xs font-semibold text-gray-700 dark:text-slate-300">{t('messenger.noFriends')}</p>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500">
                          {t('messenger.noFriendsSub')}
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
                              <div className="text-[11px] text-gray-400 truncate">{t('messenger.clickToChat')}</div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notification button */}
            <div ref={notifMenuRef} className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowMsgMenu(false);
                  setShowUserMenu(false);
                }}
                className={`relative w-10 h-10 flex items-center justify-center rounded-full transition cursor-pointer ${
                  showNotifMenu
                    ? 'bg-[#2d88ff]/20 text-[#2d88ff]'
                    : 'bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb]'
                }`}
                title={language === 'en' ? 'Notifications' : 'Thông báo'}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full shadow-sm animate-pulse min-w-4 text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <NotificationDropdown
                  onClose={() => setShowNotifMenu(false)}
                  onNavigateSettings={onNavigateSettings}
                  onNavigateTarget={(url) => {
                    if (url.startsWith('/profile') && onNavigateProfile) {
                      const uid = url.split('/profile/')[1];
                      onNavigateProfile(uid);
                    } else if (url.startsWith('/posts')) {
                      if (onTabChange) onTabChange('home');
                      const postId = url.split('/posts/')[1];
                      if (postId) {
                        setTimeout(() => {
                          const el = document.getElementById(`post-${postId}`) || document.getElementById(postId);
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            el.classList.add('ring-2', 'ring-[#1877f2]', 'transition-all');
                            setTimeout(() => el.classList.remove('ring-2', 'ring-[#1877f2]'), 3000);
                          }
                        }, 300);
                      }
                    }
                  }}
                />
              )}
            </div>

            {/* Profile Avatar & User Dropdown */}
            <div ref={userMenuRef} className="relative pl-0.5">
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
