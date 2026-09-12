import React from 'react';
import { Post } from '../../types';
import { CommentModal } from './CommentModal';
import {
  usePostCardData,
  PostCardHeader,
  PostCardContent,
  PostCardStatsBar,
  PostCardActionsBar,
  PostCardCommentsPreview,
} from './post-card';

interface PostCardProps {
  post: Post;
  onDeletePost?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onDeletePost,
  onViewProfile,
}) => {
  const {
    user,
    isAuthenticated,
    openLoginModal,
    t,
    language,
    liked,
    likesCount,
    commentsCount,
    sharesCount,
    reaction,
    saved,
    setSaved,
    comments,
    loadingComments,
    inlineCommentText,
    setInlineCommentText,
    showOptionsMenu,
    setShowOptionsMenu,
    showCommentModal,
    setShowCommentModal,
    copied,
    isDeleting,
    authorName,
    authorAvatar,
    reactionsList,
    topReactionIcons,
    displayedComments,
    totalComments,
    getReactionLabel,
    handleLike,
    handleSelectReaction,
    submitCommentText,
    handleInlineCommentSubmit,
    handleDeletePost,
    handleSharePost,
    showReactionsMenu,
    setShowReactionsMenu,
  } = usePostCardData({ post, onDeletePost });

  if (isDeleting) {
    return null;
  }

  return (
    <div
      id={`post-${post.id}`}
      className="bg-white dark:bg-[#242526] rounded-xl shadow-sm mb-4 border border-gray-200 dark:border-[#393a3b] transition-colors overflow-hidden"
    >
      {/* Header section */}
      <PostCardHeader
        post={post}
        authorName={authorName}
        authorAvatar={authorAvatar}
        user={user}
        saved={saved}
        setSaved={setSaved}
        copied={copied}
        showOptionsMenu={showOptionsMenu}
        setShowOptionsMenu={setShowOptionsMenu}
        language={language}
        onViewProfile={onViewProfile}
        onDeletePost={onDeletePost}
        handleSharePost={handleSharePost}
        handleDeletePost={handleDeletePost}
      />

      {/* Post Text & Media Gallery Content */}
      <PostCardContent
        post={post}
        setShowCommentModal={setShowCommentModal}
      />

      {/* Post Reaction & Comment Stats */}
      <PostCardStatsBar
        likesCount={likesCount}
        sharesCount={sharesCount}
        totalComments={totalComments}
        topReactionIcons={topReactionIcons}
        language={language}
        setShowCommentModal={setShowCommentModal}
      />

      <div className="mx-3 border-t border-gray-200 dark:border-[#393a3b]" />

      {/* Post Actions Bar (Like, Comment, Share) */}
      <PostCardActionsBar
        liked={liked}
        reaction={reaction}
        showReactionsMenu={showReactionsMenu}
        setShowReactionsMenu={setShowReactionsMenu}
        reactionsList={reactionsList}
        handleLike={handleLike}
        handleSelectReaction={handleSelectReaction}
        getReactionLabel={getReactionLabel}
        handleSharePost={handleSharePost}
        copied={copied}
        setShowCommentModal={setShowCommentModal}
        t={t}
        language={language}
      />

      {/* Comments Preview Section */}
      <PostCardCommentsPreview
        displayedComments={displayedComments}
        totalComments={totalComments}
        user={user}
        isAuthenticated={isAuthenticated}
        openLoginModal={openLoginModal}
        inlineCommentText={inlineCommentText}
        setInlineCommentText={setInlineCommentText}
        handleInlineCommentSubmit={handleInlineCommentSubmit}
        setShowCommentModal={setShowCommentModal}
        onViewProfile={onViewProfile}
        t={t}
        language={language}
      />

      {/* Standalone Comment Modal Component */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        post={post}
        authorName={authorName || post.authorName || 'Thành viên'}
        authorAvatar={authorAvatar || post.authorAvatar || ''}
        liked={liked}
        likesCount={likesCount}
        commentsCount={totalComments}
        comments={comments}
        loadingComments={loadingComments}
        onLike={handleLike}
        onSelectReaction={handleSelectReaction}
        onSubmitComment={submitCommentText}
        onViewProfile={onViewProfile}
        onShare={handleSharePost}
        userReaction={reaction}
        topReactionIcons={topReactionIcons}
      />
    </div>
  );
};
