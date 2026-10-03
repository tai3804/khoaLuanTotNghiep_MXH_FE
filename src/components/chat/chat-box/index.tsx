import React, { useState } from 'react';
import { useChatBoxData } from './useChatBoxData';
import { ChatBoxHeader } from './ChatBoxHeader';
import { ChatBoxMessagesList } from './ChatBoxMessagesList';
import { ChatBoxInputFooter } from './ChatBoxInputFooter';
import { ChatBoxMinimized } from './ChatBoxMinimized';
import { GroupInfoModal } from '../GroupInfoModal';
import { ChatUser } from './types';

export type { ChatUser };

export interface ChatBoxProps {
  friend: ChatUser;
  onClose: () => void;
  onNavigateProfile?: (userId?: string) => void;
  offsetRight?: number;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ friend, onClose, offsetRight }) => {
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [currentFriend, setCurrentFriend] = useState<ChatUser>(friend);

  const {
    user,
    messages,
    inputText,
    setInputText,
    isMinimized,
    setIsMinimized,
    loading,
    uploading,
    conversationId,
    groupDetail,
    partnerProfile,
    reloadGroupDetail,
    messagesEndRef,
    messagesContainerRef,
    loadingOlder,
    hasMoreMessages,
    loadOlderMessages,
    chatFileInputRef,
    handleChatFileSelect,
    handleSend,
  } = useChatBoxData({ friend: currentFriend });

  const effectiveFriend: ChatUser = {
    ...currentFriend,
    id: partnerProfile?.userId || currentFriend.userId || currentFriend.id,
    userId: partnerProfile?.userId || currentFriend.userId || (!currentFriend.isGroup ? currentFriend.id : undefined),
    name: partnerProfile?.name || currentFriend.name,
    avatar: partnerProfile?.avatar || currentFriend.avatar,
  };

  if (isMinimized) {
    return (
      <ChatBoxMinimized
        friend={effectiveFriend}
        onRestore={() => setIsMinimized(false)}
        onClose={onClose}
        offsetRight={offsetRight}
      />
    );
  }

  const customStyle = offsetRight !== undefined ? { right: `${offsetRight}px` } : undefined;

  return (
    <>
      <div
        style={customStyle}
        className={`fixed bottom-0 ${offsetRight === undefined ? 'right-4 md:right-16' : ''} z-50 w-[325px] sm:w-[338px] bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-2xl rounded-t-2xl flex flex-col overflow-hidden transition-all duration-200`}
      >
        <ChatBoxHeader
          friend={effectiveFriend}
          memberCount={groupDetail?.members?.length}
          groupMemberIds={(groupDetail?.members || []).map((member: any) => String(member.userId))}
          conversationId={conversationId}
          onMinimize={() => setIsMinimized(true)}
          onClose={onClose}
          onOpenGroupInfo={currentFriend.isGroup ? () => setShowGroupInfo(true) : undefined}
        />

        <ChatBoxMessagesList
          friend={effectiveFriend}
          messages={messages}
          loading={loading}
          user={user}
          messagesEndRef={messagesEndRef}
          messagesContainerRef={messagesContainerRef}
          loadingOlder={loadingOlder}
          hasMoreMessages={hasMoreMessages}
          onLoadOlder={loadOlderMessages}
        />

        <ChatBoxInputFooter
          inputText={inputText}
          setInputText={setInputText}
          uploading={uploading}
          chatFileInputRef={chatFileInputRef}
          onChatFileSelect={handleChatFileSelect}
          onSend={handleSend}
        />
      </div>

      {showGroupInfo && conversationId && (
        <GroupInfoModal
          isOpen={showGroupInfo}
          conversationId={conversationId}
          initialName={currentFriend.name}
          onClose={() => setShowGroupInfo(false)}
          onGroupUpdated={(updated) => {
            if (updated?.name) {
              setCurrentFriend((prev) => ({ ...prev, name: updated.name }));
            }
            reloadGroupDetail();
          }}
          onLeaveGroup={onClose}
        />
      )}
    </>
  );
};
