import React, { useEffect } from 'react';
import { Post, Comment } from '../../types';
import {
  useCommentModalData,
  CommentModalHeader,
  CommentAuthorSection,
  CommentStatsBar,
  CommentActionsBar,
  CommentItem,
  CommentFormFooter,
} from './comment-modal';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  authorName: string;
  authorAvatar?: string;
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  comments: Comment[];
  loadingComments: boolean;
  onLike: () => void;
  onSelectReaction: (emoji: string) => void;
  onSubmitComment: (text: string, parentCommentId?: string) => Promise<void>;
  onViewProfile?: (userId: string) => void;
  onShare?: () => void;
  userReaction?: string;
  topReactionIcons?: string[];
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  post,
  authorName,
  authorAvatar,
  liked,
  likesCount,
  commentsCount,
  comments,
  loadingComments,
  onLike,
  onSelectReaction,
  onSubmitComment,
  onViewProfile,
  onShare,
  userReaction = '👍',
  topReactionIcons: externalTopIcons,
}) => {
  const {
    user,
    isAuthenticated,
    t,
    language,
    commentText,
    setCommentText,
    replyingTo,
    setReplyingTo,
    submitting,
    showReactions,
    setShowReactions,
    copied,
    commentsEndRef,
    inputRef,
    reactionsList,
    topReactionIcons,
    rootComments,
    getRepliesFor,
    handleSubmit,
    handleShareClick,
    handleStartReply,
    getReactionLabel,
  } = useCommentModalData({
    post,
    liked,
    userReaction,
    externalTopIcons,
    comments,
    onSubmitComment,
    onShare,
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in cursor-pointer"
    >
      {/* Modal Box */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#242526] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-[#393a3b] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <CommentModalHeader
          authorName={authorName}
          language={language}
          onClose={onClose}
        />

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Post Author Info & Content */}
          <CommentAuthorSection
            post={post}
            authorName={authorName}
            authorAvatar={authorAvatar}
            onViewProfile={onViewProfile}
            onClose={onClose}
          />

          {/* Post Reaction Stats Bar */}
          <CommentStatsBar
            likesCount={likesCount}
            commentsCount={commentsCount}
            commentsLength={comments.length}
            sharesCount={post.sharesCount}
            topReactionIcons={topReactionIcons}
            language={language}
          />

          {/* Action Buttons: Like, Comment, Share */}
          <CommentActionsBar
            liked={liked}
            userReaction={userReaction}
            showReactions={showReactions}
            setShowReactions={setShowReactions}
            reactionsList={reactionsList}
            onLike={onLike}
            onSelectReaction={onSelectReaction}
            getReactionLabel={getReactionLabel}
            handleShareClick={handleShareClick}
            copied={copied}
            inputRef={inputRef}
            t={t}
            language={language}
          />

          {/* Comments List */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-[#b0b3b8]">
              {language === 'en' ? 'All Comments' : 'Tất cả bình luận'}
            </h4>

            {loadingComments ? (
              <div className="flex items-center justify-center py-8 space-x-2 text-gray-400 text-xs">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>{language === 'en' ? 'Loading comments...' : 'Đang tải bình luận...'}</span>
              </div>
            ) : rootComments.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs font-semibold">
                {language === 'en'
                  ? 'No comments yet. Be the first to comment!'
                  : 'Chưa có bình luận nào. Hãy là người đầu tiên!'}
              </div>
            ) : (
              rootComments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  user={user}
                  replies={getRepliesFor(c.id)}
                  language={language}
                  t={t}
                  onViewProfile={onViewProfile}
                  onClose={onClose}
                  handleStartReply={handleStartReply}
                />
              ))
            )}
            <div ref={commentsEndRef} />
          </div>
        </div>

        {/* Modal Footer / Comment Form */}
        <CommentFormFooter
          user={user}
          isAuthenticated={isAuthenticated}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          commentText={commentText}
          setCommentText={setCommentText}
          submitting={submitting}
          handleSubmit={handleSubmit}
          inputRef={inputRef}
          t={t}
          language={language}
        />
      </div>
    </div>
  );
};
