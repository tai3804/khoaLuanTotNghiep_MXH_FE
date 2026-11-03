import React from 'react';
import { LiveComment } from '../../context/LiveStreamContext';
import {
  useHostStudioChat,
  HostStudioChatHeader,
  HostStudioPinnedComment,
  HostStudioMessageList,
  HostStudioAudienceList,
  HostStudioRoomSettings,
  HostStudioChatInput,
} from './chat';

export interface HostStudioChatPanelProps {
  comments: LiveComment[];
  commentInput: string;
  replyingTo: LiveComment | null;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  hostName?: string;
  hostAvatar?: string;
  viewerCount?: number;
  onCommentInputChange: (val: string) => void;
  onStartReply: (comment: LiveComment) => void;
  onCancelReply: () => void;
  onSendComment: (e: React.FormEvent) => void;
  onSendReaction: (emoji: string) => void;
}

export const HostStudioChatPanel: React.FC<HostStudioChatPanelProps> = ({
  comments,
  commentInput,
  replyingTo,
  chatBottomRef,
  inputRef,
  hostName,
  hostAvatar,
  viewerCount = 0,
  onCommentInputChange,
  onStartReply,
  onCancelReply,
  onSendComment,
  onSendReaction,
}) => {
  const {
    activeTab,
    setActiveTab,
    pinnedComment,
    filter,
    setFilter,
    searchAudience,
    setSearchAudience,
    slowModeSeconds,
    setSlowModeSeconds,
    isReactionsEnabled,
    setIsReactionsEnabled,
    copiedCommentId,
    visibleComments,
    handlePinComment,
    handleUnpinComment,
    handleDeleteComment,
    handleCopyComment,
  } = useHostStudioChat(comments, hostName);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-lg">
      {/* 1. Header with Tab Switcher (Chat / Audience / Settings) */}
      <HostStudioChatHeader
        activeTab={activeTab}
        commentCount={comments.length}
        viewerCount={viewerCount}
        filter={filter}
        onTabChange={setActiveTab}
        onFilterToggle={() => setFilter((prev) => (prev === 'all' ? 'host_only' : 'all'))}
      />

      {/* 2. Main Tab Body Content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {activeTab === 'chat' && (
          <>
            {/* Pinned comment banner (if any) */}
            {pinnedComment && (
              <HostStudioPinnedComment comment={pinnedComment} onUnpin={handleUnpinComment} />
            )}

            {/* Messages List with auto-scroll */}
            <HostStudioMessageList
              comments={visibleComments}
              pinnedComment={pinnedComment}
              copiedCommentId={copiedCommentId}
              hostName={hostName}
              chatBottomRef={chatBottomRef}
              onStartReply={onStartReply}
              onPinComment={handlePinComment}
              onCopyComment={handleCopyComment}
              onDeleteComment={handleDeleteComment}
            />

            {/* Input bar (only in Chat tab) */}
            <HostStudioChatInput
              commentInput={commentInput}
              replyingTo={replyingTo}
              inputRef={inputRef}
              onCommentInputChange={onCommentInputChange}
              onCancelReply={onCancelReply}
              onSendComment={onSendComment}
              onSendReaction={(emoji) => {
                if (isReactionsEnabled) onSendReaction(emoji);
              }}
            />
          </>
        )}

        {activeTab === 'audience' && (
          <HostStudioAudienceList
            viewerCount={viewerCount}
            hostName={hostName}
            hostAvatar={hostAvatar}
            searchQuery={searchAudience}
            onSearchChange={setSearchAudience}
          />
        )}

        {activeTab === 'settings' && (
          <HostStudioRoomSettings
            slowModeSeconds={slowModeSeconds}
            isReactionsEnabled={isReactionsEnabled}
            onSlowModeChange={setSlowModeSeconds}
            onToggleReactions={() => setIsReactionsEnabled((prev) => !prev)}
          />
        )}
      </div>
    </div>
  );
};
