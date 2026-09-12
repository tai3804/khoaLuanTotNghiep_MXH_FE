import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { storyService } from '../../../services/api';
import { mediaService } from '../../../services/mediaService';

export const useStoriesData = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const scrollRef = useRef<HTMLDivElement>(null);

  const [userStoriesList, setUserStoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const loadStories = async () => {
    if (!isAuthenticated) {
      setUserStoriesList([]);
      return;
    }
    setLoading(true);
    try {
      const data = await storyService.getStories();
      setUserStoriesList(Array.isArray(data) ? data : []);
    } catch {
      setUserStoriesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStories();
    } else {
      setUserStoriesList([]);
    }
  }, [isAuthenticated]);

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const handleStoryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    toast.showInfo('Đang tải file story lên Cloud Storage...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'stories');
      setImageUrl(uploaded.fileUrl);
      toast.showSuccess('Tải media lên thành công!');
    } catch (err: any) {
      toast.showError('Tải file thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleCreateStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    setCreating(true);
    try {
      const isVideo = imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm');
      await storyService.createStory(imageUrl.trim(), isVideo ? 'VIDEO' : 'IMAGE');
      setImageUrl('');
      setShowCreateModal(false);
      loadStories();
      toast.showSuccess('Tạo tin thành công!');
    } catch (err: any) {
      toast.showError('Không thể tạo tin: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  return {
    user,
    isAuthenticated,
    t,
    scrollRef,
    userStoriesList,
    loading,
    showCreateModal,
    setShowCreateModal,
    imageUrl,
    setImageUrl,
    creating,
    uploadingMedia,
    selectedStory,
    setSelectedStory,
    storyFileInputRef,
    handleScrollRight,
    handleStoryFileSelect,
    handleCreateStorySubmit,
  };
};
