import React, { useState } from 'react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { GroupsDiscover } from '../components/groups/GroupsDiscover';
import { ChatUser } from '../components/chat/chat-box';
import { CreateCommunityGroupModal } from '../components/groups/CreateCommunityGroupModal';

interface GroupsPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  activeSidebarFilter?: string;
  setActiveSidebarFilter?: (filter: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (uid?: string) => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = (props) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      <Header
        activeTab={props.activeNavTab}
        onTabChange={(tab) => {
          props.setActiveNavTab(tab);
          if (tab === 'friends') props.setActiveSidebarFilter?.('friends');
          if (tab === 'groups') props.setActiveSidebarFilter?.('groups');
        }}
        onNavigateSettings={props.onNavigateSettings}
        onNavigateProfile={props.onNavigateProfile}
        onNavigateAuth={props.onNavigateAuth}
        onSelectChatUser={props.setActiveChatUser}
      />

      <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
        {/* Left Sidebar */}
        <SidebarLeft
          activeFilter={props.activeSidebarFilter || 'groups'}
          onFilterChange={(filter) => {
            props.setActiveSidebarFilter?.(filter);
            if (filter === 'friends') {
              props.setActiveNavTab('friends');
            } else if (filter === 'groups') {
              props.setActiveNavTab('groups');
            } else if (filter === 'watch') {
              props.setActiveNavTab('watch');
            } else if (filter === 'moderation') {
              props.setActiveNavTab('moderation');
            } else if (filter === 'support') {
              props.setActiveNavTab('support');
            } else if (filter === 'saved') {
              props.setActiveNavTab('saved');
            } else {
              props.setActiveNavTab('home');
            }
          }}
          onNavigateProfile={() => props.onNavigateProfile?.()}
          onNavigateSettings={props.onNavigateSettings}
        />

        {/* Main Content Stream */}
        <main className="flex-1 max-w-[740px] xl:max-w-[800px] 2xl:max-w-[860px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          <GroupsDiscover onCreateGroupClick={() => setShowCreateModal(true)} />
        </main>

        {/* Right Contacts & Group Chats Sidebar */}
        <SidebarRight onSelectChatUser={(u) => props.setActiveChatUser(u)} />
      </div>

      {showCreateModal && (
        <CreateCommunityGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

