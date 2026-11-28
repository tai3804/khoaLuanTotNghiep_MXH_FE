import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { storyService } from '../../../services/api';

export const useStoriesData = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const scrollRef = useRef<HTMLDivElement>(null);

  const [userStoriesList, setUserStoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any | null>(null);

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

    const handleStoriesUpdated = () => {
      if (isAuthenticated) {
        loadStories();
      }
    };
    window.addEventListener('stories_updated', handleStoriesUpdated);
    return () => {
      window.removeEventListener('stories_updated', handleStoriesUpdated);
    };
  }, [isAuthenticated]);

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const openStory = (storyGroup: any) => {
    setSelectedStory(storyGroup);
    const firstUnviewed = (storyGroup?.stories || []).find((story: any) => !story.isViewedByMe);
    const isOwnStory = String(storyGroup?.userId) === String(user?.id);
    if (firstUnviewed?.id && !isOwnStory) {
      storyService.viewStory(firstUnviewed.id).catch((error) => {
        console.error('[Stories] Could not record story view:', error);
        toast.showError('Không thể ghi nhận lượt xem tin. Vui lòng thử lại.');
      });
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
    selectedStory,
    setSelectedStory,
    openStory,
    handleScrollRight,
    loadStories,
  };
};
