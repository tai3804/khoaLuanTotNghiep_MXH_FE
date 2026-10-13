import { useState, useEffect } from 'react';
import { mediaService, MediaItem, UserStorageQuota } from '../../../services/mediaService';
import { useToast } from '../../../context/ToastContext';

interface UseMediaGalleryProps {
  userId: string;
  isOpen: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const useMediaGallery = ({ userId, isOpen }: UseMediaGalleryProps) => {
  const toast = useToast();
  const [quota, setQuota] = useState<UserStorageQuota | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const calculateQuota = (quotaData: UserStorageQuota | null, list: MediaItem[]): UserStorageQuota => {
    const listTotalBytes = list.reduce((acc, m) => acc + (Number(m.fileSize) || 0), 0);
    const usedBytes = Math.max(quotaData?.usedBytes || 0, listTotalBytes);
    const maxQuotaBytes = quotaData?.maxQuotaBytes || 1024 * 1024 * 1024; // 1 GB default
    const usedPercentage = Math.min(100, Math.round((usedBytes / maxQuotaBytes) * 100 * 10) / 10);

    return {
      userId: quotaData?.userId || userId,
      usedBytes,
      maxQuotaBytes,
      usedPercentage,
      usedReadable: formatBytes(usedBytes),
      maxQuotaReadable: formatBytes(maxQuotaBytes),
    };
  };

  const loadMediaData = async () => {
    setLoading(true);
    try {
      const targetId = userId || 'me';
      const [quotaData, galleryData] = await Promise.all([
        mediaService.getUserQuota().catch(() => null),
        mediaService.getUserMediaGallery(targetId, 0, 50).catch(() => ({ content: [] })),
      ]);

      const items = Array.isArray(galleryData?.content) ? galleryData.content : [];
      setMediaList(items);
      setQuota(calculateQuota(quotaData, items));
    } catch (err: any) {
      console.error('Failed to load media gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMediaData();
    }
  }, [isOpen, userId]);

  const handleDelete = async (fileKey: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa file này?')) return;
    setDeletingKey(fileKey);
    try {
      await mediaService.deleteMedia(fileKey);
      toast.showSuccess('Đã xóa file thành công!');
      const updatedList = mediaList.filter((m) => m.fileKey !== fileKey);
      setMediaList(updatedList);
      if (previewMedia?.fileKey === fileKey) setPreviewMedia(null);

      // Reload quota based on updated list
      const q = await mediaService.getUserQuota().catch(() => null);
      setQuota(calculateQuota(q, updatedList));
    } catch (err: any) {
      toast.showError('Xóa file thất bại: ' + (err?.response?.data?.message || err.message));
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
