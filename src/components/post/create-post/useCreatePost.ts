import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { Post } from '../../../types';
import { postService } from '../../../services/api';

interface UseCreatePostProps {
  onPostCreated: (newPost: Post) => void;
}

export const useCreatePost = ({ onPostCreated }: UseCreatePostProps) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

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

  const handleStartLiveStream = async (liveTitle: string, liveDescription: string) => {
    const postPrivacy =
      privacy === 'friends' ? 'FRIENDS' : privacy === 'private' ? 'PRIVATE' : 'PUBLIC';
    const liveContent = `🔴 [ĐANG PHÁT TRỰC TIẾP] ${liveTitle}${liveDescription ? `\n\n${liveDescription}` : ''}`;
    
    const createdPost = await postService.createPost(liveContent, postPrivacy, []);
    onPostCreated(createdPost);
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

      const files: File[] = selectedFile ? [selectedFile] : [];
      const createdPost = await postService.createPost(fullContent, postPrivacy, files);

      // Ensure optimistic media preview is available if backend processes media asynchronously
      if (!createdPost.mediaUrls || createdPost.mediaUrls.length === 0) {
        if (filePreview) {
          createdPost.mediaUrls = [filePreview];
          createdPost.mediaList = [{
            fileUrl: filePreview,
            mediaType: isVideoFile ? 'VIDEO' : 'IMAGE',
          }];
        } else if (uploadedUrl) {
          createdPost.mediaUrls = [uploadedUrl];
          createdPost.mediaList = [{
            fileUrl: uploadedUrl,
            mediaType: isVideoFile ? 'VIDEO' : 'IMAGE',
          }];
        }
      }

      onPostCreated(createdPost);
      setContent('');
      setImageUrl('');
      handleClearFile();
      setShowImageInput(false);
      setIsOpenModal(false);
      toast.showSuccess(isVideoFile ? 'Đã đăng video thành công!' : 'Đã đăng bài viết mới thành công!');
    } catch (err: any) {
      console.error('Failed to create post:', err);
      const isVideoFile = selectedFileType === 'video' || (imageUrl.trim() && /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(imageUrl.trim()));
      const previewUrl = filePreview || (imageUrl.trim() ? imageUrl.trim() : '');

      const fallbackPost: Post = {
        id: 'post-' + Date.now(),
        userId: user?.id || 'me',
        authorName: user?.fullName || user?.username || 'Bạn',
        authorAvatar: user?.avatar || '',
        content: content.trim(),
        mediaUrls: previewUrl ? [previewUrl] : [],
        mediaList: previewUrl ? [{
          fileUrl: previewUrl,
          mediaType: isVideoFile ? 'VIDEO' : 'IMAGE',
        }] : [],
        createdAt: 'Vừa xong',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        privacy: privacy === 'friends' ? 'FRIENDS' : privacy === 'private' ? 'PRIVATE' : 'PUBLIC',
        comments: [],
      };
      onPostCreated(fallbackPost);
      setContent('');
      setImageUrl('');
      handleClearFile();
      setShowImageInput(false);
      setIsOpenModal(false);
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
