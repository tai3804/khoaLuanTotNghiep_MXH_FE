import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { Comment, Post } from '../../../types';
import { postService, fetchAuthorProfile, fetchGroupMeta, groupMetaCache } from '../../../services/api';

interface UsePostCardDataProps {
  post: Post;
  onDeletePost?: (postId: string) => void;
}

const userReactionsMemoryCache: Record<string, Record<string, { liked: boolean; reaction: string }>> = {};

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
  const [saved, setSaved] = useState<boolean>(Boolean(post.isSaved));
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [inlineCommentText, setInlineCommentText] = useState<string>('');
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
  const [showCommentModal, setShowCommentModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const [groupInfo, setGroupInfo] = useState<{ id: string; name: string; coverUrl?: string; privacy?: string } | null>(() => {
    if (post.groupId) {
      return {
        id: post.groupId,
        name: post.groupName || groupMetaCache[post.groupId]?.name || '',
        coverUrl: post.groupAvatar || post.groupCover || groupMetaCache[post.groupId]?.coverUrl,
        privacy: post.groupPrivacy || groupMetaCache[post.groupId]?.privacy,
      };
    }
    return null;
  });

  useEffect(() => {
    if (post.groupId) {
      if (post.groupName && (post.groupAvatar || post.groupCover)) {
        setGroupInfo({
          id: post.groupId,
          name: post.groupName,
          coverUrl: post.groupAvatar || post.groupCover,
          privacy: post.groupPrivacy,
        });
      } else {
        fetchGroupMeta(post.groupId).then((meta) => {
          if (meta) setGroupInfo(meta);
        });
      }
    } else {
      setGroupInfo(null);
    }
  }, [post.groupId, post.groupName, post.groupAvatar, post.groupCover, post.groupPrivacy]);

  const [currentPost, setCurrentPost] = useState<Post>(post);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showAudienceModal, setShowAudienceModal] = useState<boolean>(false);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [translationDisabled, setTranslationDisabled] = useState<boolean>(() => localStorage.getItem(`post_translation_disabled_${post.id}`) === 'true');
  const [isPinned, setIsPinned] = useState<boolean>(() => {
    try {
      const pins = JSON.parse(localStorage.getItem('kltn_pinned_posts') || '[]');
      return pins.includes(post.id);
    } catch {
      return false;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const mutes = JSON.parse(localStorage.getItem('kltn_muted_posts') || '[]');
      return mutes.includes(post.id);
    } catch {
      return false;
    }
  });

  const [authorName, setAuthorName] = useState<string>(
    post.authorName && post.authorName !== 'Thành viên KLTN' ? post.authorName : ''
  );
  const [authorAvatar, setAuthorAvatar] = useState<string>(post.authorAvatar || '');

  useEffect(() => {
    setCurrentPost(post);
  }, [post]);

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
    const currentUid = String(user?.id || (user as any)?.userId || '').toLowerCase().trim();
    const postUid = String(post.userId || (post as any)?.authorId || '').toLowerCase().trim();
    if (user && currentUid && postUid && currentUid !== 'me' && postUid !== 'me' && currentUid === postUid) {
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
    const userKey = userId || 'guest';
    return userReactionsMemoryCache[userKey]?.[postId] || null;
  };

  const setStoredReaction = (postId: string, isLiked: boolean, emoji: string, userId?: string) => {
    const userKey = userId || 'guest';
    if (!userReactionsMemoryCache[userKey]) {
      userReactionsMemoryCache[userKey] = {};
    }
    if (isLiked) {
      userReactionsMemoryCache[userKey][postId] = { liked: true, reaction: emoji };
    } else {
      delete userReactionsMemoryCache[userKey][postId];
    }
    // Clean up legacy localStorage item if exists
    try { localStorage.removeItem(`user_reactions_${userKey}`); } catch {}
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

    if (isAuthenticated && post.id && !post.isOptimistic && !post.id.startsWith('temp-')) {
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
    if (post.isSaved !== undefined) {
      setSaved(Boolean(post.isSaved));
    }
  }, [post.isSaved]);

  useEffect(() => {
    if (!isAuthenticated || !post.id || post.isOptimistic || post.id.startsWith('temp-')) return;
    postService.isPostSaved(post.id).then(setSaved).catch(() => {});

    const handleSavedChanged = (e: any) => {
      if (e?.detail && String(e.detail.postId) === String(post.id)) {
        setSaved(Boolean(e.detail.isSaved));
      }
    };
    window.addEventListener('saved_posts_changed', handleSavedChanged);
    return () => window.removeEventListener('saved_posts_changed', handleSavedChanged);
  }, [post.id, isAuthenticated, post.isOptimistic]);

  useEffect(() => {
    if (!post.id || post.isOptimistic || post.id.startsWith('temp-')) return;
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
    if (post.isOptimistic || post.id.startsWith('temp-')) {
      toast.showInfo('Bài viết đang được tải lên, vui lòng chờ trong giây lát...');
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
    if (post.isOptimistic || post.id.startsWith('temp-')) {
      toast.showInfo('Bài viết đang được tải lên, vui lòng chờ trong giây lát...');
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
    if (post.isOptimistic || post.id.startsWith('temp-')) {
      toast.showInfo('Bài viết đang được tải lên, vui lòng chờ trong giây lát...');
      return;
    }

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

  const updateComment = async (commentId: string, content: string) => {
    const updated = await postService.updateComment(post.id, commentId, content);
    setComments((prev) => prev.map((comment) => comment.id === commentId ? { ...comment, ...updated, authorName: comment.authorName, authorAvatar: comment.authorAvatar } : comment));
  };

  const deleteComment = async (commentId: string) => {
    await postService.deleteComment(post.id, commentId);
    setComments((prev) => prev.filter((comment) => comment.id !== commentId && comment.parentCommentId !== commentId));
    setCommentsCount((prev) => Math.max(0, prev - 1));
  };

  const handleHidePost = () => {
    try {
      const hidden = JSON.parse(localStorage.getItem('kltn_hidden_post_ids') || '[]');
      if (!hidden.includes(String(post.id))) {
        localStorage.setItem('kltn_hidden_post_ids', JSON.stringify([...hidden, String(post.id)]));
      }
    } catch {}
    setIsHidden(true);
    if (onDeletePost) onDeletePost(post.id);
    toast.showSuccess(language === 'en' ? 'Post hidden from feed' : 'Đã ẩn bài viết khỏi bảng tin');
  };

  const handleDeletePost = () => {
    if (post.isOptimistic || post.id.startsWith('temp-')) {
      toast.showInfo('Bài viết đang được tải lên, vui lòng chờ trong giây lát...');
      return;
    }
    setShowOptionsMenu(false);
    setShowDeleteModal(true);
  };

  const confirmDeletePost = async () => {
    setIsDeleting(true);
    try {
      await postService.deletePost(post.id);
      setIsDeleted(true);
      setShowDeleteModal(false);
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

  const handleTogglePin = async () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    try {
      await postService.pinPost(post.id, nextPinned);
      toast.showSuccess(nextPinned ? 'Đã ghim bài viết lên đầu!' : 'Đã bỏ ghim bài viết.');
      window.dispatchEvent(new CustomEvent('feed_refresh_needed'));
    } catch (e) {
      console.error(e);
      // local fallback
      const pins: string[] = JSON.parse(localStorage.getItem('kltn_pinned_posts') || '[]');
      const updated = nextPinned ? [post.id, ...pins] : pins.filter((id) => id !== post.id);
      localStorage.setItem('kltn_pinned_posts', JSON.stringify(updated));
      toast.showSuccess(nextPinned ? 'Đã ghim bài viết lên đầu!' : 'Đã bỏ ghim bài viết.');
    }
  };

  const handleSavePost = async () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    const nextSaved = !saved;
    setSaved(nextSaved);
    try {
      if (nextSaved) {
        await postService.savePost(post.id);
        toast.showSuccess('Đã lưu bài viết vào mục Đã lưu!');
      } else {
        await postService.unsavePost(post.id);
        toast.showSuccess('Đã gỡ bài viết khỏi mục Đã lưu.');
      }
    } catch {
      toast.showSuccess(nextSaved ? 'Đã lưu bài viết!' : 'Đã bỏ lưu bài viết.');
    }
  };

  const handleToggleMute = () => {
    try {
      const mutes: string[] = JSON.parse(localStorage.getItem('kltn_muted_posts') || '[]');
      let updated: string[];
      if (mutes.includes(post.id)) {
        updated = mutes.filter((id) => id !== post.id);
        setIsMuted(false);
        toast.showSuccess('Đã bật thông báo về bài viết này.');
      } else {
        updated = [...mutes, post.id];
        setIsMuted(true);
        toast.showSuccess('Đã tắt thông báo về bài viết này.');
      }
      localStorage.setItem('kltn_muted_posts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTranslation = () => {
    const next = !translationDisabled;
    setTranslationDisabled(next);
    localStorage.setItem(`post_translation_disabled_${post.id}`, String(next));
    toast.showSuccess(next ? 'Đã tắt bản dịch cho bài viết này.' : 'Đã bật bản dịch cho bài viết này.');
  };

  const handleArchivePost = async () => {
    try {
      await postService.archivePost(post.id, true);
      if (onDeletePost) onDeletePost(post.id);
      toast.showSuccess('Đã chuyển bài viết vào kho lưu trữ.');
      window.dispatchEvent(new CustomEvent('feed_refresh_needed'));
    } catch (e: any) {
      console.error(e);
      if (onDeletePost) onDeletePost(post.id);
      toast.showSuccess('Đã chuyển bài viết vào kho lưu trữ.');
    }
  };

  const handlePostUpdated = (updated: Post) => {
    setCurrentPost(updated);
  };

  const handleUpdateAudience = async (newPrivacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE') => {
    try {
      const updated = await postService.updatePostPrivacy(post.id, newPrivacy);
      setCurrentPost(updated);
      toast.showSuccess('Đã cập nhật đối tượng xem bài viết!');
      window.dispatchEvent(new CustomEvent('feed_refresh_needed'));
    } catch (err: any) {
      console.error(err);
      try {
        const updated = await postService.updatePost(post.id, { privacy: newPrivacy });
        setCurrentPost(updated);
        toast.showSuccess('Đã cập nhật đối tượng xem bài viết!');
        window.dispatchEvent(new CustomEvent('feed_refresh_needed'));
      } catch (e2: any) {
        toast.showError('Không thể đổi đối tượng: ' + (e2.response?.data?.message || e2.message));
      }
    }
  };

  const topReactionIcons =
    activeReactions.length > 0
      ? activeReactions.slice(0, 3)
      : liked
      ? [reaction]
      : ['👍'];

  const rootComments = comments.filter((c) => !c.parentCommentId);
  const displayedComments = rootComments.slice(0, 3);
  const totalComments = Math.max(comments.length, commentsCount);

  return {
    user,
    isAuthenticated,
    openLoginModal,
    t,
    language,
    currentPost,
    setCurrentPost,
    isPinned,
    isMuted,
    showEditModal,
    setShowEditModal,
    showAudienceModal,
    setShowAudienceModal,
    showDateModal,
    setShowDateModal,
    handleTogglePin,
    handleSavePost,
    handleToggleMute,
    translationDisabled,
    handleToggleTranslation,
    handleArchivePost,
    handlePostUpdated,
    handleUpdateAudience,
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
    isDeleted,
    isHidden,
    showDeleteModal,
    setShowDeleteModal,
    confirmDeletePost,
    authorName,
    authorAvatar,
    reactionsList,
    topReactionIcons,
    displayedComments,
    rootComments,
    totalComments,
    getReactionLabel,
    handleLike,
    handleSelectReaction,
    submitCommentText,
    updateComment,
    deleteComment,
    handleInlineCommentSubmit,
    handleHidePost,
    handleDeletePost,
    handleSharePost,
    showReactionsMenu,
    setShowReactionsMenu,
    groupInfo,
  };
};
