import React, { RefObject, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
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
  firstUnreadId?: string | null;
  unreadCount?: number;
  loadingOlder: boolean;
  hasMoreMessages: boolean;
  onLoadOlder: () => void;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onRecallMessage: (messageId: string) => Promise<void>;
  onDeleteForMe: (messageId: string) => Promise<void>;
  scrollToBottom?: (behavior?: 'auto' | 'smooth') => void;
}

export const ChatBoxMessagesList: React.FC<ChatBoxMessagesListProps> = ({
  friend,
  messages,
  loading,
  user,
  messagesEndRef,
  messagesContainerRef,
  firstUnreadId,
  unreadCount,
  loadingOlder,
  hasMoreMessages,
  onLoadOlder,
  onEditMessage,
  onRecallMessage,
  onDeleteForMe,
  scrollToBottom,
}) => {
  const [showScrollDown, setShowScrollDown] = useState(false);

  // Auto scroll to bottom whenever loading finishes or new messages are rendered
  useEffect(() => {
    if (loading) return;
    const container = messagesContainerRef.current;
    if (!container) return;

    const t1 = setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 15);
    const t2 = setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 80);
    const t3 = setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [loading, messages.length, messagesContainerRef]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    if (container.scrollTop <= 24 && hasMoreMessages && !loadingOlder) {
      onLoadOlder();
    }
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollDown(distFromBottom > 70);
  };

  const handleMediaLoad = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distFromBottom < 120) {
      container.scrollTop = container.scrollHeight;
    }
  };

  const handleScrollToBottomClick = () => {
    if (scrollToBottom) {
      scrollToBottom('smooth');
    } else if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  let unreadEncountered = false;

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
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
            const isFirstUnread = Boolean(firstUnreadId && msg.id === firstUnreadId);
            if (isFirstUnread) {
              unreadEncountered = true;
            }

            return (
              <React.Fragment key={msg.id}>
                {isFirstUnread && (
                  <div
                    id="unread-messages-separator"
                    className="my-3 flex items-center justify-center gap-2 select-none py-1 animate-in fade-in duration-200"
                  >
                    <div className="flex-1 h-px bg-red-300 dark:bg-red-800/60" />
                    <div className="px-3 py-0.5 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-full text-[10px] sm:text-[11px] font-bold shadow-xs flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
                      <span>Tin nhắn chưa đọc{unreadCount && unreadCount > 0 ? ` (${unreadCount})` : ''}</span>
                    </div>
                    <div className="flex-1 h-px bg-red-300 dark:bg-red-800/60" />
                  </div>
                )}
                <ChatMessageBubble
                  msg={msg}
                  isMe={isMe}
                  isGroup={friend.isGroup}
                  isUnread={unreadEncountered}
                  onEdit={onEditMessage}
                  onRecall={onRecallMessage}
                  onDeleteForMe={onDeleteForMe}
                  onMediaLoad={handleMediaLoad}
                />
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollDown && (
        <button
          type="button"
          onClick={handleScrollToBottomClick}
          className="absolute bottom-3 right-3 p-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-1 text-[10px] font-bold animate-in fade-in zoom-in-95 z-20"
          title="Cuộn xuống tin nhắn mới nhất"
        >
          <ChevronDown className="w-4 h-4" />
          {unreadCount && unreadCount > 0 ? (
            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-extrabold mr-0.5">
              {unreadCount}
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
};
