import React from 'react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { FriendsView } from '../components/friends/FriendsView';
import { ChatUser } from '../components/chat/chat-box';

interface FriendsPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  activeSidebarFilter?: string;
  setActiveSidebarFilter?: (filter: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (userId?: string) => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

export const FriendsPage: React.FC<FriendsPageProps> = ({
  activeNavTab,
  setActiveNavTab,
  activeSidebarFilter = 'friends',
  setActiveSidebarFilter,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
  activeChatUser,
  setActiveChatUser,
}) => {
  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      <Header
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'friends') setActiveSidebarFilter?.('friends');
          if (tab === 'groups') setActiveSidebarFilter?.('groups');
        }}
        onSelectChatUser={(u) => setActiveChatUser(u)}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onNavigateProfile}
        onNavigateAuth={onNavigateAuth}
      />

      <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
        {/* Left Sidebar */}
        <SidebarLeft
          activeFilter={activeSidebarFilter || 'friends'}
          onFilterChange={(filter) => {
            setActiveSidebarFilter?.(filter);
            if (filter === 'friends') {
              setActiveNavTab('friends');
            } else if (filter === 'groups') {
              setActiveNavTab('groups');
            } else if (filter === 'watch') {
              setActiveNavTab('watch');
            } else if (filter === 'moderation') {
              setActiveNavTab('moderation');
            } else if (filter === 'support') {
              setActiveNavTab('support');
            } else if (filter === 'saved') {
              setActiveNavTab('saved');
            } else {
              setActiveNavTab('home');
            }
          }}
          onNavigateProfile={() => onNavigateProfile?.()}
          onNavigateSettings={onNavigateSettings}
        />

        {/* Center Main Stream */}
        <main className="flex-1 max-w-[740px] xl:max-w-[800px] 2xl:max-w-[860px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          <FriendsView
            onSelectChatUser={(u) => setActiveChatUser(u)}
            onViewProfile={onNavigateProfile}
          />
        </main>

        {/* Right Contacts & Group Chats Sidebar */}
        <SidebarRight onSelectChatUser={(u) => setActiveChatUser(u)} />
      </div>
    </div>
  );
};

