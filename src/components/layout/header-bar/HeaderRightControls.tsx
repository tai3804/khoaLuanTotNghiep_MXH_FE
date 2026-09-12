import React, { RefObject } from 'react';
import { LayoutGrid, Bell, LogIn } from 'lucide-react';
import { NotificationDropdown } from '../../notification/NotificationDropdown';
import { HeaderMessengerDropdown } from './HeaderMessengerDropdown';
import { HeaderUserDropdown } from './HeaderUserDropdown';
import { ChatUser } from '../../chat/ChatBox';

interface HeaderRightControlsProps {
  isAuthenticated: boolean;
  user: any;
  unreadCount: number;
  showNotifMenu: boolean;
  setShowNotifMenu: (show: boolean | ((prev: boolean) => boolean)) => void;
  showMsgMenu: boolean;
  setShowMsgMenu: (show: boolean | ((prev: boolean) => boolean)) => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean | ((prev: boolean) => boolean)) => void;
  notifMenuRef: RefObject<HTMLDivElement | null>;
  msgMenuRef: RefObject<HTMLDivElement | null>;
  userMenuRef: RefObject<HTMLDivElement | null>;
  msgSearch: string;
  setMsgSearch: (query: string) => void;
  chatContacts: ChatUser[];
  loadingChatContacts: boolean;
  theme: string;
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: 'vi' | 'en') => void;
  logout: () => void;
  openLoginModal: () => void;
  t: (key: string) => string;
  onSelectChatUser?: (user: ChatUser) => void;
  onNavigateSettings?: () => void;
  onNavigateProfile?: (userId?: string) => void;
  onNavigateAuth?: () => void;
  onTabChange?: (tab: string) => void;
}

export const HeaderRightControls: React.FC<HeaderRightControlsProps> = ({
  isAuthenticated,
  user,
  unreadCount,
  showNotifMenu,
  setShowNotifMenu,
  showMsgMenu,
  setShowMsgMenu,
  showUserMenu,
  setShowUserMenu,
  notifMenuRef,
  msgMenuRef,
  userMenuRef,
  msgSearch,
  setMsgSearch,
  chatContacts,
  loadingChatContacts,
  theme,
  toggleTheme,
  language,
  setLanguage,
  logout,
  openLoginModal,
  t,
  onSelectChatUser,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
  onTabChange,
}) => {
  return (
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
          <HeaderMessengerDropdown
            msgMenuRef={msgMenuRef}
            showMsgMenu={showMsgMenu}
            setShowMsgMenu={setShowMsgMenu}
            setShowNotifMenu={setShowNotifMenu}
            setShowUserMenu={setShowUserMenu}
            msgSearch={msgSearch}
            setMsgSearch={setMsgSearch}
            chatContacts={chatContacts}
            loadingChatContacts={loadingChatContacts}
            t={t}
            onSelectChatUser={onSelectChatUser}
          />

          {/* Notification button */}
          <div ref={notifMenuRef} className="relative">
            <button
              onClick={() => {
                setShowNotifMenu((prev) => !prev);
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
          <HeaderUserDropdown
            userMenuRef={userMenuRef}
            showUserMenu={showUserMenu}
            setShowUserMenu={setShowUserMenu}
            setShowNotifMenu={setShowNotifMenu}
            setShowMsgMenu={setShowMsgMenu}
            user={user}
            theme={theme}
            toggleTheme={toggleTheme}
            language={language}
            setLanguage={setLanguage}
            logout={logout}
            t={t}
            onNavigateProfile={onNavigateProfile}
            onNavigateSettings={onNavigateSettings}
          />
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
  );
};
