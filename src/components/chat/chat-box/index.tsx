import React from 'react';
import { useChatBoxData } from './useChatBoxData';
import { ChatBoxHeader } from './ChatBoxHeader';
import { ChatBoxMessagesList } from './ChatBoxMessagesList';
import { ChatBoxInputFooter } from './ChatBoxInputFooter';
import { ChatBoxMinimized } from './ChatBoxMinimized';
import { ChatUser } from './types';

export type { ChatUser };

export interface ChatBoxProps {
  friend: ChatUser;
  onClose: () => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ friend, onClose }) => {
  const {
    user,
    messages,
    inputText,
    setInputText,
    isMinimized,
    setIsMinimized,
    loading,
    uploading,
    messagesEndRef,
    chatFileInputRef,
    handleChatFileSelect,
    handleSend,
  } = useChatBoxData({ friend });

  if (isMinimized) {
    return (
      <ChatBoxMinimized
        friend={friend}
        onRestore={() => setIsMinimized(false)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed bottom-0 right-4 md:right-16 z-50 w-80 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-2xl rounded-t-xl flex flex-col overflow-hidden transition-all duration-200">
      <ChatBoxHeader
        friend={friend}
        onMinimize={() => setIsMinimized(true)}
        onClose={onClose}
      />

      <ChatBoxMessagesList
        friend={friend}
        messages={messages}
        loading={loading}
        user={user}
        messagesEndRef={messagesEndRef}
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
  );
};
