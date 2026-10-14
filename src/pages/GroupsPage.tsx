import React, { useState } from 'react';
import { Header } from '../components/layout/header-bar';
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

      {/* Main Centered Groups Container (Facebook Standard Width matching ProfilePage) */}
      <div className="pt-14 min-h-screen">
        <main className="w-full min-w-0 max-w-[1120px] xl:max-w-[1180px] 2xl:max-w-[1240px] mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <GroupsDiscover onCreateGroupClick={() => setShowCreateModal(true)} />
        </main>
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

