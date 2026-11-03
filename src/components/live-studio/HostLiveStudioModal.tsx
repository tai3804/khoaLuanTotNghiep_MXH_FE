import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHostLiveStudio } from './useHostLiveStudio';
import { HostStudioHeader } from './HostStudioHeader';
import { HostStudioVideoArea } from './HostStudioVideoArea';
import { HostStudioChatPanel } from './HostStudioChatPanel';
import { HostStudioControlsBar } from './HostStudioControlsBar';
import { HostStudioMiniWidget } from './HostStudioMiniWidget';

export const HostLiveStudioModal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // If already on dedicated LiveStreamPage (/live/:postId), do not show modal overlay
  const isOnLivePage = location.pathname.startsWith('/live/');

  // When broadcasting and not minimized, automatically redirect to dedicated page
  useEffect(() => {
    if (isBroadcasting && isStudioOpen && !isStudioMinimized && activeBroadcast.postId) {
      if (!isOnLivePage) {
        navigate(`/live/${activeBroadcast.postId}`);
      }
    }
  }, [isBroadcasting, isStudioOpen, isStudioMinimized, activeBroadcast.postId, isOnLivePage, navigate]);

  if (!isBroadcasting || !isStudioOpen || isOnLivePage) {
    return null;
  }

  // 1. Minimized Mode (Floating Widget in bottom right while browsing other pages)
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
        onExpand={() => {
          setIsStudioMinimized(false);
          if (activeBroadcast.postId) {
            navigate(`/live/${activeBroadcast.postId}`);
          }
        }}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onEndBroadcast={handleEndBroadcast}
      />
    );
  }

  // 2. Full-Screen Live Studio Dashboard (Edge-to-edge full window, no modal margin)
  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen max-w-full max-h-screen overflow-hidden bg-zinc-950 flex flex-col select-none animate-fadeIn">
      {/* Top Header */}
      <HostStudioHeader
        title={activeBroadcast.title}
        formattedTime={formattedTime}
        viewerCount={activeBroadcast.viewerCount}
        onMinimize={() => {
          setIsStudioMinimized(true);
          navigate('/');
        }}
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
            postId={activeBroadcast.postId || undefined}
            hostName={user?.fullName || user?.username}
            hostAvatar={user?.avatar}
            viewerCount={activeBroadcast.viewerCount}
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
  );
};
