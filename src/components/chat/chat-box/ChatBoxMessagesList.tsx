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
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  loadingOlder: boolean;
  hasMoreMessages: boolean;
  onLoadOlder: () => void;
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
}) => {
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop <= 24 && hasMoreMessages && !loadingOlder) onLoadOlder();
  };
  return (
    <div ref={messagesContainerRef} onScroll={handleScroll} className="h-[340px] sm:h-[350px] p-2.5 overflow-y-auto overflow-x-hidden space-y-2 bg-gray-50/50 dark:bg-[#18191a]">
      {loadingOlder && <div className="py-1 text-center text-[10px] text-gray-400">Đang tải tin nhắn cũ...</div>}
      {!hasMoreMessages && messages.length > 0 && <div className="py-1 text-center text-[10px] text-gray-400">Đã xem toàn bộ tin nhắn</div>}
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
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} my-0.5`}>
              {friend.isGroup && !isMe && msg.senderName && (
                <span className="text-[10px] font-semibold text-gray-500 dark:text-[#b0b3b8] mb-0.5 ml-7 truncate max-w-[180px]">
                  {msg.senderName}
                </span>
              )}
              <div className={`flex items-end gap-1.5 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {friend.isGroup && !isMe && (
                  <UserAvatar
                    src={msg.senderAvatar}
                    alt={msg.senderName || 'Thành viên'}
                    size="sm"
                    className="w-6 h-6 rounded-full shrink-0 mb-0.5"
                  />
                )}
                {isMediaUrl ? (
                  isVideo ? (
                    <video
                      src={msg.text}
                      controls
                      className="max-w-full max-h-52 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-sm my-0.5"
                    />
                  ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-700/70 shadow-sm max-w-full my-0.5 bg-black/5 dark:bg-white/5">
                      <img
                        src={msg.text}
                        alt="Đính kèm"
                        className="max-w-full max-h-48 sm:max-h-52 object-contain rounded-2xl block cursor-pointer hover:opacity-95 transition"
                        onClick={() => window.open(msg.text, '_blank')}
                        title="Bấm để xem ảnh gốc"
                      />
                    </div>
                  )
                ) : (
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm break-words break-all ${
                      isMe
                        ? 'bg-[#1877f2] text-white rounded-br-none'
                        : 'bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
              </div>
              <span
                className={`text-[9px] text-gray-400 dark:text-[#b0b3b8] mt-0.5 px-1 ${
                  friend.isGroup && !isMe ? 'ml-7' : ''
                }`}
              >
                {msg.time}{isMe && <span className="ml-1">· {msg.status === 'SENDING' ? 'Đang gửi' : msg.status === 'SEEN' ? 'Đã xem' : msg.status === 'DELIVERED' ? 'Đã nhận' : 'Đã gửi'}</span>}
              </span>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
