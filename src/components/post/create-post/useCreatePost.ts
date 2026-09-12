import { useState, useRef } from 'react';
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
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [showImageInput, setShowImageInput] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const feelings = [
    '😊 Đang cảm thấy vui vẻ',
    '☕ Đang uống cà phê',
    '🚀 Đang hào hứng',
    '💻 Đang lập trình',
    '🎧 Đang nghe nhạc',
  ];

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
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
      let fullContent = content.trim();
      if (selectedFeeling) {
        fullContent = `${selectedFeeling}\n\n${fullContent}`;
      }

      const postPrivacy =
        privacy === 'friends' ? 'FRIENDS' : privacy === 'private' ? 'PRIVATE' : 'PUBLIC';

      let uploadedUrl = imageUrl.trim();

      const files: File[] = selectedFile ? [selectedFile] : [];
      const createdPost = await postService.createPost(fullContent, postPrivacy, files);

      if (uploadedUrl && (!createdPost.mediaUrls || createdPost.mediaUrls.length === 0)) {
        createdPost.mediaUrls = [uploadedUrl];
      }

      onPostCreated(createdPost);
      setContent('');
      setImageUrl('');
      setSelectedFile(null);
      setFilePreview(null);
      setSelectedFeeling(null);
      setShowImageInput(false);
      setIsOpenModal(false);
      toast.showSuccess('Đã đăng bài viết mới thành công!');
    } catch (err: any) {
      console.error('Failed to create post:', err);
      const newPost: Post = {
        id: 'post-' + Date.now(),
        userId: user?.id || 'me',
        authorName: user?.fullName || user?.username || 'Bạn',
        authorAvatar: user?.avatar || '',
        content: content.trim(),
        mediaUrls: filePreview ? [filePreview] : imageUrl.trim() ? [imageUrl.trim()] : [],
        createdAt: 'Vừa xong',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        privacy: privacy === 'friends' ? 'FRIENDS' : privacy === 'private' ? 'PRIVATE' : 'PUBLIC',
        comments: [],
      };
      onPostCreated(newPost);
      setContent('');
      setImageUrl('');
      setSelectedFile(null);
      setFilePreview(null);
      setSelectedFeeling(null);
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
    content,
    setContent,
    imageUrl,
    setImageUrl,
    selectedFile,
    setSelectedFile,
    filePreview,
    setFilePreview,
    privacy,
    setPrivacy,
    showImageInput,
    setShowImageInput,
    selectedFeeling,
    setSelectedFeeling,
    isSubmitting,
    fileInputRef,
    feelings,
    handleOpen,
    handleFileChange,
    handleSubmit,
  };
};
