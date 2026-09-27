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

interface LiveStreamPlayerProps {
  post: Post;
  setShowCommentModal?: (val: boolean) => void;
}

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({ post }) => {
  const {
    containerRef,
    isLive,
    isHost,
    activeBroadcast,
    viewerStream,
    effectiveViewerCount,
    comments,
    reactions,
    commentInput,
    setCommentInput,
    formattedTime,
    showEndConfirm,
    setShowEndConfirm,
    cleanTitle,
    handleSendComment,
    handleToggleFullscreen,
    stopBroadcast,
    toggleCamera,
    toggleMic,
    sendLiveReaction,
  } = useLiveStreamPlayer(post);

  if (!isLive) {
    return <LiveStreamEndedView cleanTitle={cleanTitle} authorName={post.authorName} />;
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video sm:max-h-[480px] bg-black overflow-hidden flex items-center justify-center group select-none border-y border-gray-800"
    >
      {/* Video Content: Host camera OR Live Viewer WebRTC Stream */}
      {isHost && activeBroadcast.stream ? (
        <LiveStreamHostVideo
          stream={activeBroadcast.stream}
          isCameraOn={activeBroadcast.isCameraOn}
          userAvatar={post.authorAvatar}
          userName={post.authorName}
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
        />
      )}

      {/* Viewer Live Comments & Reactions Overlay */}
      {!isHost && (
        <LiveStreamViewerOverlay
          comments={comments}
          commentInput={commentInput}
          onCommentInputChange={setCommentInput}
          onSendComment={handleSendComment}
          onSendReaction={(emoji) => sendLiveReaction(post.id, emoji)}
        />
      )}
    </div>
  );
};

