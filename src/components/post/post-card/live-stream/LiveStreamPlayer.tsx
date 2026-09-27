import React from 'react';
import { Post } from '../../../../types';
import { Radio } from 'lucide-react';
import { UserAvatar } from '../../../common/UserAvatar';
import { useLiveStreamPlayer } from './useLiveStreamPlayer';
import { LiveStreamHeader } from './LiveStreamHeader';
import { LiveStreamHostVideo } from './LiveStreamHostVideo';
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
      {/* Video Content: Host camera or Viewer stream surface */}
      {isHost && activeBroadcast.stream ? (
        <LiveStreamHostVideo
          stream={activeBroadcast.stream}
          isCameraOn={activeBroadcast.isCameraOn}
          userAvatar={post.authorAvatar}
          userName={post.authorName}
        />
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-linear-to-tr from-slate-950 via-zinc-900 to-neutral-950">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.4)_0,transparent_70%)] animate-pulse" />
          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="relative">
              <UserAvatar
                src={post.authorAvatar}
                alt={post.authorName}
                size="xl"
                className="w-20 h-20 border-2 border-red-500 ring-4 ring-red-500/20 shadow-xl"
              />
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-red-600 text-white rounded-full shadow-lg">
                <Radio className="w-4 h-4 animate-ping" />
              </div>
            </div>
            <div className="text-center px-4">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block">
                Đang phát trực tiếp
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 max-w-lg truncate">{cleanTitle}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{post.authorName} đang phát trực tiếp</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Animated Reactions */}
      <LiveStreamFloatingReactions reactions={reactions} />

      {/* Top Header Overlay */}
      <LiveStreamHeader
        formattedTime={formattedTime}
        viewerCount={activeBroadcast.viewerCount}
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
