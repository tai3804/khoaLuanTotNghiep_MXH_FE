import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { useLiveStream } from '../../../context/LiveStreamContext';
import { Post } from '../../../types';
import { postService } from '../../../services/api';
import { mediaService } from '../../../services/mediaService';

interface UseCreatePostProps {
  onPostCreated: (newPost: Post) => void;
  groupId?: string;
}

export const useCreatePost = ({ onPostCreated, groupId }: UseCreatePostProps) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const { startBroadcast } = useLiveStream();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<'image' | 'video' | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>(() => {
    const saved = localStorage.getItem('default_post_privacy');
    if (saved === 'FRIENDS') return 'friends';
    if (saved === 'PRIVATE') return 'private';
    return 'public';
  });

  useEffect(() => {
    const handlePrivacyChange = (e: any) => {
      const val = e.detail;
      if (val === 'FRIENDS') setPrivacy('friends');
      else if (val === 'PRIVATE') setPrivacy('private');
      else setPrivacy('public');
    };
    window.addEventListener('default_post_privacy_changed', handlePrivacyChange);
    return () => window.removeEventListener('default_post_privacy_changed', handlePrivacyChange);
  }, []);

  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const userFirstName = user?.fullName
    ? user.fullName.trim().split(' ').pop() || 'bạn'
    : user?.username || 'bạn';

  const handleOpen = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setIsOpenModal(true);
  };

  const handleOpenLive = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setIsLiveModalOpen(true);
  };

  const handleOpenFilePicker = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setIsOpenModal(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 150);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUrl('');
      setShowImageInput(false);
      setSelectedFile(file);
      const isVid = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov|m4v|mkv)$/i.test(file.name);
      setSelectedFileType(isVid ? 'video' : 'image');
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setSelectedFileType(null);
    if (filePreview && filePreview.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartLiveStream = async (liveTitle: string, liveDescription: string, stream?: MediaStream | null) => {
    const postPrivacy =
      privacy === 'friends' ? 'FRIENDS' : privacy === 'private' ? 'PRIVATE' : 'PUBLIC';

    if (stream) {
      await startBroadcast(liveTitle, liveDescription, stream, postPrivacy, onPostCreated);
    } else {
      const liveContent = `🔴 [ĐANG PHÁT TRỰC TIẾP] ${liveTitle}${liveDescription ? `\n\n${liveDescription}` : ''}`;
      const createdPost = await postService.createPost(liveContent, postPrivacy, []);
      createdPost.isLive = true;
      createdPost.liveStatus = 'LIVE';
      onPostCreated(createdPost);
      window.dispatchEvent(new CustomEvent('feed_post_created', { detail: createdPost }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!content.trim() && !imageUrl.trim() && !selectedFile) return;

    setIsSubmitting(true);
    try {
      const fullContent = content.trim();
      const postPrivacy =
        privacy === 'friends' ? 'FRIENDS' : privacy === 'private' ? 'PRIVATE' : 'PUBLIC';

      const uploadedUrl = imageUrl.trim();
      const isVideoFile = selectedFileType === 'video' || (uploadedUrl && /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(uploadedUrl));

      let mediaUrls: string[] = [];
      if (selectedFile) {
        try {
          const mediaItem = await mediaService.uploadMedia(selectedFile, 'posts');
          if (mediaItem && mediaItem.fileUrl) {
            mediaUrls = [mediaItem.fileUrl];
          }
        } catch (uploadErr) {
          console.warn('Failed to upload file to media service, attempting direct multipart fallback:', uploadErr);
        }
      } else if (uploadedUrl) {
        mediaUrls = [uploadedUrl];
      }

      const files: File[] = (selectedFile && mediaUrls.length === 0) ? [selectedFile] : [];
      const createdPost = await postService.createPost(fullContent, postPrivacy, files, mediaUrls, groupId);

      // Ensure mediaUrls are populated on the created post object
      if ((!createdPost.mediaUrls || createdPost.mediaUrls.length === 0) && mediaUrls.length > 0) {
        createdPost.mediaUrls = mediaUrls;
        createdPost.mediaList = [{
          fileUrl: mediaUrls[0],
          mediaType: isVideoFile ? 'VIDEO' : 'IMAGE',
        }];
      }

      // Ensure author details are present immediately for crisp display
      if (!createdPost.authorName || createdPost.authorName === 'Thành viên KLTN') {
        createdPost.authorName = user?.fullName || user?.username || 'Bạn';
      }
      if (!createdPost.authorAvatar && user?.avatar) {
        createdPost.authorAvatar = user.avatar;
      }

      onPostCreated(createdPost);
      window.dispatchEvent(new CustomEvent('feed_post_created', { detail: createdPost }));

      setContent('');
      setImageUrl('');
      handleClearFile();
      setShowImageInput(false);
      setIsOpenModal(false);
      toast.showSuccess(isVideoFile ? 'Đã đăng video thành công!' : 'Đã đăng bài viết mới thành công!');
    } catch (err: any) {
      console.error('Failed to create post:', err);
      // Do not render an optimistic post with a fake `post-...` id.  Any
      // reaction, saved-status or comment request on that id is invalid for
      // the UUID-based backend and creates a cascade of misleading 500 errors.
      toast.showError(err?.response?.data?.message || 'Không thể tạo bài viết. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    isAuthenticated,
    t,
    userFirstName,
    isOpenModal,
    setIsOpenModal,
    isLiveModalOpen,
    setIsLiveModalOpen,
    content,
    setContent,
    imageUrl,
    setImageUrl,
    selectedFile,
    setSelectedFile,
    selectedFileType,
    filePreview,
    setFilePreview,
    privacy,
    setPrivacy,
    showImageInput,
    setShowImageInput,
    isSubmitting,
    fileInputRef,
    handleOpen,
    handleOpenLive,
    handleOpenFilePicker,
    handleFileChange,
    handleClearFile,
    handleStartLiveStream,
    handleSubmit,
  };
};
