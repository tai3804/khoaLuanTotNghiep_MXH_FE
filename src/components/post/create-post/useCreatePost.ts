import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { useLiveStream } from '../../../context/LiveStreamContext';
import { Post } from '../../../types';
import { postService } from '../../../services/api';
import { mediaService } from '../../../services/mediaService';
import { TaggedFriend } from './tag-friends';

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
  const [taggedFriends, setTaggedFriends] = useState<TaggedFriend[]>([]);
  const [showTagFriendsModal, setShowTagFriendsModal] = useState(false);
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

    const fullContent = content.trim();
    const targetGroupId = groupId;
    const postPrivacy = targetGroupId
      ? 'PUBLIC'
      : (privacy === 'friends' ? 'FRIENDS' : privacy === 'private' ? 'PRIVATE' : 'PUBLIC');

    const fileToUpload = selectedFile;
    const filePreviewUrl = filePreview;
    const uploadedUrl = imageUrl.trim();
    const isVideoFile = selectedFileType === 'video' || (uploadedUrl && /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(uploadedUrl));

    // Create unique temporary ID for optimistic UI
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Build optimistic media items for instant preview
    const optimisticMediaList = filePreviewUrl
      ? [{ fileUrl: filePreviewUrl, mediaType: isVideoFile ? 'VIDEO' : 'IMAGE' }]
      : (uploadedUrl ? [{ fileUrl: uploadedUrl, mediaType: isVideoFile ? 'VIDEO' : 'IMAGE' }] : []);
    const optimisticMediaUrls = optimisticMediaList.map((m) => m.fileUrl);

    const taggedUserIds = Array.from(new Set(taggedFriends.map((f) => f.id || f.userId)));

    // Build temporary optimistic post object
    const optimisticPost: Post = {
      id: tempId,
      userId: user?.id || (user as any)?.userId || 'me',
      authorName: user?.fullName || user?.username || 'Bạn',
      authorAvatar: user?.avatar || '',
      content: fullContent,
      mediaUrls: optimisticMediaUrls,
      mediaList: optimisticMediaList,
      createdAt: 'Vừa xong',
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: false,
      privacy: postPrivacy,
      groupId: targetGroupId,
      isOptimistic: true,
      taggedUserIds,
    };

    // 1. Instantly display in feed
    onPostCreated(optimisticPost);
    window.dispatchEvent(new CustomEvent('feed_post_created', { detail: optimisticPost }));

    // 2. Immediately close modal and reset form
    setContent('');
    setImageUrl('');
    setSelectedFile(null);
    setSelectedFileType(null);
    setFilePreview(null);
    setShowImageInput(false);
    setTaggedFriends([]);
    setShowTagFriendsModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsOpenModal(false);
    setIsSubmitting(false);

    // 3. Perform file upload and database persistence in the background
    (async () => {
      try {
        let mediaUrls: string[] = [];
        if (fileToUpload) {
          try {
            const mediaItem = await mediaService.uploadMedia(fileToUpload, 'posts');
            if (mediaItem && mediaItem.fileUrl) {
              mediaUrls = [mediaItem.fileUrl];
            }
          } catch (uploadErr) {
            console.warn('Failed to upload file to media service, attempting direct multipart fallback:', uploadErr);
          }
        } else if (uploadedUrl) {
          mediaUrls = [uploadedUrl];
        }

        const files: File[] = (fileToUpload && mediaUrls.length === 0) ? [fileToUpload] : [];
        const createdPost = await postService.createPost(
          fullContent,
          postPrivacy,
          files,
          mediaUrls,
          targetGroupId,
          taggedUserIds
        );

        if ((!createdPost.mediaUrls || createdPost.mediaUrls.length === 0) && mediaUrls.length > 0) {
          createdPost.mediaUrls = mediaUrls;
          createdPost.mediaList = [{
            fileUrl: mediaUrls[0],
            mediaType: isVideoFile ? 'VIDEO' : 'IMAGE',
          }];
        }

        if (!createdPost.authorName || createdPost.authorName === 'Thành viên KLTN') {
          createdPost.authorName = user?.fullName || user?.username || 'Bạn';
        }
        if (!createdPost.authorAvatar && user?.avatar) {
          createdPost.authorAvatar = user.avatar;
        }

        // Notify all views to seamlessly swap the temp post with the real persisted post
        window.dispatchEvent(
          new CustomEvent('optimistic_post_settled', {
            detail: { tempId, realPost: createdPost },
          })
        );

        if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(filePreviewUrl);
        }

        toast.showSuccess(isVideoFile ? 'Đã đăng video thành công!' : 'Đã đăng bài viết mới thành công!');
      } catch (err: any) {
        console.error('Failed to create post in background:', err);
        window.dispatchEvent(
          new CustomEvent('optimistic_post_failed', {
            detail: { tempId },
          })
        );
        if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(filePreviewUrl);
        }
        const errorMsg = err?.response?.data?.message || err?.message || 'Không thể đăng bài viết. Vui lòng thử lại sau.';
        toast.showError(errorMsg);
      }
    })();
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
    taggedFriends,
    setTaggedFriends,
    showTagFriendsModal,
    setShowTagFriendsModal,
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
