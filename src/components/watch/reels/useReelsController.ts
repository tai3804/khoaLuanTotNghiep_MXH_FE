import { useState, useRef, useEffect, useCallback } from 'react';
import { Post, Comment } from '../../../types';
import { postService } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';
import { ReelLikeState } from './types';

interface UseReelsControllerParams {
  posts: Post[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const useReelsController = ({
  posts,
  initialIndex = 0,
  isOpen,
  onClose,
}: UseReelsControllerParams) => {
  const toast = useToast();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, ReelLikeState>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState(false);

  // Comment state for active reel
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const commentsBottomRef = useRef<HTMLDivElement | null>(null);

  // Filter only posts that have video
  const videoPosts = posts.filter((p) => {
    if (p.mediaList && p.mediaList.some((m) => m.mediaType === 'VIDEO' || m.fileUrl?.match(/\.(mp4|webm|mov|mkv)/i))) {
      return true;
    }
    return p.mediaUrls && p.mediaUrls.some((u) => u.match(/\.(mp4|webm|mov|mkv)/i));
  });

  const currentPost = videoPosts[currentIndex] || null;

  // Initialize like & save state from posts
  useEffect(() => {
    if (initialIndex >= 0 && initialIndex < videoPosts.length) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, videoPosts.length]);

  useEffect(() => {
    if (currentPost) {
      setLikedPosts((prev) => ({
        ...prev,
        [currentPost.id]: prev[currentPost.id] || {
          isLiked: !!currentPost.isLiked,
          count: currentPost.likesCount || 0,
        },
      }));
      setSavedPosts((prev) => ({
        ...prev,
        [currentPost.id]: prev[currentPost.id] !== undefined ? prev[currentPost.id] : !!currentPost.isSaved,
      }));
    }
  }, [currentPost]);

  const getVideoUrl = (post: Post | null): string => {
    if (!post) return '';
    if (post.mediaList && post.mediaList.length > 0) {
      const vid = post.mediaList.find((m) => m.mediaType === 'VIDEO' || m.fileUrl?.match(/\.(mp4|webm|mov|mkv)/i));
      if (vid && vid.fileUrl) return vid.fileUrl;
    }
    if (post.mediaUrls && post.mediaUrls.length > 0) {
      const vid = post.mediaUrls.find((u) => u.match(/\.(mp4|webm|mov|mkv)/i));
      if (vid) return vid;
      return post.mediaUrls[0];
    }
    return '';
  };

  // Video playback control
  useEffect(() => {
    if (!isOpen) return;
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [currentIndex, isOpen]);

  // Load comments when comment drawer opened
  useEffect(() => {
    if (showComments && currentPost) {
      loadComments(currentPost.id);
    }
  }, [showComments, currentPost?.id]);

  const loadComments = async (postId: string) => {
    setLoadingComments(true);
    try {
      const loaded = await postService.getComments(postId);
      setComments(Array.isArray(loaded) ? loaded : []);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < videoPosts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  }, [currentIndex, videoPosts.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showComments) {
          setShowComments(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        setIsMuted((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showComments, handleNext, handlePrev, isPlaying]);

  // Mouse wheel snap
  const wheelLockRef = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaY) > 40) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 500);
    }
  };

  const handleToggleLike = async () => {
    if (!currentPost) return;
    const postId = currentPost.id;
    const current = likedPosts[postId] || { isLiked: !!currentPost.isLiked, count: currentPost.likesCount || 0 };
    const nextLiked = !current.isLiked;
    const nextCount = Math.max(0, current.count + (nextLiked ? 1 : -1));

    setLikedPosts((prev) => ({
      ...prev,
      [postId]: { isLiked: nextLiked, count: nextCount },
    }));

    try {
      if (nextLiked) {
        await postService.reactPost(postId, 'LIKE');
      } else {
        await postService.removeReaction(postId, 'LIKE');
      }
    } catch {
      setLikedPosts((prev) => ({
        ...prev,
        [postId]: current,
      }));
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentPost) return;
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);

    const postState = likedPosts[currentPost.id] || { isLiked: false, count: currentPost.likesCount || 0 };
    if (!postState.isLiked) {
      handleToggleLike();
    }
  };

  const handleToggleSave = async () => {
    if (!currentPost) return;
    const postId = currentPost.id;
    const nextSaved = !savedPosts[postId];
    setSavedPosts((prev) => ({ ...prev, [postId]: nextSaved }));

    try {
      if (nextSaved) {
        await postService.savePost(postId);
        toast.showSuccess('Đã lưu video vào mục Đã lưu');
      } else {
        await postService.unsavePost(postId);
        toast.showInfo('Đã xóa video khỏi mục Đã lưu');
      }
    } catch {
      setSavedPosts((prev) => ({ ...prev, [postId]: !nextSaved }));
    }
  };

  const handleShare = async () => {
    if (!currentPost) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentPost.authorName + ' trên KLTN Social',
          text: currentPost.content,
          url: `${window.location.origin}/posts/${currentPost.id}`,
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/posts/${currentPost.id}`);
        toast.showSuccess('Đã sao chép liên kết video');
      }
    } catch {}
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentPost || submittingComment) return;
    setSubmittingComment(true);

    try {
      const added = await postService.addComment(currentPost.id, newCommentText.trim());
      if (added) {
        setComments((prev) => [...prev, added]);
        setNewCommentText('');
        setTimeout(() => {
          commentsBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch {
      toast.showError('Không thể gửi bình luận, vui lòng thử lại');
    } finally {
      setSubmittingComment(false);
    }
  };

  const currentLikeState = currentPost
    ? likedPosts[currentPost.id] || {
        isLiked: !!currentPost.isLiked,
        count: currentPost.likesCount || 0,
      }
    : { isLiked: false, count: 0 };

  const isSaved = currentPost ? !!savedPosts[currentPost.id] : false;
  const videoUrl = getVideoUrl(currentPost);

  return {
    videoPosts,
    currentPost,
    currentIndex,
    isPlaying,
    isMuted,
    showHeartAnim,
    showComments,
    comments,
    loadingComments,
    newCommentText,
    submittingComment,
    videoRef,
    containerRef,
    commentsBottomRef,
    currentLikeState,
    isSaved,
    videoUrl,
    setIsMuted,
    setShowComments,
    setNewCommentText,
    handleNext,
    handlePrev,
    togglePlay,
    handleWheel,
    handleToggleLike,
    handleDoubleTap,
    handleToggleSave,
    handleShare,
    handleSendComment,
  };
};
