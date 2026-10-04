import React, { RefObject } from 'react';
import { ChatUser } from './types';
import { Message } from './useChatBoxData';
import { UserAvatar } from '../../common/UserAvatar';
import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatBoxMessagesListProps {
  friend: ChatUser;
  messages: Message[];
  loading: boolean;
  user: any;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  loadingOlder: boolean;
  hasMoreMessages: boolean;
  onLoadOlder: () => void;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onRecallMessage: (messageId: string) => Promise<void>;
  onDeleteForMe: (messageId: string) => Promise<void>;
}

export const ChatBoxMessagesList: React.FC<ChatBoxMessagesListProps> = ({
  friend,
  messages,
  loading,
  user,
  messagesEndRef,
  messagesContainerRef,
  loadingOlder,
  hasMoreMessages,
  onLoadOlder,
  onEditMessage,
  onRecallMessage,
  onDeleteForMe,
}) => {
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop <= 24 && hasMoreMessages && !loadingOlder) onLoadOlder();
  };

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="h-[340px] sm:h-[350px] p-2.5 overflow-y-auto overflow-x-hidden space-y-2 bg-gray-50/50 dark:bg-[#18191a]"
    >
      {loadingOlder && (
        <div className="py-1 text-center text-[10px] text-gray-400">Đang tải tin nhắn cũ...</div>
      )}
      {!hasMoreMessages && messages.length > 0 && (
        <div className="py-1 text-center text-[10px] text-gray-400">Đã xem toàn bộ tin nhắn</div>
      )}
      {loading ? (
        <div className="flex items-center justify-center h-full text-xs text-gray-400 dark:text-[#b0b3b8]">
          <div className="w-4 h-4 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin mr-2" />
          <span>Đang tải tin nhắn...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <UserAvatar src={friend.avatar} alt={friend.name} size="md" />
          <p className="text-xs font-semibold mt-2.5 text-gray-800 dark:text-[#e4e6eb]">{friend.name}</p>
          <p className="text-[11px] text-gray-400 dark:text-[#b0b3b8] mt-1">
            Chưa có tin nhắn nào trong cuộc trò chuyện này.
          </p>
        </div>
      ) : (
        messages.map((msg) => {
          const isMe = msg.senderId === user?.id || msg.senderId === 'me';
          return (
            <ChatMessageBubble
              key={msg.id}
              msg={msg}
              isMe={isMe}
              isGroup={friend.isGroup}
              onEdit={onEditMessage}
              onRecall={onRecallMessage}
              onDeleteForMe={onDeleteForMe}
            />
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
