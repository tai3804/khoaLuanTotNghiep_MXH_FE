import React, { useState } from 'react';
import { GroupsSidebar } from '../components/groups/GroupsSidebar';
import { GroupsDiscover } from '../components/groups/GroupsDiscover';
import { CreateCommunityGroupModal } from '../components/groups/CreateCommunityGroupModal';
import { Header } from '../components/layout/header-bar';
import { ChatUser } from '../components/chat/chat-box';

interface GroupsPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (uid?: string) => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

export const GroupsPage: React.FC<GroupsPageProps> = (props) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
      <Header 
        activeTab={props.activeNavTab} 
        onTabChange={props.setActiveNavTab} 
        onNavigateSettings={props.onNavigateSettings}
        onNavigateProfile={props.onNavigateProfile}
        onNavigateAuth={props.onNavigateAuth}
        onSelectChatUser={props.setActiveChatUser}
      />

      <div className="flex-1 flex pt-14">
        {/* Left Sidebar */}
        <GroupsSidebar onCreateGroupClick={() => setShowCreateModal(true)} />

        {/* Main Content */}
        <GroupsDiscover onCreateGroupClick={() => setShowCreateModal(true)} />
      </div>

      <CreateCommunityGroupModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
};
