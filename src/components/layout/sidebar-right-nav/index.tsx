import React from 'react';
import { useSidebarRightData } from './useSidebarRightData';
import { PendingFriendRequestsWidget } from './PendingFriendRequestsWidget';
import { ActiveContactsWidget } from './ActiveContactsWidget';
import { GroupChatsWidget } from './GroupChatsWidget';
import { CreateGroupModal } from '../../chat/CreateGroupModal';
import { SidebarRightProps } from './types';

export * from './types';
export * from './useSidebarRightData';
export * from './PendingFriendRequestsWidget';
export * from './ActiveContactsWidget';
export * from './GroupChatsWidget';

export const SidebarRight: React.FC<SidebarRightProps> = ({
  onSelectChatUser,
  className,
  isFixed,
}) => {
  const {
    t,
    isEn,
    groupChats,
    pendingRequests,
    loading,
    contactSearch,
    setContactSearch,
    showSearchInput,
    setShowSearchInput,
    showCreateGroupModal,
    setShowCreateGroupModal,
    filteredContacts,
    handleAccept,
    handleReject,
  } = useSidebarRightData();

  return (
    <aside
      className={`w-[280px] 2xl:w-[340px] hidden xl:block px-3 py-3 overflow-y-auto space-y-4 select-none shrink-0 ${
        isFixed
          ? 'fixed top-14 right-0 bottom-0 z-30 bg-[#f8f9fa]/90 dark:bg-[#121314]/90 backdrop-blur-sm border-l border-gray-200/50 dark:border-[#2a2b2d]/50'
          : 'sticky top-14 h-[calc(100vh-3.5rem)] bg-transparent'
      } ${className || ''}`}
    >
      {/* 1. Lời mời kết bạn */}
      <PendingFriendRequestsWidget
        requests={pendingRequests}
        onAccept={handleAccept}
        onReject={handleReject}
      />

      {/* 2. Người liên hệ */}
      <ActiveContactsWidget
        contacts={filteredContacts}
        loading={loading}
        contactSearch={contactSearch}
        onSearchChange={setContactSearch}
        showSearchInput={showSearchInput}
        onToggleSearch={() => setShowSearchInput((prev) => !prev)}
        onSelectChatUser={onSelectChatUser}
        title={t('contacts') || 'Người liên hệ'}
      />

      <hr className="border-gray-200 dark:border-[#393a3b]" />

      {/* 3. Cuộc trò chuyện nhóm */}
      <GroupChatsWidget
        groups={groupChats}
        onOpenCreateGroup={() => setShowCreateGroupModal(true)}
        onSelectChatUser={onSelectChatUser}
        isEn={isEn}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onGroupCreated={(conversation) => {
          if (onSelectChatUser) {
            onSelectChatUser({
              id: conversation.id || conversation.conversationId,
              conversationId: conversation.conversationId || conversation.id,
              isGroup: true,
              name: conversation.name || 'Nhóm mới',
              avatar: conversation.avatarUrl || '/default-avatar.png',
              online: true,
            });
          }
        }}
      />
    </aside>
  );
};
