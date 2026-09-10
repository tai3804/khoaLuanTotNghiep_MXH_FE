import React, { useState, useEffect } from 'react';
import { X, HardDrive, Trash2, ExternalLink, Copy, Check, Image as ImageIcon, Video, RefreshCw } from 'lucide-react';
import { mediaService, MediaItem, UserStorageQuota } from '../../services/mediaService';
import { useToast } from '../../context/ToastContext';

interface MediaGalleryModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaGalleryModal: React.FC<MediaGalleryModalProps> = ({ userId, isOpen, onClose }) => {
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

  if (!isOpen) return null;

  const handleDelete = async (fileKey: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa file này khỏi AWS S3 và hệ thống?')) return;
    setDeletingKey(fileKey);
    try {
      await mediaService.deleteMedia(fileKey);
      toast.showSuccess('Đã xóa media thành công khỏi AWS S3!');
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
    toast.showSuccess('Đã sao chép liên kết S3 CloudFront!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in cursor-pointer">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#242526] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between bg-gray-50/50 dark:bg-[#18191a]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#3a3b3c] text-[#1877f2]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">Thư viện Media & Dung lượng lưu trữ</h3>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">Quản lý file ảnh, video đã lưu trên AWS S3 Bucket</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadMediaData}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-[#b0b3b8] transition cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-[#b0b3b8] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quota Progress Bar Banner */}
        {quota && (
          <div className="px-5 py-3.5 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-gray-200/80 dark:border-[#393a3b]">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-gray-700 dark:text-[#e4e6eb]">
              <span>Dung lượng đã sử dụng: <strong className="text-[#1877f2]">{quota.usedReadable}</strong> / {quota.maxQuotaReadable}</span>
              <span className="font-bold text-[#1877f2]">{quota.usedPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-[#3a3b3c] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1877f2] to-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(quota.usedPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Gallery Content */}
        <div className="p-5 overflow-y-auto flex-1 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin text-[#1877f2] mb-3" />
              <p className="text-xs font-semibold">Đang tải danh sách media từ AWS S3...</p>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
              <ImageIcon className="w-12 h-12 stroke-[1.5] text-gray-300 dark:text-[#4e4f50] mb-3" />
              <p className="text-sm font-semibold text-gray-700 dark:text-[#e4e6eb]">Chưa có file media nào</p>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mt-1">Các ảnh và video bạn tải lên bài viết, story hoặc avatar sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {mediaList.map((item) => {
                const isVideo = item.mediaType === 'VIDEO' || item.fileUrl.endsWith('.mp4') || item.fileUrl.endsWith('.webm');
                const formattedSize = item.fileSize ? `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'N/A';

                return (
                  <div
                    key={item.id || item.fileKey}
                    className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#393a3b] bg-gray-100 dark:bg-[#18191a] aspect-square flex flex-col justify-between shadow-sm hover:shadow-md transition"
                  >
                    {/* Media Preview */}
                    {isVideo ? (
                      <video src={item.fileUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img
                        src={item.fileUrl}
                        alt={item.originalFilename || 'Media'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white flex items-center space-x-1">
                      {isVideo ? <Video className="w-3 h-3 text-red-400" /> : <ImageIcon className="w-3 h-3 text-blue-400" />}
                      <span>{item.folder || 'media'}</span>
                    </div>

                    {/* Size Overlay */}
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-gray-200 font-mono">
                      {formattedSize}
                    </div>

                    {/* Hover Actions Bar */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setPreviewMedia(item)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleCopyUrl(item.fileUrl, item.fileKey)}
                        className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition cursor-pointer"
                        title="Sao chép URL CloudFront"
                      >
                        {copiedKey === item.fileKey ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDelete(item.fileKey)}
                        disabled={deletingKey === item.fileKey}
                        className="p-2 rounded-full bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition cursor-pointer disabled:opacity-50"
                        title="Xóa khỏi S3"
                      >
                        {deletingKey === item.fileKey ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Media Detail Lightbox Modal */}
      {previewMedia && (
        <div onClick={() => setPreviewMedia(null)} className="fixed inset-0 z-60 bg-black/90 p-4 flex items-center justify-center cursor-pointer">
          <button
            onClick={() => setPreviewMedia(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="max-w-3xl w-full max-h-[85vh] flex flex-col items-center cursor-default">
            {previewMedia.mediaType === 'VIDEO' || previewMedia.fileUrl.endsWith('.mp4') ? (
              <video src={previewMedia.fileUrl} controls autoPlay className="max-h-[75vh] w-auto rounded-xl shadow-2xl" />
            ) : (
              <img src={previewMedia.fileUrl} alt="Preview" className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl" />
            )}
            <div className="mt-3 text-center text-white space-y-1">
              <p className="text-xs font-semibold">{previewMedia.originalFilename}</p>
              <p className="text-[11px] text-gray-400 font-mono truncate max-w-xl">{previewMedia.fileUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
