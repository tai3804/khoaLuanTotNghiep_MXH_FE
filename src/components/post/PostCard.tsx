import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Post, Comment } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { postService, fetchAuthorProfile } from '../../services/api';
import { CommentModal } from './CommentModal';
import {
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Globe,
  Send,
  CornerDownRight,
  Smile,
  Copy,
  Check,
  Trash2,
  X,
  ThumbsUp,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onDeletePost?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDeletePost, onViewProfile }) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t, language } = useLanguage();
  const toast = useToast();

  const [liked, setLiked] = useState<boolean>(post.isLiked || false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount ?? 0);
  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount ?? 0);
  const [sharesCount, setSharesCount] = useState<number>(post.sharesCount ?? 0);
  const [reaction, setReaction] = useState<string>('👍');
  const [activeReactions, setActiveReactions] = useState<string[]>([]);
  const [showReactionsMenu, setShowReactionsMenu] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [inlineCommentText, setInlineCommentText] = useState<string>('');
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [authorName, setAuthorName] = useState<string>(
    post.authorName && post.authorName !== 'Thành viên KLTN' ? post.authorName : ''
  );
  const [authorAvatar, setAuthorAvatar] = useState<string>(post.authorAvatar || '');

  useEffect(() => {
    setLikesCount(post.likesCount ?? 0);
  }, [post.likesCount]);

  useEffect(() => {
    setCommentsCount(post.commentsCount ?? 0);
  }, [post.commentsCount]);

  useEffect(() => {
    setSharesCount(post.sharesCount ?? 0);
  }, [post.sharesCount]);

  useEffect(() => {
    if (user && (post.userId === user.id || post.userId === 'me')) {
      setAuthorName(user.fullName || user.username);
      if (user.avatar) setAuthorAvatar(user.avatar);
      return;
    }

    if (post.authorName && post.authorName !== 'Thành viên KLTN') {
      setAuthorName(post.authorName);
    }
    if (post.authorAvatar) {
      setAuthorAvatar(post.authorAvatar);
    }
    if (!authorName || authorName === 'Thành viên KLTN') {
      fetchAuthorProfile(post.userId).then((profile) => {
        if (profile) {
          if (profile.name) setAuthorName(profile.name);
          if (profile.avatar) setAuthorAvatar(profile.avatar);
        }
      });
    }
  }, [post.userId, post.authorName, post.authorAvatar, user]);

  const getStoredReaction = (postId: string, userId?: string) => {
    try {
      const key = `user_reactions_${userId || 'guest'}`;
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      return stored[postId] || null;
    } catch {
      return null;
    }
  };

  const setStoredReaction = (postId: string, isLiked: boolean, emoji: string, userId?: string) => {
    try {
      const key = `user_reactions_${userId || 'guest'}`;
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      if (isLiked) {
        stored[postId] = { liked: true, reaction: emoji };
      } else {
        delete stored[postId];
      }
      localStorage.setItem(key, JSON.stringify(stored));
    } catch {}
  };

  const reactionTypeToEmoji: Record<string, string> = {
    LIKE: '👍',
    LOVE: '❤️',
    HAHA: '😆',
    WOW: '😮',
    SAD: '😢',
    ANGRY: '😡',
  };

  useEffect(() => {
    // Restore from localStorage first
    const local = getStoredReaction(post.id, user?.id);
    if (local) {
      setLiked(local.liked);
      if (local.reaction) setReaction(local.reaction);
    } else if (post.isLiked) {
      setLiked(true);
    }

    // Sync with backend API
    if (isAuthenticated && post.id) {
      postService
        .getReactions(post.id)
        .then((reactions) => {
          if (Array.isArray(reactions) && reactions.length > 0) {
            const types = Array.from(
              new Set(reactions.map((r: any) => reactionTypeToEmoji[r.type] || '👍'))
            );
            setActiveReactions(types);
          } else {
            setActiveReactions([]);
          }
          const myReaction = reactions.find(
            (r: any) => String(r.userId || r.authorId) === String(user?.id)
          );
          if (myReaction) {
            setLiked(true);
            const emoji = reactionTypeToEmoji[myReaction.type] || '👍';
            setReaction(emoji);
            setStoredReaction(post.id, true, emoji, user?.id);
            setActiveReactions((prev) => Array.from(new Set([...prev, emoji])));
          } else {
            setLiked(false);
            setStoredReaction(post.id, false, '👍', user?.id);
          }
        })
        .catch(() => {});
    }
  }, [post.id, user?.id, isAuthenticated, post.isLiked]);

  // Fetch initial comments automatically
  useEffect(() => {
    let isMounted = true;
    setLoadingComments(true);
    postService
      .getComments(post.id)
      .then((fetched) => {
        if (isMounted && Array.isArray(fetched)) {
          setComments(fetched);
          setCommentsCount((prev) => Math.max(prev, fetched.length));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingComments(false);
      });
    return () => {
      isMounted = false;
    };
  }, [post.id]);

  const reactionsMap: Record<string, 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'> = {
    '👍': 'LIKE',
    '❤️': 'LOVE',
    '😆': 'HAHA',
    '😮': 'WOW',
    '😢': 'SAD',
    '😡': 'ANGRY',
  };
  const reactionsList = ['👍', '❤️', '😆', '😮', '😢', '😡'];

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

  const handleLike = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    setStoredReaction(post.id, nextLiked, reaction, user?.id);
    if (nextLiked) {
      setActiveReactions((prev) => Array.from(new Set([...prev, reaction])));
    } else {
      setActiveReactions((prev) => prev.filter((r) => r !== reaction));
    }
    const type = reactionsMap[reaction] || 'LIKE';
    try {
      if (nextLiked) {
        await postService.reactPost(post.id, type);
      } else {
        await postService.removeReaction(post.id, type);
      }
    } catch {
      // optimistic update fallback
    }
  };

  const handleSelectReaction = async (reactEmoji: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    const prevReaction = reaction;
    setReaction(reactEmoji);
    setShowReactionsMenu(false);
    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
    setStoredReaction(post.id, true, reactEmoji, user?.id);
    setActiveReactions((prev) => {
      const filtered = prev.filter((r) => r !== prevReaction);
      return Array.from(new Set([...filtered, reactEmoji]));
    });
    const type = reactionsMap[reactEmoji] || 'LIKE';
    try {
      await postService.reactPost(post.id, type);
    } catch {
      // ignore
    }
  };

  const submitCommentText = async (text: string, parentCommentId?: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!text.trim()) return;

    try {
      const added = await postService.addComment(post.id, text.trim(), undefined, parentCommentId);
      setComments((prev) => [...prev, added]);
      setCommentsCount((prev) => prev + 1);
    } catch {
      const fallback: Comment = {
        id: 'comment-' + Date.now(),
        postId: post.id,
        userId: user?.id || 'me',
        authorName: user?.fullName || user?.username || 'Bạn',
        authorAvatar: user?.avatar || '',
        content: text.trim(),
        createdAt: 'Vừa xong',
        likesCount: 0,
        parentCommentId,
      };
      setComments((prev) => [...prev, fallback]);
      setCommentsCount((prev) => prev + 1);
    }
  };

  const handleInlineCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineCommentText.trim()) return;
    const text = inlineCommentText.trim();
    setInlineCommentText('');
    await submitCommentText(text);
  };

  const handleDeletePost = async () => {
    if (!window.confirm(language === 'en' ? 'Are you sure you want to delete this post?' : 'Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      if (onDeletePost) onDeletePost(post.id);
      toast.showSuccess(language === 'en' ? 'Post deleted successfully!' : 'Đã xóa bài viết thành công!');
    } catch (err: any) {
      toast.showError((language === 'en' ? 'Could not delete post: ' : 'Không thể xóa bài viết: ') + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSharePost = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setSharesCount((prev) => prev + 1);
    toast.showSuccess(language === 'en' ? 'Post link copied to clipboard!' : 'Đã sao chép liên kết bài viết!');
    setTimeout(() => setCopied(false), 2000);
    setShowOptionsMenu(false);
  };

  if (isDeleting) {
    return null;
  }

  // Top reaction icons display: only show reactions that actually exist
  const topReactionIcons = activeReactions.length > 0
    ? activeReactions.slice(0, 3)
    : liked
    ? [reaction]
    : ['👍'];

  const rootComments = comments.filter((c) => !c.parentCommentId);
  const displayedComments = rootComments.slice(-3);
  const totalComments = Math.max(comments.length, commentsCount);

  return (
    <div
      id={`post-${post.id}`}
      className="bg-white dark:bg-[#242526] rounded-xl shadow-sm mb-4 border border-gray-200 dark:border-[#393a3b] transition-colors overflow-hidden"
    >
      {/* Header section matching Facebook */}
      <div className="p-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            onClick={() => {
              if (onViewProfile && post.userId) onViewProfile(post.userId);
            }}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <UserAvatar src={authorAvatar || post.authorAvatar} alt={authorName || post.authorName} size="md" className="w-10 h-10 rounded-full" />
          </div>
          <div>
            <h4
              onClick={() => {
                if (onViewProfile && post.userId) onViewProfile(post.userId);
              }}
              className="font-bold text-gray-900 dark:text-[#e4e6eb] text-sm hover:underline cursor-pointer leading-tight"
            >
              {authorName || post.authorName || 'Thành viên'}
            </h4>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
              <span>{post.createdAt || 'Vừa xong'}</span>
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Top Right Actions: Options & Close */}
        <div className="flex items-center space-x-1">
          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showOptionsMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl p-1 z-30">
                <button
                  onClick={() => {
                    setSaved(!saved);
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'text-amber-500 fill-amber-500' : ''}`} />
                  <span>{saved ? (language === 'en' ? 'Unsave post' : 'Bỏ lưu bài viết') : (language === 'en' ? 'Save post' : 'Lưu bài viết')}</span>
                </button>
                <button
                  onClick={handleSharePost}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-blue-500" />}
                  <span>{copied ? (language === 'en' ? 'Link copied!' : 'Đã chép liên kết!') : (language === 'en' ? 'Copy link' : 'Sao chép liên kết')}</span>
                </button>
                {user && (user.id === post.userId || post.userId === 'me') && (
                  <button
                    onClick={handleDeletePost}
                    className="w-full flex items-center space-x-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>{language === 'en' ? 'Delete post' : 'Xóa bài viết'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (onDeletePost) onDeletePost(post.id);
            }}
            className="text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
            title={language === 'en' ? 'Hide post' : 'Ẩn bài viết'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Post Text Content */}
      {post.content && (
        <div className="px-4 pb-2.5 text-sm text-gray-900 dark:text-[#e4e6eb] leading-normal whitespace-pre-line">
          {post.content}
        </div>
      )}

      {/* Media Image Grid Gallery */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="w-full bg-black/5 dark:bg-black/40 overflow-hidden cursor-pointer" onClick={() => setShowCommentModal(true)}>
          {post.mediaUrls.length === 1 ? (
            <img src={post.mediaUrls[0]} alt="Post media" className="w-full max-h-[550px] object-cover hover:opacity-95 transition" />
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((url, i) => (
                <img key={i} src={url} alt={`Media ${i}`} className="w-full h-64 object-cover hover:opacity-95 transition" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Reaction & Comment Stats (Max 3 Reaction Icons) */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-[#b0b3b8]">
        <div className="flex items-center space-x-1.5 min-h-[20px]">
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
              <span className="text-gray-600 dark:text-[#b0b3b8] text-xs font-semibold">
                {likesCount}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 dark:text-[#b0b3b8]/60 text-xs">
              {language === 'en' ? 'Be the first to react' : 'Hãy là người đầu tiên thích'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-[#b0b3b8]">
          <button onClick={() => setShowCommentModal(true)} className="hover:underline cursor-pointer font-medium">
            {totalComments} {language === 'en' ? 'comments' : 'bình luận'}
          </button>
          <span className="font-medium">{sharesCount} {language === 'en' ? 'shares' : 'lượt chia sẻ'}</span>
        </div>
      </div>

      <div className="mx-3 border-t border-gray-200 dark:border-[#393a3b]" />

      {/* Post Actions Bar (Like, Comment, Share) */}
      <div className="px-2 py-1 flex items-center justify-around">
        {/* Like Button with Reactions Container */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionsMenu(true)}
          onMouseLeave={() => setShowReactionsMenu(false)}
        >
          {/* Reactions floating tooltip menu with seamless hover bridge */}
          {showReactionsMenu && (
            <div
              className="absolute -top-14 left-0 pb-3 z-50 cursor-pointer"
              onMouseEnter={() => setShowReactionsMenu(true)}
              onMouseLeave={() => setShowReactionsMenu(false)}
            >
              <div className="bg-white dark:bg-[#242526] rounded-full shadow-2xl px-4 py-2 flex items-center space-x-2 sm:space-x-2.5 transition-all duration-200 animate-fade-in border-0">
                {reactionsList.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectReaction(emoji);
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
            onClick={handleLike}
            className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold transition cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3b3c] ${
              liked
                ? 'text-[#2d88ff]'
                : 'text-gray-600 dark:text-[#b0b3b8]'
            }`}
          >
            {liked ? (
              <span className="text-base">{reaction || '👍'}</span>
            ) : (
              <ThumbsUp className="w-5 h-5" />
            )}
            <span>{liked ? getReactionLabel(reaction) : (t('like') || 'Thích')}</span>
          </button>
        </div>

        {/* Comment Button (Opens Comment Modal) */}
        <button
          onClick={() => setShowCommentModal(true)}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t('comment') || 'Bình luận'}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleSharePost}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span>{copied ? (language === 'en' ? 'Copied!' : 'Đã chép!') : (t('share') || 'Chia sẻ')}</span>
        </button>
      </div>

      {/* Top 2 Comments Preview Section */}
      <div className="p-3 bg-gray-50/60 dark:bg-[#242526] space-y-2.5 border-t border-gray-200 dark:border-[#393a3b]">
        {displayedComments.length > 0 && (
          <div className="space-y-2">
            {displayedComments.map((comment) => {
              const displayName =
                (comment.userId === user?.id || comment.userId === 'me') && user?.fullName
                  ? user.fullName
                  : comment.authorName || 'Thành viên KLTN';
              const displayAvatar =
                (comment.userId === user?.id || comment.userId === 'me') && user?.avatar
                  ? user.avatar
                  : comment.authorAvatar;

              return (
                <div key={comment.id} className="flex space-x-2.5 items-start">
                  <div
                    onClick={() => {
                      if (onViewProfile && comment.userId) onViewProfile(comment.userId);
                    }}
                    className="cursor-pointer shrink-0"
                  >
                    <UserAvatar src={displayAvatar} alt={displayName} size="sm" className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-[#3a3b3c] p-2.5 px-3 rounded-2xl inline-block max-w-full">
                      <h5
                        onClick={() => {
                          if (onViewProfile && comment.userId) onViewProfile(comment.userId);
                        }}
                        className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] cursor-pointer hover:underline"
                      >
                        {displayName}
                      </h5>
                      <p className="text-xs text-gray-800 dark:text-[#e4e6eb] mt-0.5 leading-relaxed break-words">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-0.5 ml-2 font-semibold">
                      <button className="hover:underline hover:text-[#2d88ff] cursor-pointer">{t('like') || 'Thích'}</button>
                      <span>•</span>
                      <button
                        onClick={() => setShowCommentModal(true)}
                        className="hover:underline hover:text-[#2d88ff] flex items-center space-x-1 cursor-pointer"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>{language === 'en' ? 'Reply' : 'Phản hồi'}</span>
                      </button>
                      <span>•</span>
                      <span>{comment.createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All / More Comments button if > 2 comments */}
        {totalComments > 2 && (
          <button
            onClick={() => setShowCommentModal(true)}
            className="text-xs font-semibold text-gray-500 dark:text-[#b0b3b8] hover:underline cursor-pointer pl-1 py-1 block"
          >
            {language === 'en'
              ? `View all ${totalComments} comments...`
              : `Xem tất cả ${totalComments} bình luận...`}
          </button>
        )}

        {/* Inline Quick Comment Input Form */}
        <form onSubmit={handleInlineCommentSubmit} className="flex items-center space-x-2 pt-1">
          <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="sm" className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              value={inlineCommentText}
              onChange={(e) => setInlineCommentText(e.target.value)}
              onClick={() => {
                if (!isAuthenticated) openLoginModal();
              }}
              placeholder={!isAuthenticated ? (language === 'en' ? 'Log in to comment...' : 'Đăng nhập để bình luận...') : (t('writeComment') || 'Viết bình luận...')}
              className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full pl-4 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
            />
            <button
              type="button"
              onClick={() => setShowCommentModal(true)}
              className="absolute right-3 text-gray-400 hover:text-amber-500 cursor-pointer"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!inlineCommentText.trim()}
            className="p-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full disabled:opacity-40 transition shadow-sm cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Clean Standalone Comment Modal Component */}
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
