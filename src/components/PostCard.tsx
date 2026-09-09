import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Post, Comment } from '../types';
import { UserAvatar } from './UserAvatar';
import { postService, fetchAuthorProfile } from '../services/api';
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
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onDeletePost?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onDeletePost, onViewProfile }) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();

  const [liked, setLiked] = useState<boolean>(post.isLiked || false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount ?? 0);
  const [commentsCount, setCommentsCount] = useState<number>(post.commentsCount ?? 0);
  const [reaction, setReaction] = useState<string>('👍');
  const [showReactionsMenu, setShowReactionsMenu] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
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

  const reactionsMap: Record<string, 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'> = {
    '👍': 'LIKE',
    '❤️': 'LOVE',
    '😆': 'HAHA',
    '😮': 'WOW',
    '😢': 'SAD',
    '😡': 'ANGRY',
  };
  const reactionsList = ['👍', '❤️', '😆', '😮', '😢', '😡'];

  const handleLike = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    try {
      if (nextLiked) {
        await postService.reactPost(post.id, 'LIKE');
      } else {
        await postService.removeReaction(post.id);
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
    setReaction(reactEmoji);
    setShowReactionsMenu(false);
    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
    const type = reactionsMap[reactEmoji] || 'LIKE';
    try {
      await postService.reactPost(post.id, type);
    } catch {
      // ignore
    }
  };

  const handleToggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      setLoadingComments(true);
      try {
        const fetched = await postService.getComments(post.id);
        setComments(fetched);
        if (fetched.length > 0) {
          setCommentsCount((prev) => Math.max(prev, fetched.length));
        }
      } catch {
        // ignore
      } finally {
        setLoadingComments(false);
      }
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!commentText.trim()) return;

    const text = commentText.trim();
    setCommentText('');

    try {
      const added = await postService.addComment(post.id, text);
      setComments((prev) => [...prev, added]);
      setCommentsCount((prev) => prev + 1);
    } catch {
      const fallback: Comment = {
        id: 'comment-' + Date.now(),
        postId: post.id,
        userId: user?.id || 'me',
        authorName: user?.fullName || user?.username || 'Bạn',
        authorAvatar: user?.avatar || '',
        content: text,
        createdAt: 'Vừa xong',
        likesCount: 0,
      };
      setComments((prev) => [...prev, fallback]);
      setCommentsCount((prev) => prev + 1);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      if (onDeletePost) onDeletePost(post.id);
    } catch (err: any) {
      alert('Không thể xóa bài viết: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowOptionsMenu(false);
  };

  if (isDeleting) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4 border border-gray-200 dark:border-slate-700 transition-colors overflow-hidden hover:shadow-md">
      {/* Header section */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            onClick={() => {
              if (onViewProfile && post.userId) onViewProfile(post.userId);
            }}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <UserAvatar src={authorAvatar || post.authorAvatar} alt={authorName || post.authorName} size="md" />
          </div>
          <div>
            <h4
              onClick={() => {
                if (onViewProfile && post.userId) onViewProfile(post.userId);
              }}
              className="font-bold text-gray-900 dark:text-slate-100 text-sm hover:underline cursor-pointer"
            >
              {authorName || post.authorName || 'Thành viên'}
            </h4>
            <div className="flex items-center space-x-1.5 text-xs text-gray-400 dark:text-slate-400 mt-0.5">
              <span>{post.createdAt}</span>
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Options Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-full transition"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl p-1 z-30">
              <button
                onClick={() => {
                  setSaved(!saved);
                  setShowOptionsMenu(false);
                }}
                className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'text-amber-500 fill-amber-500' : ''}`} />
                <span>{saved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-slate-200 transition"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-blue-500" />}
                <span>{copied ? 'Đã chép liên kết!' : 'Sao chép liên kết'}</span>
              </button>
              {user && (user.id === post.userId || post.userId === 'me') && (
                <button
                  onClick={handleDeletePost}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 rounded-xl text-xs font-semibold transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>Xóa bài viết</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Content */}
      <div className="px-4 pb-3 text-sm text-gray-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>

      {/* Media Image Grid Gallery */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="w-full bg-black/5 dark:bg-black/20">
          {post.mediaUrls.length === 1 ? (
            <img src={post.mediaUrls[0]} alt="Post media" className="w-full max-h-[500px] object-cover" />
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((url, i) => (
                <img key={i} src={url} alt={`Media ${i}`} className="w-full h-64 object-cover" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-slate-700/60">
        <div className="flex items-center space-x-1.5 min-h-[20px]">
          {likesCount > 0 ? (
            <div className="flex items-center space-x-1.5">
              <span className="bg-blue-600 text-white p-1 rounded-full text-[10px] shadow-sm flex items-center justify-center w-4 h-4">
                {liked ? reaction : '👍'}
              </span>
              <span className="font-semibold text-gray-700 dark:text-slate-300">
                {likesCount} {t('likes') || 'lượt thích'}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 dark:text-slate-500 text-[11px]">Chưa có lượt thích</span>
          )}
        </div>
        <div className="flex items-center space-x-3 font-medium">
          <button onClick={handleToggleComments} className="hover:underline">
            {Math.max(comments.length, commentsCount)} {t('comments') || 'bình luận'}
          </button>
          <span>{post.sharesCount || 0} {t('shares') || 'chia sẻ'}</span>
        </div>
      </div>

      {/* Post Actions Bar */}
      <div className="px-2 py-1 flex items-center justify-around border-b border-gray-100 dark:border-slate-700/60">
        {/* Like Button with Reactions Container */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionsMenu(true)}
          onMouseLeave={() => setShowReactionsMenu(false)}
        >
          {/* Reactions floating tooltip menu */}
          {showReactionsMenu && (
            <div
              className="absolute -top-12 left-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-2xl px-2.5 py-1.5 flex items-center space-x-1.5 z-40 animate-bounce-short"
              onMouseEnter={() => setShowReactionsMenu(true)}
              onMouseLeave={() => setShowReactionsMenu(false)}
            >
              {reactionsList.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectReaction(emoji);
                  }}
                  className="text-xl hover:scale-135 transition-transform duration-150 cursor-pointer p-0.5"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleLike}
            className={`w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              liked
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <span className="text-base">{liked ? reaction : '👍'}</span>
            <span>{t('like') || 'Thích'}</span>
          </button>
        </div>

        {/* Comment Button */}
        <button
          onClick={handleToggleComments}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 text-gray-500" />
          <span>{t('comment') || 'Bình luận'}</span>
        </button>

        {/* Share Button */}
        <button className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
          <Share2 className="w-4 h-4 text-gray-500" />
          <span>{t('share') || 'Chia sẻ'}</span>
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="p-4 bg-gray-50/70 dark:bg-slate-900/40 space-y-3 border-t border-gray-100 dark:border-slate-700/60">
          {loadingComments ? (
            <div className="flex items-center justify-center py-4 space-x-2 text-gray-400 text-xs font-semibold">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Đang tải bình luận...</span>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-2">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          ) : (
            comments.map((comment) => {
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
                    className="cursor-pointer"
                  >
                    <UserAvatar src={displayAvatar} alt={displayName} size="sm" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-200/70 dark:border-slate-700 inline-block shadow-sm">
                      <h5
                        onClick={() => {
                          if (onViewProfile && comment.userId) onViewProfile(comment.userId);
                        }}
                        className="font-bold text-xs text-gray-900 dark:text-slate-100 cursor-pointer hover:underline"
                      >
                        {displayName}
                      </h5>
                      <p className="text-xs text-gray-800 dark:text-slate-200 mt-1 leading-relaxed">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-gray-400 dark:text-slate-400 mt-1 ml-2 font-semibold">
                      <button className="hover:underline hover:text-blue-600">{t('like') || 'Thích'}</button>
                      <span>•</span>
                      <button className="hover:underline hover:text-blue-600 flex items-center space-x-1">
                        <CornerDownRight className="w-3 h-3" />
                        <span>Phản hồi</span>
                      </button>
                      <span>•</span>
                      <span>{comment.createdAt}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          {/* Comment Form Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 pt-2">
            <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="sm" />
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={!isAuthenticated ? 'Đăng nhập để bình luận...' : (t('writeComment') || 'Viết bình luận...')}
                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-full pl-4 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                className="absolute right-3 text-gray-400 hover:text-amber-500"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-40 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};