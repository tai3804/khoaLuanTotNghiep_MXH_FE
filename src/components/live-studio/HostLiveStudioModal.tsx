import React from 'react';
import { useHostLiveStudio } from './useHostLiveStudio';
import { HostStudioHeader } from './HostStudioHeader';
import { HostStudioVideoArea } from './HostStudioVideoArea';
import { HostStudioChatPanel } from './HostStudioChatPanel';
import { HostStudioControlsBar } from './HostStudioControlsBar';
import { HostStudioMiniWidget } from './HostStudioMiniWidget';

export const HostLiveStudioModal: React.FC = () => {
  const {
    user,
    activeBroadcast,
    isBroadcasting,
    isStudioOpen,
    isStudioMinimized,
    setIsStudioOpen,
    setIsStudioMinimized,
    comments,
    reactions,
    commentInput,
    setCommentInput,
    replyingTo,
    inputRef,
    showEndConfirm,
    setShowEndConfirm,
    formattedTime,
    chatBottomRef,
    toggleCamera,
    toggleMic,
    handleStartReply,
    handleCancelReply,
    handleSendComment,
    handleSendReaction,
    handleEndBroadcast,
  } = useHostLiveStudio();

  if (!isBroadcasting || !isStudioOpen) {
    return null;
  }

  // 1. Minimized Mode (Floating Widget in bottom right)
  if (isStudioMinimized) {
    return (
      <HostStudioMiniWidget
        stream={activeBroadcast.stream}
        isCameraOn={activeBroadcast.isCameraOn}
        isMicOn={activeBroadcast.isMicOn}
        viewerCount={activeBroadcast.viewerCount}
        formattedTime={formattedTime}
        userAvatar={user?.avatar}
        userName={user?.fullName || user?.username}
        comments={comments}
        onExpand={() => setIsStudioMinimized(false)}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onEndBroadcast={handleEndBroadcast}
      />
    );
  }

  // 2. Full Live Studio Dashboard Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fadeIn select-none">
      <div className="relative w-full max-w-6xl h-full max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <HostStudioHeader
          title={activeBroadcast.title}
          formattedTime={formattedTime}
          viewerCount={activeBroadcast.viewerCount}
          onMinimize={() => setIsStudioMinimized(true)}
          onClose={() => setIsStudioOpen(false)}
        />

        {/* Main Content Area: Left Video (65%), Right Chat (35%) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 bg-zinc-950">
          {/* Video Area (8 cols on large screens) */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-0">
            <HostStudioVideoArea
              stream={activeBroadcast.stream}
              isCameraOn={activeBroadcast.isCameraOn}
              isMicOn={activeBroadcast.isMicOn}
              userAvatar={user?.avatar}
              userName={user?.fullName || user?.username}
              comments={comments}
              reactions={reactions}
            />
          </div>

          {/* Real-time Live Chat Panel (4 cols on large screens) */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-0">
            <HostStudioChatPanel
              comments={comments}
              commentInput={commentInput}
              replyingTo={replyingTo}
              chatBottomRef={chatBottomRef}
              inputRef={inputRef}
              hostName={user?.fullName || user?.username}
              onCommentInputChange={setCommentInput}
              onStartReply={handleStartReply}
              onCancelReply={handleCancelReply}
              onSendComment={handleSendComment}
              onSendReaction={handleSendReaction}
            />
          </div>
        </div>

        {/* Bottom Host Studio Controls Bar */}
        <HostStudioControlsBar
          isMicOn={activeBroadcast.isMicOn}
          isCameraOn={activeBroadcast.isCameraOn}
          showEndConfirm={showEndConfirm}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onShowEndConfirm={setShowEndConfirm}
          onEndBroadcast={handleEndBroadcast}
        />
      </div>
    </div>
  );
};
