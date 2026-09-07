import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Post, Comment } from '../types';
import { UserAvatar } from './UserAvatar';
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
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();

  const [liked, setLiked] = useState<boolean>(post.isLiked || false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount || 0);
  const [reaction, setReaction] = useState<string>('👍');
  const [showReactionsMenu, setShowReactionsMenu] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [showComments, setShowComments] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [commentText, setCommentText] = useState<string>('');
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const reactionsList = ['👍', '❤️', '😆', '😮', '😢', '😡'];

  const handleLike = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (liked) {
      setLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setReaction('👍');
      setLikesCount((prev) => prev + 1);
    }
  };

  const handleSelectReaction = (reactEmoji: string) => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setReaction(reactEmoji);
    if (!liked) {
      setLiked(true);
      setLikesCount((prev) => prev + 1);
    }
    setShowReactionsMenu(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: 'comment-' + Date.now(),
      postId: post.id,
      userId: user?.id || 'me',
      authorName: user?.fullName || user?.username || 'Bạn',
      authorAvatar: user?.avatar || '',
      content: commentText.trim(),
      createdAt: 'Vừa xong',
      likesCount: 0,
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowOptionsMenu(false);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm mb-4 border border-gray-200 dark:border-slate-700 transition-colors overflow-hidden hover:shadow-md">
      {/* Header section */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserAvatar src={post.authorAvatar} alt={post.authorName} size="md" />
          <div>
            <h4 className="font-bold text-gray-900 dark:text-slate-100 text-sm hover:underline cursor-pointer">
              {post.authorName}
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
        <div className="flex items-center space-x-1.5">
          <span className="bg-blue-600 text-white p-1 rounded-full text-[10px] shadow-sm">{liked ? reaction : '👍'}</span>
          <span className="font-semibold text-gray-700 dark:text-slate-300">{likesCount} lượt thích</span>
        </div>
        <div className="flex items-center space-x-3 font-medium">
          <button onClick={() => setShowComments(!showComments)} className="hover:underline">
            {comments.length} {t('comments') || 'bình luận'}
          </button>
          <span>{post.sharesCount || 0} {t('shares') || 'chia sẻ'}</span>
        </div>
      </div>

      {/* Post Actions Bar */}
      <div className="px-2 py-1 flex items-center justify-around border-b border-gray-100 dark:border-slate-700/60 relative">
        {/* Reactions floating tooltip menu */}
        {showReactionsMenu && (
          <div className="absolute bottom-12 left-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-2xl px-3 py-1.5 flex space-x-2 z-30 animate-bounce-short">
            {reactionsList.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSelectReaction(emoji)}
                className="text-xl hover:scale-130 transition transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Like Button */}
        <button
          onMouseEnter={() => setShowReactionsMenu(true)}
          onMouseLeave={() => setTimeout(() => setShowReactionsMenu(false), 2000)}
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition ${
            liked
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
          }`}
        >
          <span className="text-base">{liked ? reaction : '👍'}</span>
          <span>{t('like') || 'Thích'}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
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
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-2.5 items-start">
              <UserAvatar src={comment.authorAvatar} alt={comment.authorName} size="sm" />
              <div className="flex-1">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-gray-200/70 dark:border-slate-700 inline-block shadow-sm">
                  <h5 className="font-bold text-xs text-gray-900 dark:text-slate-100">{comment.authorName}</h5>
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
          ))}

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