import React from 'react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { ChatUser } from '../components/chat/chat-box';
import { InterestMapView } from '../components/interest-map/InterestMapView';

interface InterestMapPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  activeSidebarFilter: string;
  setActiveSidebarFilter: (filter: string) => void;
  onNavigateSettings: () => void;
  onNavigateAuth: () => void;
  onViewProfile: (userId?: string) => void;
  setActiveChatUser: (user: ChatUser | null) => void;
}

const NAV_TAB_BY_FILTER: Record<string, string> = {
  friends: 'friends',
  groups: 'groups',
  watch: 'watch',
  moderation: 'moderation',
  support: 'support',
  saved: 'saved',
};

export const InterestMapPage: React.FC<InterestMapPageProps> = ({
  activeNavTab,
  setActiveNavTab,
  activeSidebarFilter,
  setActiveSidebarFilter,
  onNavigateSettings,
  onNavigateAuth,
  onViewProfile,
  setActiveChatUser,
}) => (
  <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
    <Header
      activeTab={activeNavTab}
      onTabChange={(tab) => {
        setActiveNavTab(tab);
        if (tab === 'friends') setActiveSidebarFilter('friends');
      }}
      onSelectChatUser={(u) => setActiveChatUser(u)}
      onNavigateSettings={onNavigateSettings}
      onNavigateProfile={onViewProfile}
      onNavigateAuth={onNavigateAuth}
    />

    <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
      <SidebarLeft
        activeFilter={activeSidebarFilter}
        onFilterChange={(filter) => {
          setActiveSidebarFilter(filter);
          setActiveNavTab(NAV_TAB_BY_FILTER[filter] || 'home');
        }}
        onNavigateProfile={() => onViewProfile()}
        onNavigateSettings={onNavigateSettings}
      />

      <main className="flex-1 min-w-0 max-w-[900px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
        <InterestMapView />
      </main>
    </div>
  </div>
);
