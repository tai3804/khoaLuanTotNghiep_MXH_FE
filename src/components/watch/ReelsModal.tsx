import React from 'react';
import {
  ReelsModalProps,
  useReelsController,
  ReelsHeaderControls,
  ReelsNavigationArrows,
  ReelsVideoViewport,
  ReelsVideoInfo,
  ReelsActionSidebar,
  ReelsCommentsDrawer,
} from './reels';

export const ReelsModal: React.FC<ReelsModalProps> = ({
  posts,
  initialIndex = 0,
  isOpen,
  onClose,
  onViewProfile,
}) => {
  const {
    videoPosts,
    currentPost,
    currentIndex,
    isPlaying,
    isMuted,
    showHeartAnim,
    showComments,
    comments,
    loadingComments,
    newCommentText,
    submittingComment,
    videoRef,
    containerRef,
    commentsBottomRef,
    currentLikeState,
    isSaved,
    videoUrl,
    setIsMuted,
    setShowComments,
    setNewCommentText,
    handleNext,
    handlePrev,
    togglePlay,
    handleWheel,
    handleToggleLike,
    handleDoubleTap,
    handleToggleSave,
    handleShare,
    handleSendComment,
  } = useReelsController({
    posts,
    initialIndex,
    isOpen,
    onClose,
  });

  if (!isOpen || !currentPost) return null;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none overflow-hidden"
    >
      {/* Top Header Controls (Close & Mute) */}
      <ReelsHeaderControls
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onClose={onClose}
      />

      {/* Main Reels Center Content Container */}
      <div className="relative flex items-center justify-center w-full h-full max-w-5xl px-2">
        {/* Navigation Arrows (Prev / Next) */}
        <ReelsNavigationArrows
          hasPrev={currentIndex > 0}
          hasNext={currentIndex < videoPosts.length - 1}
          onPrev={handlePrev}
          onNext={handleNext}
        />

        {/* 9:16 Video Stage Sub-component */}
        <ReelsVideoViewport
          videoUrl={videoUrl}
          isPlaying={isPlaying}
          isMuted={isMuted}
          showHeartAnim={showHeartAnim}
          videoRef={videoRef}
          onTogglePlay={togglePlay}
          onDoubleTap={handleDoubleTap}
        >
          {/* Video Info Overlay */}
          <ReelsVideoInfo post={currentPost} onViewProfile={onViewProfile} />

          {/* Action Floating Buttons */}
          <ReelsActionSidebar
            isLiked={currentLikeState.isLiked}
            likesCount={currentLikeState.count}
            commentsCount={currentPost.commentsCount || comments.length}
            isSaved={isSaved}
            isCommentsOpen={showComments}
            onToggleLike={handleToggleLike}
            onToggleComments={() => setShowComments((prev) => !prev)}
            onToggleSave={handleToggleSave}
            onShare={handleShare}
          />
        </ReelsVideoViewport>

        {/* Comments Slide-out Drawer Sub-component */}
        <ReelsCommentsDrawer
          isOpen={showComments}
          comments={comments}
          loading={loadingComments}
          newCommentText={newCommentText}
          submitting={submittingComment}
          onClose={() => setShowComments(false)}
          onCommentTextChange={setNewCommentText}
          onSubmitComment={handleSendComment}
          bottomRef={commentsBottomRef}
        />
      </div>
    </div>
  );
};
