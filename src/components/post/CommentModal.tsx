import React, { useState, useEffect, useRef } from 'react';
import { Post, Comment } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Globe,
  ThumbsUp,
  MessageCircle,
  Share2,
  Send,
  Smile,
  CornerDownRight,
} from 'lucide-react';

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
}) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; authorName: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [copied, setCopied] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reactionsList = ['👍', '❤️', '😆', '😮', '😢', '😡'];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!commentText.trim() || submitting) return;

    const text = commentText.trim();
    setCommentText('');
    setSubmitting(true);
    try {
      await onSubmitComment(text, replyingTo?.id);
      setReplyingTo(null);
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch {
      // handled upstream
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.showSuccess(language === 'en' ? 'Link copied to clipboard!' : 'Đã sao chép liên kết bài viết!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartReply = (commentId: string, author: string) => {
    setReplyingTo({ id: commentId, authorName: author });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getReactionLabel = (emoji: string) => {
    switch (emoji) {
      case '❤️': return language === 'en' ? 'Love' : 'Yêu thích';
      case '😆': return 'Haha';
      case '😮': return 'Wow';
      case '😢': return language === 'en' ? 'Sad' : 'Buồn';
      case '😡': return language === 'en' ? 'Angry' : 'Phẫn nộ';
      default: return language === 'en' ? 'Like' : 'Thích';
    }
  };

  // Top 3 reaction icons display
  const topReactionIcons = Array.from(new Set([liked ? userReaction : '👍', '❤️', '😆'])).slice(0, 3);

  const rootComments = comments.filter((c) => !c.parentCommentId);
  const getRepliesFor = (parentId: string) =>
    comments.filter((c) => c.parentCommentId && String(c.parentCommentId) === String(parentId));

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in cursor-pointer">
      {/* Modal Box */}
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#242526] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-[#393a3b] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-4 py-3.5 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-center shrink-0">
          <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
            {language === 'en' ? `Post by ${authorName}` : `Bài viết của ${authorName}`}
          </h3>
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#e4e6eb] flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Post Author Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                onClick={() => {
                  if (onViewProfile && post.userId) {
                    onClose();
                    onViewProfile(post.userId);
                  }
                }}
                className="cursor-pointer hover:opacity-90 transition"
              >
                <UserAvatar src={authorAvatar} alt={authorName} size="md" className="w-10 h-10 rounded-full" />
              </div>
              <div>
                <h4
                  onClick={() => {
                    if (onViewProfile && post.userId) {
                      onClose();
                      onViewProfile(post.userId);
                    }
                  }}
                  className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb] hover:underline cursor-pointer leading-tight"
                >
                  {authorName}
                </h4>
                <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                  <span>{post.createdAt || 'Vừa xong'}</span>
                  <span>•</span>
                  <Globe className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Post Text */}
          {post.content && (
            <p className="text-sm text-gray-900 dark:text-[#e4e6eb] whitespace-pre-line leading-relaxed">
              {post.content}
            </p>
          )}

          {/* Post Media / Images */}
          {post.mediaUrls && post.mediaUrls.length > 0 && (
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

          {/* Post Reaction Stats Bar - Max 3 Icons Display */}
          <div className="py-2 px-1 flex items-center justify-between border-t border-b border-gray-100 dark:border-[#393a3b] text-xs text-gray-500 dark:text-[#b0b3b8]">
            <div className="flex items-center space-x-1.5">
              {likesCount > 0 ? (
                <div className="flex items-center space-x-1.5">
                  <div className="flex items-center -space-x-1">
                    {topReactionIcons.map((ico, idx) => (
                      <span
                        key={ico}
                        className="text-sm sm:text-base leading-none select-none drop-shadow-sm"
                        style={{ zIndex: 30 - idx * 10 }}
                      >
                        {ico}
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-[#e4e6eb]">{likesCount}</span>
                </div>
              ) : (
                <span className="text-gray-400 dark:text-[#b0b3b8]">
                  {language === 'en' ? 'Be the first to react' : 'Hãy là người đầu tiên thích'}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 font-medium">
              <span>{Math.max(comments.length, commentsCount)} {language === 'en' ? 'comments' : 'bình luận'}</span>
              <span>{post.sharesCount || 0} {language === 'en' ? 'shares' : 'lượt chia sẻ'}</span>
            </div>
          </div>

          {/* Action Buttons: Like, Comment, Share */}
          <div className="flex items-center justify-around py-1 relative border-b border-gray-100 dark:border-[#393a3b]">
            {/* Like button with reaction menu */}
            <div
              className="relative flex-1"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              {showReactions && (
                <div
                  className="absolute -top-14 left-0 pb-3 z-50 cursor-pointer"
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                >
                  <div className="bg-white dark:bg-[#242526] rounded-full shadow-2xl px-4 py-2 flex items-center space-x-2 sm:space-x-2.5 transition-all duration-200 animate-fade-in border-0">
                    {reactionsList.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onSelectReaction(emoji);
                          setShowReactions(false);
                        }}
                        className="text-2xl sm:text-3xl hover:scale-135 hover:-translate-y-2 transition-all duration-150 cursor-pointer p-1.5 transform origin-bottom"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={onLike}
                className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold transition cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3b3c] ${
                  liked ? 'text-[#2d88ff]' : 'text-gray-600 dark:text-[#b0b3b8]'
                }`}
              >
                {liked ? (
                  <span className="text-base">{userReaction || '👍'}</span>
                ) : (
                  <ThumbsUp className="w-5 h-5" />
                )}
                <span>{liked ? getReactionLabel(userReaction) : (t('like') || 'Thích')}</span>
              </button>
            </div>

            <button
              onClick={() => {
                if (inputRef.current) inputRef.current.focus();
              }}
              className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t('comment') || 'Bình luận'}</span>
            </button>

            <button
              onClick={handleShareClick}
              className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
              <span>{copied ? (language === 'en' ? 'Copied!' : 'Đã chép!') : (t('share') || 'Chia sẻ')}</span>
            </button>
          </div>

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
                {language === 'en' ? 'No comments yet. Be the first to comment!' : 'Chưa có bình luận nào. Hãy là người đầu tiên!'}
              </div>
            ) : (
              rootComments.map((c) => {
                const displayName =
                  (c.userId === user?.id || c.userId === 'me') && user?.fullName
                    ? user.fullName
                    : c.authorName || 'Thành viên KLTN';
                const displayAvatar =
                  (c.userId === user?.id || c.userId === 'me') && user?.avatar
                    ? user.avatar
                    : c.authorAvatar;
                const replies = getRepliesFor(c.id);

                return (
                  <div key={c.id} className="space-y-2">
                    {/* Main Comment */}
                    <div className="flex space-x-2.5 items-start group">
                      <div
                        onClick={() => {
                          if (onViewProfile && c.userId) {
                            onClose();
                            onViewProfile(c.userId);
                          }
                        }}
                        className="cursor-pointer shrink-0"
                      >
                        <UserAvatar src={displayAvatar} alt={displayName} size="sm" className="w-8.5 h-8.5 rounded-full" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-[#3a3b3c] p-3 rounded-2xl inline-block max-w-full">
                          <h5
                            onClick={() => {
                              if (onViewProfile && c.userId) {
                                onClose();
                                onViewProfile(c.userId);
                              }
                            }}
                            className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] cursor-pointer hover:underline"
                          >
                            {displayName}
                          </h5>
                          <p className="text-xs text-gray-800 dark:text-[#e4e6eb] mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                            {c.content}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-1 ml-2 font-semibold">
                          <button className="hover:underline hover:text-[#2d88ff] cursor-pointer">{t('like') || 'Thích'}</button>
                          <span>•</span>
                          <button
                            onClick={() => handleStartReply(c.id, displayName)}
                            className="hover:underline hover:text-[#2d88ff] flex items-center space-x-1 cursor-pointer"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            <span>{language === 'en' ? 'Reply' : 'Phản hồi'}</span>
                          </button>
                          <span>•</span>
                          <span>{c.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                      <div className="ml-9 pl-3 border-l-2 border-gray-200 dark:border-[#393a3b] space-y-2.5 mt-2">
                        {replies.map((reply) => {
                          const rName =
                            (reply.userId === user?.id || reply.userId === 'me') && user?.fullName
                              ? user.fullName
                              : reply.authorName || 'Thành viên KLTN';
                          const rAvatar =
                            (reply.userId === user?.id || reply.userId === 'me') && user?.avatar
                              ? user.avatar
                              : reply.authorAvatar;

                          return (
                            <div key={reply.id} className="flex space-x-2.5 items-start">
                              <UserAvatar src={rAvatar} alt={rName} size="sm" className="w-7 h-7 rounded-full shrink-0" />
                              <div className="flex-1">
                                <div className="bg-gray-100 dark:bg-[#3a3b3c] p-2.5 rounded-2xl inline-block max-w-full">
                                  <h6 className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] cursor-pointer hover:underline">
                                    {rName}
                                  </h6>
                                  <p className="text-xs text-gray-800 dark:text-[#e4e6eb] mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                                    {reply.content}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-3 text-[10px] text-gray-500 dark:text-[#b0b3b8] mt-0.5 ml-2 font-semibold">
                                  <button className="hover:underline hover:text-[#2d88ff] cursor-pointer">{t('like') || 'Thích'}</button>
                                  <span>•</span>
                                  <button
                                    onClick={() => handleStartReply(c.id, rName)}
                                    className="hover:underline hover:text-[#2d88ff] cursor-pointer"
                                  >
                                    {language === 'en' ? 'Reply' : 'Phản hồi'}
                                  </button>
                                  <span>•</span>
                                  <span>{reply.createdAt}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={commentsEndRef} />
          </div>
        </div>

        {/* Modal Footer / Comment Form */}
        <div className="p-3 border-t border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] shrink-0 space-y-1.5">
          {/* Replying banner indicator */}
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg">
              <span>{language === 'en' ? `Replying to ${replyingTo.authorName}` : `Đang phản hồi ${replyingTo.authorName}`}</span>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-xs hover:underline cursor-pointer font-bold ml-2 text-red-500"
              >
                {language === 'en' ? 'Cancel' : 'Hủy'}
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="sm" className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  !isAuthenticated
                    ? (language === 'en' ? 'Log in to comment...' : 'Đăng nhập để bình luận...')
                    : replyingTo
                    ? (language === 'en' ? `Reply to ${replyingTo.authorName}...` : `Trả lời ${replyingTo.authorName}...`)
                    : (t('writeComment') || 'Viết bình luận...')
                }
                className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full pl-4 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
              />
              <button
                type="button"
                className="absolute right-3 text-gray-400 hover:text-amber-500 cursor-pointer"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!commentText.trim() || submitting}
              className="p-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full disabled:opacity-40 transition shadow-md cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
