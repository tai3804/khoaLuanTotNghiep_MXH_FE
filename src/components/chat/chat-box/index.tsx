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
}

export const ChatBox: React.FC<ChatBoxProps> = ({ friend, onClose }) => {
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

  if (isMinimized) {
    return (
      <ChatBoxMinimized
        friend={currentFriend}
        onRestore={() => setIsMinimized(false)}
        onClose={onClose}
      />
    );
  }

  return (
    <>
      <div className="fixed bottom-0 right-4 md:right-16 z-50 w-80 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-2xl rounded-t-xl flex flex-col overflow-hidden transition-all duration-200">
        <ChatBoxHeader
          friend={currentFriend}
          memberCount={groupDetail?.members?.length}
          groupMemberIds={(groupDetail?.members || []).map((member: any) => String(member.userId))}
          conversationId={conversationId}
          onMinimize={() => setIsMinimized(true)}
          onClose={onClose}
          onOpenGroupInfo={currentFriend.isGroup ? () => setShowGroupInfo(true) : undefined}
        />

        <ChatBoxMessagesList
          friend={currentFriend}
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
