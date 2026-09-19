import { useState, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { Comment, Post } from '../../../types';

interface UseCommentModalDataProps {
  post: Post;
  liked: boolean;
  userReaction?: string;
  externalTopIcons?: string[];
  comments: Comment[];
  onSubmitComment: (text: string, parentCommentId?: string) => Promise<void>;
  onShare?: () => void;
}

export const useCommentModalData = ({
  post,
  liked,
  userReaction = '👍',
  externalTopIcons,
  comments,
  onSubmitComment,
  onShare,
}: UseCommentModalDataProps) => {
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

  const topReactionIcons = externalTopIcons && externalTopIcons.length > 0
    ? externalTopIcons
    : [liked ? (userReaction || '👍') : '👍'];

  const rootComments = comments.filter((c) => !c.parentCommentId);
  const getRepliesFor = (parentId: string) =>
    comments.filter((c) => c.parentCommentId && String(c.parentCommentId) === String(parentId));

  return {
    user,
    isAuthenticated,
    t,
    language,
    commentText,
    setCommentText,
    replyingTo,
    setReplyingTo,
    submitting,
    showReactions,
    setShowReactions,
    copied,
    commentsEndRef,
    inputRef,
    reactionsList,
    topReactionIcons,
    rootComments,
    getRepliesFor,
    handleSubmit,
    handleShareClick,
    handleStartReply,
    getReactionLabel,
  };
};
