import React from 'react';
import { Post } from '../../../../types';
import { useLiveStreamPlayer } from './useLiveStreamPlayer';
import { LiveStreamHeader } from './LiveStreamHeader';
import { LiveStreamHostVideo } from './LiveStreamHostVideo';
import { LiveStreamViewerVideo } from './LiveStreamViewerVideo';
import { LiveStreamHostControls } from './LiveStreamHostControls';
import { LiveStreamViewerOverlay } from './LiveStreamViewerOverlay';
import { LiveStreamFloatingReactions } from './LiveStreamFloatingReactions';
import { LiveStreamEndedView } from './LiveStreamEndedView';
import { useLanguage } from '../../../../context/LanguageContext';
import { Radio } from 'lucide-react';

interface LiveStreamPlayerProps {
  post: Post;
  setShowCommentModal?: (val: boolean) => void;
}

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({ post }) => {
  const { t } = useLanguage();
  const {
    containerRef,
    isLive,
    isConnecting,
    isHost,
    isHostResuming,
    activeBroadcast,
    viewerStream,
    effectiveViewerCount,
    comments,
    reactions,
    commentInput,
    setCommentInput,
    replyingTo,
    inputRef,
    formattedTime,
    showEndConfirm,
    setShowEndConfirm,
    cleanTitle,
    handleStartReply,
    handleCancelReply,
    handleSendComment,
    handleToggleFullscreen,
    stopBroadcast,
    toggleCamera,
    toggleMic,
    sendLiveReaction,
    updateViewerCount,
    openStudio,
  } = useLiveStreamPlayer(post);

  // 1. Trạng thái đang kết nối vào phòng (Connecting State) - ngăn chặn giật màn hình "đã kết thúc"
  if (isConnecting) {
    return (
      <div className="relative w-full aspect-video sm:max-h-[480px] bg-zinc-950 flex flex-col items-center justify-center border-y border-zinc-800 text-white select-none">
        <div className="relative flex items-center justify-center mb-3">
          <div className="w-12 h-12 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
          <Radio className="absolute w-5 h-5 text-red-500 animate-pulse" />
        </div>
        <p className="text-xs sm:text-sm font-semibold text-zinc-200">
          {t('live.connecting', 'Đang kết nối vào phòng phát trực tiếp...')}
        </p>
        <p className="text-[11px] text-zinc-500 mt-1">
          {t('live.connectingSub', 'Vui lòng chờ trong giây lát')}
        </p>
      </div>
    );
  }

  // 2. Buổi phát đã kết thúc
  if (!isLive) {
    return <LiveStreamEndedView cleanTitle={cleanTitle} authorName={post.authorName} />;
  }

  // 3. Đang phát sóng trực tiếp (Active Live Room)
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video sm:max-h-[480px] bg-black overflow-hidden flex items-center justify-center group select-none border-y border-gray-800"
    >
      {/* Video Content: Host camera OR Live Viewer WebRTC Stream */}
      {isHost && activeBroadcast.stream ? (
        <LiveStreamHostVideo
          postId={post.id}
          hostUserId={post.userId}
          stream={activeBroadcast.stream}
          isCameraOn={activeBroadcast.isCameraOn}
          userAvatar={post.authorAvatar}
          userName={post.authorName}
          onViewerCountChange={(count) => updateViewerCount(post.id, count)}
        />
      ) : (
        <LiveStreamViewerVideo
          remoteStream={viewerStream.remoteStream}
          isMuted={viewerStream.isMuted}
          isConnected={viewerStream.isConnected}
          hostAvatar={post.authorAvatar}
          hostName={post.authorName}
          cleanTitle={cleanTitle}
          onToggleMute={viewerStream.toggleMute}
          waitingFor={isHostResuming ? 'self' : viewerStream.isReconnecting ? 'host' : undefined}
        />
      )}

      {/* Floating Animated Reactions */}
      <LiveStreamFloatingReactions reactions={reactions} />

      {/* Top Header Overlay with accurate real viewer count */}
      <LiveStreamHeader
        formattedTime={formattedTime}
        viewerCount={effectiveViewerCount}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Live Comments Speech Bubbles & Viewer Reactions Overlay */}
      <LiveStreamViewerOverlay
        comments={comments}
        commentInput={commentInput}
        replyingTo={replyingTo}
        inputRef={inputRef}
        isHost={isHost}
        onCommentInputChange={setCommentInput}
        onStartReply={handleStartReply}
        onCancelReply={handleCancelReply}
        onSendComment={handleSendComment}
        onSendReaction={(emoji) => sendLiveReaction(post.id, emoji)}
      />

      {/* Host Controls Overlay */}
      {isHost && (
        <LiveStreamHostControls
          isMicOn={activeBroadcast.isMicOn}
          isCameraOn={activeBroadcast.isCameraOn}
          showEndConfirm={showEndConfirm}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onShowEndConfirm={setShowEndConfirm}
          onStopBroadcast={() => stopBroadcast(post.id)}
          onOpenStudio={openStudio}
        />
      )}
    </div>
  );
};
