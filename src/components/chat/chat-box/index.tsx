import React, { useState } from 'react';
import { useChatBoxData } from './useChatBoxData';
import { ChatBoxHeader } from './ChatBoxHeader';
import { ChatBoxMessagesList } from './ChatBoxMessagesList';
import { ChatBoxInputFooter } from './ChatBoxInputFooter';
import { ChatBoxMinimized } from './ChatBoxMinimized';
import { ChatAiSummaryBanner } from './ChatAiSummaryBanner';
import { GroupInfoModal } from '../GroupInfoModal';
import { ChatUser } from './types';
import { aiService, SummarizeMessagesResponse, ChatMessageItemDto } from '../../../services/aiService';
import { useToast } from '../../../context/ToastContext';

export type { ChatUser };

export interface ChatBoxProps {
  friend: ChatUser;
  onClose: () => void;
  onNavigateProfile?: (userId?: string) => void;
  offsetRight?: number;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ friend, onClose, offsetRight }) => {
  const toast = useToast();
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [currentFriend, setCurrentFriend] = useState<ChatUser>(friend);
  const [summaryData, setSummaryData] = useState<SummarizeMessagesResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

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
    chatDocInputRef,
    handleChatFileSelect,
    handleEditMessage,
    handleRecallMessage,
    handleDeleteForMe,
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

  const handleTriggerSummary = async () => {
    if (messages.length === 0) {
      toast.showInfo('Chưa có tin nhắn nào để tóm tắt');
      return;
    }
    setShowSummary(true);
    setSummaryLoading(true);
    try {
      const messageItems: ChatMessageItemDto[] = messages.slice(-30).map((m) => {
        const isMedia = m.text.startsWith('http://') || m.text.startsWith('https://');
        return {
          senderName: m.senderId === user?.id || m.senderId === 'me' ? (user?.fullName || 'Bạn') : (m.senderName || effectiveFriend.name),
          text: m.text,
          time: m.time,
          mediaUrl: isMedia ? m.text : undefined,
        };
      });

      const res = await aiService.summarizeMessages({
        conversationName: effectiveFriend.name,
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
          onTriggerSummary={handleTriggerSummary}
          isSummarizing={summaryLoading}
        />

        {showSummary && (
          <ChatAiSummaryBanner
            summaryData={summaryData}
            loading={summaryLoading}
            onClose={() => setShowSummary(false)}
            onRefresh={handleTriggerSummary}
          />
        )}

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
          onEditMessage={handleEditMessage}
          onRecallMessage={handleRecallMessage}
          onDeleteForMe={handleDeleteForMe}
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
