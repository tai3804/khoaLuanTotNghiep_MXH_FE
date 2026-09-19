import React, { RefObject } from 'react';
import { ChatUser } from './types';
import { Message } from './useChatBoxData';
import { UserAvatar } from '../../common/UserAvatar';

interface ChatBoxMessagesListProps {
  friend: ChatUser;
  messages: Message[];
  loading: boolean;
  user: any;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export const ChatBoxMessagesList: React.FC<ChatBoxMessagesListProps> = ({
  friend,
  messages,
  loading,
  user,
  messagesEndRef,
}) => {
  return (
    <div className="h-72 p-3 overflow-y-auto space-y-2 bg-gray-50/50 dark:bg-[#18191a]">
      {loading ? (
        <div className="flex items-center justify-center h-full text-xs text-gray-400 dark:text-[#b0b3b8]">
          <div className="w-4 h-4 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin mr-2" />
          <span>Đang tải tin nhắn...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <UserAvatar src={friend.avatar} alt={friend.name} size="md" />
          <p className="text-xs font-semibold mt-2.5 text-gray-800 dark:text-[#e4e6eb]">{friend.name}</p>
          <p className="text-[11px] text-gray-400 dark:text-[#b0b3b8] mt-1">Chưa có tin nhắn nào trong cuộc trò chuyện này.</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isMe = msg.senderId === user?.id || msg.senderId === 'me';
          const isMediaUrl = msg.text.startsWith('http://') || msg.text.startsWith('https://');
          const isVideo = isMediaUrl && (msg.text.endsWith('.mp4') || msg.text.endsWith('.webm'));

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-[#1877f2] text-white rounded-br-none'
                    : 'bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] rounded-bl-none'
                }`}
              >
                {isMediaUrl ? (
                  isVideo ? (
                    <video src={msg.text} controls className="max-w-xs max-h-48 rounded-lg my-1" />
                  ) : (
                    <img src={msg.text} alt="Attachment" className="max-w-xs max-h-48 rounded-lg object-cover my-1" />
                  )
                ) : (
                  msg.text
                )}
              </div>
              <span className="text-[9px] text-gray-400 dark:text-[#b0b3b8] mt-0.5 px-1">{msg.time}</span>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
