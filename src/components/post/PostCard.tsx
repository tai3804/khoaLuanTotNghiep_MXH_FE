import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Post, Comment } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { postService, fetchAuthorProfile } from '../../services/api';
import { CommentModal } from './CommentModal';
import { ShareModal } from './ShareModal';
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
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [showReactionsMenu, setShowReactionsMenu] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [inlineCommentText, setInlineCommentText] = useState<string>('');
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const [authorName, setAuthorName] = useState<string>(
    post.authorName && post.authorName !== 'Thành viên KLTN' ? post.authorName : ''
  );
  const [authorAvatar, setAuthorAvatar] = useState<string>(post.authorAvatar || '');

  const [originalPost, setOriginalPost] = useState<Post | null>(post.sharedPost || null);
  const [loadingOriginalPost, setLoadingOriginalPost] = useState<boolean>(
    !post.sharedPost && Boolean(post.originalPostId)
  );

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
        if (isMounted && orig) {
          setOriginalPost(orig);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingOriginalPost(false);
      });

    return () => {
      isMounted = false;
    };
  }, [post.originalPostId, post.sharedPost]);

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
          const counts: Record<string, number> = {};
          if (Array.isArray(reactions) && reactions.length > 0) {
            reactions.forEach((r: any) => {
              const emoji = reactionTypeToEmoji[r.type] || '👍';
              counts[emoji] = (counts[emoji] || 0) + 1;
            });
            setReactionCounts(counts);

            const sorted = Object.entries(counts)
              .filter(([_, count]) => count > 0)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([emoji]) => emoji);
            setActiveReactions(sorted);
            setLikesCount((prev) => Math.max(prev, reactions.length));
          } else {
            setReactionCounts({});
            setActiveReactions([]);
          }

          const myReaction = Array.isArray(reactions)
            ? reactions.find((r: any) => String(r.userId || r.authorId) === String(user?.id))
            : undefined;

          if (myReaction) {
            setLiked(true);
            const emoji = reactionTypeToEmoji[myReaction.type] || '👍';
            setReaction(emoji);
            setStoredReaction(post.id, true, emoji, user?.id);
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

    setReactionCounts((prev) => {
      const updated = { ...prev };
      if (nextLiked) {
        updated[reaction] = (updated[reaction] || 0) + 1;
      } else {
        updated[reaction] = Math.max(0, (updated[reaction] || 0) - 1);
        if (updated[reaction] === 0) delete updated[reaction];
      }
      return updated;
    });

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
    const wasLiked = liked;
    setShowReactionsMenu(false);

    // If clicked same reaction while liked -> toggle off (unlike)
    if (wasLiked && prevReaction === reactEmoji) {
      setLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
      setStoredReaction(post.id, false, '👍', user?.id);
      setReactionCounts((prev) => {
        const updated = { ...prev };
        updated[reactEmoji] = Math.max(0, (updated[reactEmoji] || 0) - 1);
        if (updated[reactEmoji] === 0) delete updated[reactEmoji];
        return updated;
      });
      try {
        await postService.removeReaction(post.id, reactionsMap[reactEmoji] || 'LIKE');
      } catch {}
      return;
    }

    // Otherwise change or add reaction
    setReaction(reactEmoji);
    setLiked(true);
    if (!wasLiked) {
      setLikesCount((prev) => prev + 1);
    }
    setStoredReaction(post.id, true, reactEmoji, user?.id);

    setReactionCounts((prev) => {
      const updated = { ...prev };
      if (wasLiked && prevReaction) {
        updated[prevReaction] = Math.max(0, (updated[prevReaction] || 0) - 1);
        if (updated[prevReaction] === 0) delete updated[prevReaction];
      }
      updated[reactEmoji] = (updated[reactEmoji] || 0) + 1;
      return updated;
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
    setShowOptionsMenu(false);
    setShowShareModal(true);
  };

  const handleShareSuccess = () => {
    setSharesCount((prev) => prev + 1);
    window.dispatchEvent(new CustomEvent('feed_refresh_needed'));
  };

  if (isDeleting) {
    return null;
  }

  // Top reaction icons display: ALWAYS sorted descending by count, max 3 types
  const topReactionIcons = useMemo(() => {
    const sorted = Object.entries(reactionCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]) // Most frequent reactions FIRST!
      .slice(0, 3) // Maximum 3 reaction types!
      .map(([emoji]) => emoji);

    if (sorted.length > 0) {
      return sorted;
    }

    if (activeReactions.length > 0) {
      return activeReactions.slice(0, 3);
    }

    if (liked) {
      return [reaction];
    }

    if (likesCount > 0) {
      return ['👍'];
    }

    return [];
  }, [reactionCounts, activeReactions, liked, reaction, likesCount]);

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
              {post.originalPostId && (
                <span className="font-normal text-gray-500 dark:text-[#b0b3b8] text-xs ml-1.5">
                  {language === 'en' ? 'shared a post' : 'đã chia sẻ một bài viết'}
                </span>
              )}
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

      {/* Shared Post Container */}
      {post.originalPostId && (
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
              {/* Original Author Header */}
              <div className="p-3 pb-0 flex items-center space-x-2.5">
                <div
                  onClick={() => onViewProfile && onViewProfile(originalPost.userId)}
                  className="cursor-pointer hover:opacity-90 transition shrink-0"
                >
                  <UserAvatar src={originalPost.authorAvatar} alt={originalPost.authorName} size="sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    onClick={() => onViewProfile && onViewProfile(originalPost.userId)}
                    className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] hover:underline cursor-pointer truncate"
                  >
                    {originalPost.authorName}
                  </div>
                  <div className="flex items-center space-x-1 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
                    <span>{originalPost.createdAt}</span>
                    <span>·</span>
                    <Globe className="w-3 h-3" />
                  </div>
                </div>
              </div>

              {/* Original Post Content */}
              {originalPost.content && (
                <div className="px-3 text-xs sm:text-sm text-gray-800 dark:text-[#d0d2d6] whitespace-pre-line leading-relaxed">
                  {originalPost.content}
                </div>
              )}

              {/* Original Post Media */}
              {originalPost.mediaUrls && originalPost.mediaUrls.length > 0 && (
                <div
                  className="w-full overflow-hidden border-t border-gray-100 dark:border-[#393a3b] bg-black/5 dark:bg-black/20 cursor-pointer"
                  onClick={() => setShowCommentModal(true)}
                >
                  {originalPost.mediaUrls.length === 1 ? (
                    <img
                      src={originalPost.mediaUrls[0]}
                      alt="Original post media"
                      className="w-full max-h-[420px] object-cover hover:opacity-95 transition"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-0.5">
                      {originalPost.mediaUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Original media ${i}`}
                          className="w-full h-48 sm:h-56 object-cover hover:opacity-95 transition"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-gray-400 dark:text-[#b0b3b8]">
              {language === 'en'
                ? 'This shared content is currently unavailable or has been removed.'
                : 'Nội dung được chia sẻ này hiện không khả dụng hoặc bài viết gốc đã bị xóa.'}
            </div>
          )}
        </div>
      )}

      {/* Media Image Grid Gallery (for direct post media) */}
      {!post.originalPostId && post.mediaUrls && post.mediaUrls.length > 0 && (
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
          {likesCount > 0 && topReactionIcons.length > 0 ? (
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
        post={{
          ...post,
          sharedPost: originalPost || post.sharedPost,
        }}
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

      {/* Standalone Share Post Modal */}
      <ShareModal
        post={post}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShareSuccess={handleShareSuccess}
      />
    </div>
  );
};
