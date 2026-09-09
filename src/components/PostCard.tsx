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
    <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm mb-4 border border-gray-200 dark:border-[#393a3b] transition-colors overflow-hidden">
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

        {/* Top Right Actions: More & Close */}
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
                  <span>{saved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-blue-500" />}
                  <span>{copied ? 'Đã chép liên kết!' : 'Sao chép liên kết'}</span>
                </button>
                {user && (user.id === post.userId || post.userId === 'me') && (
                  <button
                    onClick={handleDeletePost}
                    className="w-full flex items-center space-x-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    <span>Xóa bài viết</span>
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
            title="Ẩn bài viết"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Post Text Content */}
      <div className="px-4 pb-2.5 text-sm text-gray-900 dark:text-[#e4e6eb] leading-normal whitespace-pre-line">
        {post.content}
      </div>

      {/* Media Image Grid Gallery */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="w-full bg-black/5 dark:bg-black/40 overflow-hidden">
          {post.mediaUrls.length === 1 ? (
            <img src={post.mediaUrls[0]} alt="Post media" className="w-full max-h-[550px] object-cover" />
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((url, i) => (
                <img key={i} src={url} alt={`Media ${i}`} className="w-full h-64 object-cover" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Stats matching Facebook */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-[#b0b3b8]">
        <div className="flex items-center space-x-1.5 min-h-[20px]">
          {likesCount > 0 ? (
            <div className="flex items-center space-x-1.5">
              <div className="flex items-center -space-x-1">
                <span className="w-4.5 h-4.5 rounded-full bg-[#1877f2] flex items-center justify-center text-[10px] text-white z-10 shadow-sm">
                  👍
                </span>
                <span className="w-4.5 h-4.5 rounded-full bg-[#fa3e3e] flex items-center justify-center text-[10px] text-white shadow-sm">
                  ❤️
                </span>
              </div>
              <span className="text-gray-600 dark:text-[#b0b3b8] text-xs">
                {likesCount}
              </span>
            </div>
          ) : (
            <span className="text-gray-400 dark:text-[#b0b3b8]/60 text-xs">Hãy là người đầu tiên thích</span>
          )}
        </div>
        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-[#b0b3b8]">
          <button onClick={handleToggleComments} className="hover:underline cursor-pointer">
            {Math.max(comments.length, commentsCount)} bình luận
          </button>
          <span>{post.sharesCount || 0} lượt chia sẻ</span>
        </div>
      </div>

      <div className="mx-3 border-t border-gray-200 dark:border-[#393a3b]" />

      {/* Post Actions Bar */}
      <div className="px-2 py-1 flex items-center justify-around">
        {/* Like Button with Reactions Container */}
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactionsMenu(true)}
          onMouseLeave={() => setShowReactionsMenu(false)}
        >
          {/* Reactions floating tooltip menu */}
          {showReactionsMenu && (
            <div
              className="absolute -top-12 left-2 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-full shadow-2xl px-2.5 py-1 flex items-center space-x-1.5 z-40 animate-bounce-short"
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
                  className="text-2xl hover:scale-135 transition-transform duration-150 cursor-pointer p-0.5"
                >
                  {emoji}
                </button>
              ))}
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
            <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-[#2d88ff]' : ''}`} />
            <span>{t('like') || 'Thích'}</span>
          </button>
        </div>

        {/* Comment Button */}
        <button
          onClick={handleToggleComments}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t('comment') || 'Bình luận'}</span>
        </button>

        {/* Share Button */}
        <button className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer">
          <Share2 className="w-5 h-5" />
          <span>{t('share') || 'Chia sẻ'}</span>
        </button>
      </div>

      {/* Comments Drawer matching Facebook */}
      {showComments && (
        <div className="p-3.5 bg-gray-50/70 dark:bg-[#242526] space-y-3 border-t border-gray-200 dark:border-[#393a3b]">
          {loadingComments ? (
            <div className="flex items-center justify-center py-4 space-x-2 text-gray-400 text-xs font-semibold">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Đang tải bình luận...</span>
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-xs text-gray-400 dark:text-[#b0b3b8] py-2">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
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
                    <UserAvatar src={displayAvatar} alt={displayName} size="sm" className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-[#3a3b3c] p-2.5 px-3 rounded-2xl inline-block">
                      <h5
                        onClick={() => {
                          if (onViewProfile && comment.userId) onViewProfile(comment.userId);
                        }}
                        className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] cursor-pointer hover:underline"
                      >
                        {displayName}
                      </h5>
                      <p className="text-xs text-gray-800 dark:text-[#e4e6eb] mt-0.5 leading-relaxed">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-1 ml-2 font-semibold">
                      <button className="hover:underline hover:text-[#2d88ff] cursor-pointer">{t('like') || 'Thích'}</button>
                      <span>•</span>
                      <button className="hover:underline hover:text-[#2d88ff] flex items-center space-x-1 cursor-pointer">
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
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 pt-1">
            <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="sm" className="w-8 h-8 rounded-full" />
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={!isAuthenticated ? 'Đăng nhập để bình luận...' : (t('writeComment') || 'Viết bình luận...')}
                className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full pl-4 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
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
              disabled={!commentText.trim()}
              className="p-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full disabled:opacity-40 transition shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};