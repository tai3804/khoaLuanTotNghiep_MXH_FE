import React, { useState, useEffect } from 'react';
import { useChatBoxData } from './useChatBoxData';
import { ChatBoxHeader } from './ChatBoxHeader';
import { ChatBoxMessagesList } from './ChatBoxMessagesList';
import { ChatBoxInputFooter } from './ChatBoxInputFooter';
import { ChatBoxMinimized } from './ChatBoxMinimized';
import { ChatAiSummaryBanner } from './ChatAiSummaryBanner';
import { ChatDetailsPanel } from './chat-details';
import { GroupInfoModal } from '../GroupInfoModal';
import { ChatUser } from './types';
import { aiService, SummarizeMessagesResponse, ChatMessageItemDto } from '../../../services/aiService';
import { useToast } from '../../../context/ToastContext';

export type { ChatUser };
export { ChatVoiceRecorder } from './ChatVoiceRecorder';

export interface ChatBoxProps {
  friend: ChatUser;
  onClose: () => void;
  onNavigateProfile?: (userId?: string) => void;
  offsetRight?: number;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ friend, onClose, onNavigateProfile, offsetRight }) => {
  const toast = useToast();
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [currentFriend, setCurrentFriend] = useState<ChatUser>(friend);
  const [summaryData, setSummaryData] = useState<SummarizeMessagesResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isUnreadSummary, setIsUnreadSummary] = useState(false);

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
    firstUnreadId,
    unreadCount,
    scrollToBottom,
    loadingOlder,
    hasMoreMessages,
    loadOlderMessages,
    chatFileInputRef,
    chatDocInputRef,
    handleChatFileSelect,
    handleEditMessage,
    handleRecallMessage,
    handleDeleteForMe,
    handleSend,
    handleSendVoice,
  } = useChatBoxData({ friend: currentFriend });

  // Quick reaction emoji (defaults to 👍 like Facebook Messenger)
  const emojiKey = conversationId ? `chat_emoji_${conversationId}` : `chat_emoji_${friend.id}`;
  const [quickEmoji, setQuickEmoji] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(emojiKey) || '👍';
    }
    return '👍';
  });

  useEffect(() => {
    const handleEmojiChange = (e: any) => {
      if ((e.detail?.conversationId === conversationId || !conversationId) && e.detail?.emoji) {
        setQuickEmoji(e.detail.emoji);
      }
    };
    window.addEventListener('chat_quick_emoji_changed', handleEmojiChange);
    return () => window.removeEventListener('chat_quick_emoji_changed', handleEmojiChange);
  }, [conversationId]);

  const handleQuickReaction = () => {
    handleSend(undefined, quickEmoji);
  };

  const effectiveFriend: ChatUser = {
    ...currentFriend,
    id: partnerProfile?.userId || currentFriend.userId || currentFriend.id,
    userId: partnerProfile?.userId || currentFriend.userId || (!currentFriend.isGroup ? currentFriend.id : undefined),
    name: partnerProfile?.name || currentFriend.name,
    avatar: partnerProfile?.avatar || currentFriend.avatar,
    unreadCount,
  };

  if (isMinimized) {
    return (
      <ChatBoxMinimized
        friend={effectiveFriend}
        onRestore={() => setIsMinimized(false)}
        onClose={onClose}
        offsetRight={offsetRight}
        unreadCount={unreadCount}
      />
    );
  }

  const handleTriggerSummary = async () => {
    if (messages.length === 0) {
      toast.showInfo('Chưa có tin nhắn nào để tóm tắt');
      return;
    }
    setShowSummary(true);
    setSummaryLoading(true);
    try {
      let targetMessages = messages;
      let summarizingUnread = false;

      if (firstUnreadId) {
        const unreadIdx = messages.findIndex((m) => m.id === firstUnreadId);
        if (unreadIdx >= 0) {
          const contextStart = Math.max(0, unreadIdx - 3);
          targetMessages = messages.slice(contextStart);
          summarizingUnread = true;
        }
      } else if (unreadCount > 0) {
        targetMessages = messages.slice(-Math.min(messages.length, Math.max(unreadCount + 3, 10)));
        summarizingUnread = true;
      }

      if (!summarizingUnread) {
        targetMessages = messages.slice(-30);
      }
      setIsUnreadSummary(summarizingUnread);

      const messageItems: ChatMessageItemDto[] = targetMessages.map((m) => {
        const isMe = m.senderId === user?.id || m.senderId === 'me';
        const senderName = isMe ? (user?.fullName || 'Bạn') : (m.senderName || effectiveFriend.name);

        const isUrl = m.text?.startsWith('http://') || m.text?.startsWith('https://');
        const mediaUrl = m.mediaUrl || (isUrl ? m.text : undefined);
        const isImage = m.type === 'IMAGE' || (mediaUrl && /\.(jpg|jpeg|png|webp|gif)/i.test(mediaUrl)) || Boolean(m.mediaUrl && !m.type?.includes('FILE'));

        let textContent = m.text;
        if (isImage) {
          if (!textContent || textContent.startsWith('http')) {
            textContent = '[Đã gửi 1 hình ảnh đính kèm]';
          } else {
            textContent = `[Hình ảnh: ${textContent}]`;
          }
        }

        return {
          senderName,
          text: textContent,
          time: m.time,
          mediaUrl: isImage ? mediaUrl : undefined,
        };
      });

      const res = await aiService.summarizeMessages({
        conversationName: `${effectiveFriend.name}${summarizingUnread ? ' (Các tin nhắn chưa đọc)' : ''}`,
        isGroup: effectiveFriend.isGroup,
        messages: messageItems,
      });

      if (res) {
        setSummaryData(res);
      } else {
        toast.showError('Không thể tạo tóm tắt vào lúc này');
        setShowSummary(false);
      }
    } catch {
      toast.showError('Lỗi khi phân tích tóm tắt tin nhắn');
      setShowSummary(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  const customStyle = offsetRight !== undefined ? { right: `${offsetRight}px` } : undefined;
  const positionClass = offsetRight !== undefined ? 'fixed bottom-0 z-50' : 'relative z-50';

  return (
    <>
      <div
        style={customStyle}
        className={`${positionClass} w-[325px] sm:w-[338px] bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-2xl rounded-t-2xl flex flex-col overflow-hidden transition-all duration-200 shrink-0`}
      >
        <ChatBoxHeader
          friend={effectiveFriend}
          memberCount={groupDetail?.members?.length}
          groupMemberIds={(groupDetail?.members || []).map((member: any) => String(member.userId))}
          conversationId={conversationId}
          onMinimize={() => setIsMinimized(true)}
          onClose={onClose}
          onOpenGroupInfo={currentFriend.isGroup ? () => setShowGroupInfo(true) : undefined}
          onToggleDetails={() => setShowDetails((prev) => !prev)}
          showDetails={showDetails}
          onTriggerSummary={handleTriggerSummary}
          isSummarizing={summaryLoading}
          unreadCount={unreadCount}
        />

        {showSummary && (
          <ChatAiSummaryBanner
            summaryData={summaryData}
            loading={summaryLoading}
            onClose={() => setShowSummary(false)}
            onRefresh={handleTriggerSummary}
            isUnreadSummary={isUnreadSummary}
            unreadCount={unreadCount}
          />
        )}

        <ChatBoxMessagesList
          friend={effectiveFriend}
          messages={messages}
          loading={loading}
          user={user}
          messagesEndRef={messagesEndRef}
          messagesContainerRef={messagesContainerRef}
          firstUnreadId={firstUnreadId}
          unreadCount={unreadCount}
          loadingOlder={loadingOlder}
          hasMoreMessages={hasMoreMessages}
          onLoadOlder={loadOlderMessages}
          onEditMessage={handleEditMessage}
          onRecallMessage={handleRecallMessage}
          onDeleteForMe={handleDeleteForMe}
          scrollToBottom={scrollToBottom}
        />

        <ChatBoxInputFooter
          inputText={inputText}
          setInputText={setInputText}
          uploading={uploading}
          chatFileInputRef={chatFileInputRef}
          chatDocInputRef={chatDocInputRef}
          onChatFileSelect={handleChatFileSelect}
          onChatDocSelect={handleChatFileSelect}
          onSend={handleSend}
          onSendVoice={handleSendVoice}
          onQuickReaction={handleQuickReaction}
          quickEmoji={quickEmoji}
        />
      </div>

      {/* Full screen modal overlay for Chat Details, Media & Files */}
      <ChatDetailsPanel
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        friend={effectiveFriend}
        messages={messages}
        conversationId={conversationId}
        memberCount={groupDetail?.members?.length}
        onNavigateProfile={onNavigateProfile}
      />

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

