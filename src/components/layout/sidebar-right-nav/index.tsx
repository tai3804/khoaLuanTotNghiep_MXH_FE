import React from 'react';
import { useSidebarRightData } from './useSidebarRightData';
import { PendingFriendRequestsSection } from './PendingFriendRequestsSection';
import { ContactsSection } from './ContactsSection';
import { GroupChatsSection } from './GroupChatsSection';
import { ChatUser } from '../../chat/ChatBox';

export interface SidebarRightProps {
  onSelectChatUser?: (user: ChatUser) => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({ onSelectChatUser }) => {
  const {
    t,
    contacts,
    pendingRequests,
    loading,
    contactSearch,
    setContactSearch,
    showSearchInput,
    setShowSearchInput,
    filteredContacts,
    handleAccept,
    handleReject,
  } = useSidebarRightData();

  return (
    <aside className="w-[280px] 2xl:w-[340px] hidden xl:block px-3 py-3 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto space-y-4 bg-transparent select-none shrink-0">
      <PendingFriendRequestsSection
        pendingRequests={pendingRequests}
        onAccept={handleAccept}
        onReject={handleReject}
      />

      <ContactsSection
        t={t}
        loading={loading}
        showSearchInput={showSearchInput}
        setShowSearchInput={setShowSearchInput}
        contactSearch={contactSearch}
        setContactSearch={setContactSearch}
        filteredContacts={filteredContacts}
        onSelectChatUser={onSelectChatUser}
      />

      <hr className="border-gray-200 dark:border-[#393a3b]" />

      <GroupChatsSection
        contacts={contacts}
        onSelectChatUser={onSelectChatUser}
      />
    </aside>
  );
};
