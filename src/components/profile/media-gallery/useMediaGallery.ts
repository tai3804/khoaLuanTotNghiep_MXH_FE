import { useState, useEffect } from 'react';
import { mediaService, MediaItem, UserStorageQuota } from '../../../services/mediaService';
import { useToast } from '../../../context/ToastContext';

interface UseMediaGalleryProps {
  userId: string;
  isOpen: boolean;
}

export const useMediaGallery = ({ userId, isOpen }: UseMediaGalleryProps) => {
  const toast = useToast();
  const [quota, setQuota] = useState<UserStorageQuota | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const loadMediaData = async () => {
    setLoading(true);
    try {
      const [quotaData, galleryData] = await Promise.all([
        mediaService.getUserQuota().catch(() => null),
        mediaService.getUserMediaGallery(userId, 0, 50).catch(() => ({ content: [] })),
      ]);

      if (quotaData) setQuota(quotaData);
      if (galleryData && Array.isArray(galleryData.content)) {
        setMediaList(galleryData.content);
      }
    } catch (err: any) {
      console.error('Failed to load media gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadMediaData();
    }
  }, [isOpen, userId]);

  const handleDelete = async (fileKey: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa file này?')) return;
    setDeletingKey(fileKey);
    try {
      await mediaService.deleteMedia(fileKey);
      toast.showSuccess('Đã xóa file thành công!');
      setMediaList((prev) => prev.filter((m) => m.fileKey !== fileKey));
      if (previewMedia?.fileKey === fileKey) setPreviewMedia(null);

      // Reload quota
      const q = await mediaService.getUserQuota().catch(() => null);
      if (q) setQuota(q);
    } catch (err: any) {
      toast.showError('Xóa file thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingKey(null);
    }
  };

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    toast.showSuccess('Đã sao chép liên kết!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return {
    quota,
    mediaList,
    loading,
    deletingKey,
    copiedKey,
    previewMedia,
    setPreviewMedia,
    loadMediaData,
    handleDelete,
    handleCopyUrl,
  };
};
