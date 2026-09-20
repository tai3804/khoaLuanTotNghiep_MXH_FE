import React, { useState, useEffect } from 'react';
import { Post } from '../../../types';
import { CommentModal } from '../comment-modal';
import { ShareModal } from '../ShareModal';
import { EditPostModal } from '../EditPostModal';
import { EditAudienceModal } from '../EditAudienceModal';
import { usePostCardData } from './usePostCardData';
import { PostCardHeader } from './PostCardHeader';
import { PostCardContent, isVideo, VideoPlayer } from './PostCardContent';
import { PostCardStatsBar } from './PostCardStatsBar';
import { PostCardActionsBar } from './PostCardActionsBar';
import { PostCardCommentsPreview } from './PostCardCommentsPreview';
import { UserAvatar } from '../../common/UserAvatar';
import { Globe } from 'lucide-react';
import { postService } from '../../../services/api';

export interface PostCardProps {
  post: Post;
  onDeletePost?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onDeletePost,
  onViewProfile,
  onPostUpdated,
}) => {
  const data = usePostCardData({ post, onDeletePost });
  
  const [originalPost, setOriginalPost] = useState<Post | null>(post.sharedPost || null);
  const [loadingOriginalPost, setLoadingOriginalPost] = useState<boolean>(!post.sharedPost && Boolean(post.originalPostId));
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  useEffect(() => {
    if (post.sharedPost) {
      setOriginalPost(post.sharedPost);
      setLoadingOriginalPost(false);
      return;
    }
    if (!post.originalPostId) {
      setOriginalPost(null);
      setLoadingOriginalPost(false);
      return;
    }
    let isMounted = true;
    setLoadingOriginalPost(true);
    postService
      .getPostById(post.originalPostId)
      .then((orig) => {
        if (isMounted && orig) setOriginalPost(orig);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingOriginalPost(false);
      });
    return () => {
      isMounted = false;
    };
  }, [post.originalPostId, post.sharedPost]);

  const handleShareSuccess = () => {
    window.dispatchEvent(new CustomEvent('feed_refresh_needed'));
  };

  const handleOpenShareModal = () => {
    data.setShowOptionsMenu(false);
    setShowShareModal(true);
  };

  const handlePostUpdateSuccess = (updated: Post) => {
    data.handlePostUpdated(updated);
    if (onPostUpdated) onPostUpdated(updated);
  };

  if (data.isDeleting) return null;

  const currentPost = data.currentPost || post;

  return (
    <div id={`post-${currentPost.id}`} className="bg-white dark:bg-[#242526] rounded-xl shadow-sm mb-4 border border-gray-200 dark:border-[#393a3b] transition-colors overflow-hidden">
      <PostCardHeader
        post={currentPost}
        authorName={data.authorName}
        authorAvatar={data.authorAvatar}
        user={data.user}
        saved={data.saved}
        setSaved={data.setSaved}
        copied={data.copied}
        showOptionsMenu={data.showOptionsMenu}
        setShowOptionsMenu={data.setShowOptionsMenu}
        language={data.language}
        onViewProfile={onViewProfile}
        onDeletePost={data.handleDeletePost}
        handleSharePost={handleOpenShareModal}
        handleDeletePost={data.handleDeletePost}
        onEditPost={() => data.setShowEditModal(true)}
        onEditAudience={() => data.setShowAudienceModal(true)}
        isPinned={data.isPinned}
        onTogglePin={data.handleTogglePin}
        onSavePost={data.handleSavePost}
        isMuted={data.isMuted}
        onToggleMute={data.handleToggleMute}
        onArchivePost={data.handleArchivePost}
      />

      <PostCardContent post={currentPost} setShowCommentModal={data.setShowCommentModal} />

      {currentPost.originalPostId && (
        <div className="mx-4 mb-3 rounded-2xl border border-gray-200 dark:border-[#3e4042] bg-gray-50/50 dark:bg-[#242526]/50 overflow-hidden hover:border-gray-300 dark:hover:border-[#4e4f50] transition shadow-xs">
          {loadingOriginalPost ? (
            <div className="p-4 flex items-center space-x-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-2.5 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ) : originalPost ? (
            <div className="space-y-2.5">
              <div className="p-3 pb-0 flex items-center space-x-2.5">
                <div onClick={() => onViewProfile && onViewProfile(originalPost.userId)} className="cursor-pointer hover:opacity-90 transition shrink-0">
                  <UserAvatar src={originalPost.authorAvatar} alt={originalPost.authorName} size="sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div onClick={() => onViewProfile && onViewProfile(originalPost.userId)} className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] hover:underline cursor-pointer truncate">
                    {originalPost.authorName}
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
                    <span>{originalPost.createdAt}</span>
                    <span>·</span>
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
              </div>
              {originalPost.content && (
                <div className="px-3 text-xs sm:text-sm text-gray-800 dark:text-[#d0d2d6] whitespace-pre-line leading-relaxed">
                  {originalPost.content}
                </div>
              )}
              {originalPost.mediaUrls && originalPost.mediaUrls.length > 0 && (
                <div className="w-full overflow-hidden border-t border-gray-100 dark:border-[#393a3b] bg-black/5 dark:bg-black/20">
                  {originalPost.mediaUrls.length === 1 ? (
                    isVideo(originalPost.mediaUrls[0]) ? (
                      <VideoPlayer src={originalPost.mediaUrls[0]} className="w-full max-h-[420px] object-contain bg-black" />
                    ) : (
                      <img src={originalPost.mediaUrls[0]} alt="Original media" className="w-full max-h-[420px] object-cover hover:opacity-95 transition cursor-pointer" onClick={() => data.setShowCommentModal(true)} />
                    )
                  ) : (
                    <div className="grid grid-cols-2 gap-0.5">
                      {originalPost.mediaUrls.map((url, i) => (
                        isVideo(url) ? (
                          <VideoPlayer key={i} src={url} className="w-full h-48 sm:h-56 object-cover bg-black" />
                        ) : (
                          <img key={i} src={url} alt={`Original media ${i}`} className="w-full h-48 sm:h-56 object-cover hover:opacity-95 transition cursor-pointer" onClick={() => data.setShowCommentModal(true)} />
                        )
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400 dark:text-[#b0b3b8]">
              {data.language === 'en' ? 'This shared content is currently unavailable.' : 'Nội dung được chia sẻ này hiện không khả dụng.'}
            </div>
          )}
        </div>
      )}

      <PostCardStatsBar
        likesCount={data.likesCount}
        sharesCount={data.sharesCount}
        totalComments={data.totalComments}
        topReactionIcons={data.topReactionIcons}
        language={data.language}
        setShowCommentModal={data.setShowCommentModal}
      />

      <div className="mx-3 border-t border-gray-200 dark:border-[#393a3b]" />

      <PostCardActionsBar
        liked={data.liked}
        reaction={data.reaction}
        showReactionsMenu={data.showReactionsMenu}
        setShowReactionsMenu={data.setShowReactionsMenu}
        reactionsList={data.reactionsList}
        handleLike={data.handleLike}
        handleSelectReaction={data.handleSelectReaction}
        getReactionLabel={data.getReactionLabel}
        handleSharePost={handleOpenShareModal}
        copied={data.copied}
        setShowCommentModal={data.setShowCommentModal}
        t={data.t}
        language={data.language}
      />

      <PostCardCommentsPreview
        displayedComments={data.displayedComments}
        totalComments={data.totalComments}
        user={data.user}
        isAuthenticated={data.isAuthenticated}
        openLoginModal={data.openLoginModal}
        inlineCommentText={data.inlineCommentText}
        setInlineCommentText={data.setInlineCommentText}
        handleInlineCommentSubmit={data.handleInlineCommentSubmit}
        setShowCommentModal={data.setShowCommentModal}
        onViewProfile={onViewProfile}
        t={data.t}
        language={data.language}
      />

      <CommentModal
        isOpen={data.showCommentModal}
        onClose={() => data.setShowCommentModal(false)}
        post={{ ...currentPost, sharedPost: originalPost || currentPost.sharedPost }}
        authorName={data.authorName || currentPost.authorName || 'Thành viên'}
        authorAvatar={data.authorAvatar || currentPost.authorAvatar || ''}
        liked={data.liked}
        likesCount={data.likesCount}
        commentsCount={data.totalComments}
        comments={data.comments}
        loadingComments={data.loadingComments}
        onLike={data.handleLike}
        onSelectReaction={data.handleSelectReaction}
        onSubmitComment={data.submitCommentText}
        onViewProfile={onViewProfile}
        onShare={handleOpenShareModal}
        userReaction={data.reaction}
        topReactionIcons={data.topReactionIcons}
      />

      <ShareModal
        post={currentPost}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShareSuccess={handleShareSuccess}
      />

      {/* Edit Post Modal */}
      {data.showEditModal && (
        <EditPostModal
          isOpen={data.showEditModal}
          post={currentPost}
          authorName={data.authorName || currentPost.authorName || 'Thành viên'}
          authorAvatar={data.authorAvatar || currentPost.authorAvatar || ''}
          onClose={() => data.setShowEditModal(false)}
          onPostUpdated={handlePostUpdateSuccess}
        />
      )}

      {/* Edit Audience Modal */}
      {data.showAudienceModal && (
        <EditAudienceModal
          isOpen={data.showAudienceModal}
          currentPrivacy={(currentPost.privacy as any) || 'PUBLIC'}
          onClose={() => data.setShowAudienceModal(false)}
          onSave={data.handleUpdateAudience}
        />
      )}
    </div>
  );
};

export * from './usePostCardData';
export * from './PostCardHeader';
export * from './PostCardContent';
export * from './PostCardStatsBar';
export * from './PostCardActionsBar';
export * from './PostCardCommentsPreview';

