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
import { chatPrefId, DEFAULT_EMOJI, DEFAULT_THEME, rememberDirectConversation, themeColor, useChatPref } from './chatPrefs';
import { aiService, SummarizeMessagesResponse, ChatMessageItemDto } from '../../../services/aiService';
import { useToast } from '../../../context/ToastContext';
import { formatAiError } from '../../../utils/apiError';
import { classifyAttachment } from './chatAttachment';

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

  useEffect(() => {
    setCurrentFriend(friend);
  }, [friend]);

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

  // Emoji gửi nhanh và màu chủ đề riêng từng cuộc trò chuyện (chỉnh trong Thông tin cuộc trò chuyện > Tùy chỉnh)
  const prefId = chatPrefId(friend);
  useEffect(() => {
    if (conversationId && !friend.isGroup) rememberDirectConversation(conversationId, friend.userId || friend.id);
  }, [conversationId, friend.isGroup, friend.userId, friend.id]);
  const [quickEmoji] = useChatPref('emoji', prefId, DEFAULT_EMOJI);
  const [themeId] = useChatPref('theme', prefId, DEFAULT_THEME.id);

  const isSendingQuickEmojiRef = React.useRef(false);
  const handleQuickReaction = () => {
    if (isSendingQuickEmojiRef.current) return;
    isSendingQuickEmojiRef.current = true;
    handleSend(undefined, quickEmoji);
    setTimeout(() => {
      isSendingQuickEmojiRef.current = false;
    }, 400);
  };

  const effectiveFriend: ChatUser = {
    ...friend,
    ...currentFriend,
    id: partnerProfile?.userId || currentFriend.userId || friend.userId || currentFriend.id,
    userId: partnerProfile?.userId || currentFriend.userId || friend.userId || (!currentFriend.isGroup ? currentFriend.id : undefined),
    name: partnerProfile?.name || currentFriend.name || friend.name,
    avatar: partnerProfile?.avatar || currentFriend.avatar || friend.avatar,
    online: friend.online !== undefined ? friend.online : currentFriend.online,
    lastActiveAt: friend.lastActiveAt !== undefined ? friend.lastActiveAt : currentFriend.lastActiveAt,
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
        const isImage = classifyAttachment(m) === 'image';

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

      setSummaryData(res);
    } catch (err) {
      toast.showError(formatAiError(err));
      setShowSummary(false);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Nút AI trên header: bấm lần nữa khi bảng tóm tắt đang mở thì đóng lại, không gọi AI thêm
  const handleToggleSummary = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    handleTriggerSummary();
  };

  const customStyle = {
    ...(offsetRight !== undefined ? { right: `${offsetRight}px` } : {}),
    '--chat-accent': themeColor(themeId),
  } as React.CSSProperties;
  // Bảng tóm tắt nằm ngoài khung chat nên phải nổi trên các khung chat bên cạnh
  const positionClass = `${offsetRight !== undefined ? 'fixed bottom-0' : 'relative'} ${showSummary ? 'z-[60]' : 'z-50'}`;

  return (
    <>
      <div style={customStyle} className={`${positionClass} shrink-0 h-full w-full md:h-auto md:w-auto flex flex-col`}>
        {showSummary && (
          <ChatAiSummaryBanner
            summaryData={summaryData}
            loading={summaryLoading}
            onClose={() => setShowSummary(false)}
            onRefresh={handleTriggerSummary}
            isUnreadSummary={isUnreadSummary}
          />
        )}

      <div className="w-full flex-1 min-h-0 md:flex-none md:h-auto md:w-[338px] bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-2xl md:rounded-t-2xl flex flex-col overflow-hidden transition-all duration-200">
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
          onTriggerSummary={handleToggleSummary}
          isSummarizing={summaryLoading}
          isSummaryOpen={showSummary}
          unreadCount={unreadCount}
        />

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

