import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { Comment, Post } from '../../../types';
import { postService, fetchAuthorProfile } from '../../../services/api';

interface UsePostCardDataProps {
  post: Post;
  onDeletePost?: (postId: string) => void;
}

export const usePostCardData = ({ post, onDeletePost }: UsePostCardDataProps) => {
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

  const reactionsMap: Record<string, 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY'> = {
    '👍': 'LIKE',
    '❤️': 'LOVE',
    '😆': 'HAHA',
    '😮': 'WOW',
    '😢': 'SAD',
    '😡': 'ANGRY',
  };
  const reactionsList = ['👍', '❤️', '😆', '😮', '😢', '😡'];

  useEffect(() => {
    const local = getStoredReaction(post.id, user?.id);
    if (local) {
      setLiked(local.liked);
      if (local.reaction) setReaction(local.reaction);
    } else if (post.isLiked) {
      setLiked(true);
    }

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
    if (
      !window.confirm(
        language === 'en'
          ? 'Are you sure you want to delete this post?'
          : 'Bạn có chắc chắn muốn xóa bài viết này không?'
      )
    )
      return;
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      if (onDeletePost) onDeletePost(post.id);
      toast.showSuccess(
        language === 'en' ? 'Post deleted successfully!' : 'Đã xóa bài viết thành công!'
      );
    } catch (err: any) {
      toast.showError(
        (language === 'en' ? 'Could not delete post: ' : 'Không thể xóa bài viết: ') +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSharePost = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setSharesCount((prev) => prev + 1);
    toast.showSuccess(
      language === 'en' ? 'Post link copied to clipboard!' : 'Đã sao chép liên kết bài viết!'
    );
    setTimeout(() => setCopied(false), 2000);
    setShowOptionsMenu(false);
  };

  const topReactionIcons =
    activeReactions.length > 0
      ? activeReactions.slice(0, 3)
      : liked
      ? [reaction]
      : ['👍'];

  const rootComments = comments.filter((c) => !c.parentCommentId);
  const displayedComments = rootComments.slice(-3);
  const totalComments = Math.max(comments.length, commentsCount);

  return {
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
  };
};
