import React, { useEffect } from 'react';
import { Post, Comment } from '../../../types';
import { useCommentModalData } from './useCommentModalData';
import { CommentModalHeader } from './CommentModalHeader';
import { CommentAuthorSection } from './CommentAuthorSection';
import { CommentStatsBar } from './CommentStatsBar';
import { CommentActionsBar } from './CommentActionsBar';
import { CommentItem } from './CommentItem';
import { CommentFormFooter } from './CommentFormFooter';
import { UserAvatar } from '../../common/UserAvatar';

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
        <CommentModalHeader authorName={authorName} language={language} onClose={onClose} />

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <CommentAuthorSection
            authorName={authorName}
            authorAvatar={authorAvatar}
            post={post}
            onViewProfile={onViewProfile}
            onClose={onClose}
          />

          {post.content && (
            <p className="text-sm text-gray-900 dark:text-[#e4e6eb] whitespace-pre-line leading-relaxed">
              {post.content}
            </p>
          )}

          {/* Shared Post Container */}
          {(post.sharedPost || post.originalPostId) && (
            <div className="my-2 rounded-2xl border border-gray-200 dark:border-[#3e4042] bg-gray-50/50 dark:bg-[#18191a]/40 overflow-hidden">
              {post.sharedPost ? (
                <div className="space-y-2.5 p-3">
                  <div className="flex items-center space-x-2.5">
                    <UserAvatar src={post.sharedPost.authorAvatar} alt={post.sharedPost.authorName} size="sm" />
                    <div>
                      <div className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb]">
                        {post.sharedPost.authorName}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-[#b0b3b8]">
                        {post.sharedPost.createdAt}
                      </div>
                    </div>
                  </div>

                  {post.sharedPost.content && (
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-[#d0d2d6] whitespace-pre-line">
                      {post.sharedPost.content}
                    </p>
                  )}

                  {post.sharedPost.mediaUrls && post.sharedPost.mediaUrls.length > 0 && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-[#393a3b] mt-2">
                      <img
                        src={post.sharedPost.mediaUrls[0]}
                        alt="Shared media"
                        className="w-full max-h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-gray-400">
                  {language === 'en' ? 'Shared post' : 'Bài viết được chia sẻ'}
                </div>
              )}
            </div>
          )}

          {/* Post Media / Images */}
          {!post.originalPostId && post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="rounded-xl overflow-hidden bg-black/5 dark:bg-black/30 my-2">
              {post.mediaUrls.length === 1 ? (
                <img src={post.mediaUrls[0]} alt="Media" className="w-full max-h-[450px] object-cover" />
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {post.mediaUrls.map((url, idx) => (
                    <img key={idx} src={url} alt={`Media ${idx}`} className="w-full h-56 object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}

          <CommentStatsBar
            likesCount={likesCount}
            commentsCount={commentsCount}
            commentsLength={comments.length}
            sharesCount={post.sharesCount || 0}
            topReactionIcons={topReactionIcons}
            language={language}
          />

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
                {language === 'en' ? 'No comments yet. Be the first to comment!' : 'Chưa có bình luận nào. Hãy là người đầu tiên!'}
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

export * from './useCommentModalData';
export * from './CommentModalHeader';
export * from './CommentAuthorSection';
export * from './CommentStatsBar';
export * from './CommentActionsBar';
export * from './CommentItem';
export * from './CommentFormFooter';

