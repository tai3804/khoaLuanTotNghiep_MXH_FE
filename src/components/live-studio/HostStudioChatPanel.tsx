import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
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
  postId?: string;
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
  postId,
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
    bannedUsers,
    viewers,
    visibleComments,
    handlePinComment,
    handleUnpinComment,
    handleDeleteComment,
    handleCopyComment,
    handleBanViewer,
    handleUnbanViewer,
  } = useHostStudioChat(comments, hostName, postId);

  // Mời người xem ra (từ tin nhắn hoặc danh sách khán giả) luôn qua bước xác nhận
  const [kickTarget, setKickTarget] = useState<{ id: string; name: string } | null>(null);
  const requestKick = (id: string, name?: string) => setKickTarget({ id, name: name || 'người xem này' });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-lg">
      {/* 1. Header with Tab Switcher (Chat / Audience / Settings) - Evenly spaced, no cramming */}
      <HostStudioChatHeader
        activeTab={activeTab}
        commentCount={comments.length}
        viewerCount={viewerCount}
        onTabChange={setActiveTab}
      />

      {/* 2. Main Tab Body Content */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {activeTab === 'chat' && (
          <>
            {/* Pinned comment banner (if any) */}
            {pinnedComment && (
              <HostStudioPinnedComment comment={pinnedComment} onUnpin={handleUnpinComment} />
            )}

            {/* Messages List with dedicated Filter Sub-bar */}
            <HostStudioMessageList
              comments={visibleComments}
              pinnedComment={pinnedComment}
              copiedCommentId={copiedCommentId}
              hostName={hostName}
              filter={filter}
              chatBottomRef={chatBottomRef}
              onFilterChange={setFilter}
              onStartReply={onStartReply}
              onPinComment={handlePinComment}
              onCopyComment={handleCopyComment}
              onDeleteComment={handleDeleteComment}
              onBanViewer={requestKick}
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
            viewers={viewers}
            bannedUsers={bannedUsers}
            onSearchChange={setSearchAudience}
            onKickViewer={requestKick}
            onUnbanViewer={handleUnbanViewer}
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

      {kickTarget && (
        <div
          role="dialog"
          aria-label="Mời người xem ra khỏi buổi phát"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setKickTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center space-x-2.5 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Mời người xem ra khỏi buổi phát?</h3>
            </div>
            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">{kickTarget.name}</strong> sẽ bị ngắt khỏi buổi phát ngay, không xem
              hay bình luận được nữa. Bạn có thể bỏ chặn trong tab Khán giả.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setKickTarget(null)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  handleBanViewer(kickTarget.id, kickTarget.name);
                  setKickTarget(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition cursor-pointer"
              >
                Mời ra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
