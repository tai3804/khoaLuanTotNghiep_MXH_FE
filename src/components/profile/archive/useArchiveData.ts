import { useState, useEffect, useCallback } from 'react';
import { Post } from '../../../types';
import { postService } from '../../../services/postService';
import { mediaService, UserStorageQuota, MediaItem } from '../../../services/mediaService';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { ArchiveTab } from './types';

interface UseArchiveDataProps {
  userId: string;
  isOpen: boolean;
  onPostRestored?: (post: Post) => void;
}

const storageKey = (uId: string) => `profile_management_archived_posts_${uId}`;

export const useArchiveData = ({ userId, isOpen, onPostRestored }: UseArchiveDataProps) => {
  const toast = useToast();
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<ArchiveTab>('archived');
  const [archivedPosts, setArchivedPosts] = useState<Post[]>([]);
  const [activePosts, setActivePosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Storage & Media State
  const [quota, setQuota] = useState<UserStorageQuota | null>(null);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    if (!userId) return;
    setLoadingPosts(true);
    setLoadingStorage(true);
    try {
      // 1. Fetch in parallel: archived posts, user posts, quota, media gallery
      const [backendArchivedRes, userPostsRes, quotaRes, galleryRes] = await Promise.allSettled([
        postService.getUserArchivedPosts(userId, 0, 50),
        postService.getUserPosts(userId, 0, 50),
        mediaService.getUserQuota(),
        mediaService.getUserMediaGallery(userId || 'me', 0, 50),
      ]);

      const backendArchived = backendArchivedRes.status === 'fulfilled' ? backendArchivedRes.value : [];
      const userPosts = userPostsRes.status === 'fulfilled' ? userPostsRes.value : [];

      // 2. Local archived IDs fallback
      let localIds: string[] = [];
      try {
        localIds = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
      } catch {}

      let combinedArchived = [...backendArchived];
      const visibleActive = userPosts.filter(
        (p) => !p.isArchived && !localIds.includes(p.id) && !combinedArchived.some((a) => a.id === p.id)
      );

      if (localIds.length > 0) {
        for (const id of localIds) {
          if (!combinedArchived.some((p) => p.id === id)) {
            const foundInUser = userPosts.find((p) => p.id === id);
            if (foundInUser) {
              combinedArchived.push({ ...foundInUser, isArchived: true });
            } else {
              try {
                const p = await postService.getPostById(id);
                if (p) combinedArchived.push({ ...p, isArchived: true });
              } catch {}
            }
          }
        }
      }

      setArchivedPosts(combinedArchived);
      setActivePosts(visibleActive);

      // 3. Storage & Media processing
      if (quotaRes.status === 'fulfilled') {
        setQuota(quotaRes.value);
      }

      let allMediaItems: MediaItem[] = [];
      if (galleryRes.status === 'fulfilled' && galleryRes.value?.content) {
        allMediaItems = [...galleryRes.value.content];
      }

      const existingUrls = new Set(allMediaItems.map((m) => m.fileUrl));

      // Aggregate all media from posts (both active and archived)
      const allPosts = [...userPosts, ...combinedArchived];
      allPosts.forEach((p) => {
        const pMediaUrls = p.mediaUrls || (p.mediaList ? p.mediaList.map((m: any) => m.fileUrl || m.url) : []);
        if (Array.isArray(pMediaUrls)) {
          pMediaUrls.forEach((url, idx) => {
            if (url && typeof url === 'string' && url.trim().length > 0 && !existingUrls.has(url)) {
              existingUrls.add(url);
              const isVid = Boolean(url.match(/\.(mp4|webm|mov|mkv)$/i) || url.includes('/video/'));
              allMediaItems.push({
                id: `post-media-${p.id}-${idx}`,
                userId: p.userId || userId,
                fileKey: url.split('/').pop() || `media-${idx}.jpg`,
                fileUrl: url,
                originalFilename: p.content ? `${p.content.slice(0, 30)}...` : 'Ảnh bài viết',
                fileSize: 1024 * 380, // Default estimate
                mediaType: isVid ? 'VIDEO' : 'IMAGE',
                folder: 'posts',
                createdAt: p.createdAt || new Date().toISOString(),
              });
            }
          });
        }
      });

      setMediaList(allMediaItems);
    } catch (e) {
      console.warn('Error loading all archive data:', e);
    } finally {
      setLoadingPosts(false);
      setLoadingStorage(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, loadAllData]);

  // Action: Archive an active post
  const handleArchivePost = async (postId: string) => {
    setArchivingId(postId);
    try {
      const archived = await postService.archivePost(postId, true);

      const targetPost = activePosts.find((p) => p.id === postId) || archived;
      setActivePosts((prev) => prev.filter((p) => p.id !== postId));
      setArchivedPosts((prev) => [{ ...targetPost, isArchived: true }, ...prev.filter((p) => p.id !== postId)]);

      try {
        const localIds = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
        if (!localIds.includes(postId)) {
          localIds.push(postId);
          localStorage.setItem(storageKey(userId), JSON.stringify(localIds));
        }
      } catch {}

      toast.showSuccess('Đã chuyển bài viết vào kho lưu trữ!');
      window.dispatchEvent(new CustomEvent('feed_refresh_needed'));
    } catch (e: any) {
      toast.showError('Không thể lưu trữ bài viết: ' + (e.message || 'Lỗi server'));
    } finally {
      setArchivingId(null);
    }
  };

  // Action: Restore an archived post back to timeline
  const handleRestore = async (postId: string) => {
    setRestoringId(postId);
    try {
      const restored = await postService.archivePost(postId, false);

      const targetPost = archivedPosts.find((p) => p.id === postId) || restored;
      setArchivedPosts((prev) => prev.filter((p) => p.id !== postId));
      setActivePosts((prev) => [{ ...targetPost, isArchived: false }, ...prev.filter((p) => p.id !== postId)]);

      try {
        const localIds = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
        const updated = localIds.filter((id: string) => id !== postId);
        localStorage.setItem(storageKey(userId), JSON.stringify(updated));
      } catch {}

      toast.showSuccess('Đã khôi phục bài viết về dòng thời gian!');
      window.dispatchEvent(new CustomEvent('feed_refresh_needed'));
      if (onPostRestored) onPostRestored(restored);
    } catch (e: any) {
      toast.showError('Không thể khôi phục bài viết: ' + (e.message || 'Lỗi server'));
    } finally {
      setRestoringId(null);
    }
  };

  // Action: Delete post permanently
  const handleDeletePost = async (postId: string) => {
    const ok = await confirm({
      title: 'Xóa vĩnh viễn bài viết',
      message: 'Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa vĩnh viễn',
      cancelText: 'Hủy bỏ',
      type: 'danger',
    });
    if (!ok) return;
    setDeletingId(postId);
    try {
      await postService.deletePost(postId);
      setArchivedPosts((prev) => prev.filter((p) => p.id !== postId));
      setActivePosts((prev) => prev.filter((p) => p.id !== postId));

      try {
        const localIds = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]');
        const updated = localIds.filter((id: string) => id !== postId);
        localStorage.setItem(storageKey(userId), JSON.stringify(updated));
      } catch {}

      toast.showSuccess('Đã xóa vĩnh viễn bài viết.');
      window.dispatchEvent(new CustomEvent('feed_refresh_needed'));
    } catch (e: any) {
      toast.showError('Không thể xóa bài viết: ' + (e.message || 'Lỗi server'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    toast.showSuccess('Đã sao chép liên kết tệp!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeleteMedia = async (fileKey: string) => {
    const ok = await confirm({
      title: 'Xóa tệp lưu trữ',
      message: 'Bạn có chắc muốn xóa tệp này khỏi bộ nhớ đám mây?',
      confirmText: 'Xóa tệp',
      cancelText: 'Hủy bỏ',
      type: 'danger',
    });
    if (!ok) return;
    setDeletingKey(fileKey);
    try {
      await mediaService.deleteMedia(fileKey);
      setMediaList((prev) => prev.filter((item) => item.fileKey !== fileKey));
      toast.showSuccess('Đã xóa tệp khỏi kho lưu trữ.');
    } catch (e: any) {
      toast.showError('Xóa tệp thất bại.');
    } finally {
      setDeletingKey(null);
    }
  };

  return {
    activeTab,
    setActiveTab,
    archivedPosts,
    activePosts,
    loadingPosts,
    restoringId,
    archivingId,
    deletingId,
    handleArchivePost,
    handleRestore,
    handleDeletePost,
    loadAllData,
    // Storage & Media
    quota,
    mediaList,
    loadingStorage,
    previewMedia,
    setPreviewMedia,
    copiedKey,
    deletingKey,
    handleCopyUrl,
    handleDeleteMedia,
  };
};
