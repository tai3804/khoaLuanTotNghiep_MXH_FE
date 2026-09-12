import React from 'react';
import { useHeaderData } from './useHeaderData';
import { HeaderBrandSearch } from './HeaderBrandSearch';
import { HeaderNavigationTabs } from './HeaderNavigationTabs';
import { HeaderRightControls } from './HeaderRightControls';
import { ChatUser } from '../../chat/ChatBox';

export interface HeaderProps {
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
  const {
    user,
    isAuthenticated,
    logout,
    openLoginModal,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    unreadCount,
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    showSearchResults,
    setShowSearchResults,
    showNotifMenu,
    setShowNotifMenu,
    showMsgMenu,
    setShowMsgMenu,
    showUserMenu,
    setShowUserMenu,
    chatContacts,
    loadingChatContacts,
    msgSearch,
    setMsgSearch,
    pendingReqCount,
    userMenuRef,
    msgMenuRef,
    searchRef,
    notifMenuRef,
    handleNavClick,
  } = useHeaderData({ onTabChange });

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between h-14 px-4 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shadow-sm transition-colors duration-200">
      <HeaderBrandSearch
        searchRef={searchRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSearchResults={showSearchResults}
        setShowSearchResults={setShowSearchResults}
        searching={searching}
        searchResults={searchResults}
        language={language}
        t={t}
        onNavClick={handleNavClick}
        onNavigateProfile={onNavigateProfile}
        onTabChange={onTabChange}
      />

      <HeaderNavigationTabs
        activeTab={activeTab}
        pendingReqCount={pendingReqCount}
        language={language}
        t={t}
        onNavClick={handleNavClick}
      />

      <HeaderRightControls
        isAuthenticated={isAuthenticated}
        user={user}
        unreadCount={unreadCount}
        showNotifMenu={showNotifMenu}
        setShowNotifMenu={setShowNotifMenu}
        showMsgMenu={showMsgMenu}
        setShowMsgMenu={setShowMsgMenu}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        notifMenuRef={notifMenuRef}
        msgMenuRef={msgMenuRef}
        userMenuRef={userMenuRef}
        msgSearch={msgSearch}
        setMsgSearch={setMsgSearch}
        chatContacts={chatContacts}
        loadingChatContacts={loadingChatContacts}
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
        logout={logout}
        openLoginModal={openLoginModal}
        t={t}
        onSelectChatUser={onSelectChatUser}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onNavigateProfile}
        onNavigateAuth={onNavigateAuth}
        onTabChange={onTabChange}
      />
    </header>
  );
};
