import React, { useRef, useState, useEffect } from 'react';
import { Plus, ChevronRight, Image as ImageIcon, X, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { storyService, authorProfileCache } from '../../services/api';
import { mediaService } from '../../services/mediaService';

export const StoriesBar: React.FC = () => {
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
    toast.showInfo('Đang tải file story lên AWS S3...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'stories');
      setImageUrl(uploaded.fileUrl);
      toast.showSuccess('Tải media lên AWS S3 thành công!');
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

  return (
    <div className="relative group/bar mb-4">
      <div
        ref={scrollRef}
        className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-none select-none scroll-smooth"
      >
        {/* Create Story Card */}
        <div
          onClick={() => setShowCreateModal(true)}
          className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] transition flex flex-col justify-between"
        >
          {/* Top 72% area with subtle gradient background and distinct circular avatar */}
          <div className="h-[72%] w-full overflow-hidden bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-gray-100 dark:from-[#1877f2]/25 dark:via-blue-900/10 dark:to-[#3a3b3c] flex items-center justify-center relative">
            <div className="w-14 h-14 rounded-full ring-4 ring-white dark:ring-[#242526] shadow-md overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] group-hover:scale-105 transition duration-300">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt={user?.fullName || 'Tạo tin'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
            </div>
          </div>

          {/* Bottom 28% area with Plus icon badge */}
          <div className="h-[28%] bg-white dark:bg-[#242526] flex flex-col items-center justify-end pb-2.5 relative">
            <div className="w-9 h-9 rounded-full bg-[#1877f2] border-4 border-white dark:border-[#242526] flex items-center justify-center text-white shadow-md absolute -top-4.5 group-hover:bg-[#166fe5] group-hover:scale-110 transition">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-[12px] font-semibold text-gray-900 dark:text-[#e4e6eb] leading-tight">
              {t('createStory') || 'Tạo tin'}
            </span>
          </div>
        </div>

        {/* Real Stories from Active Backend */}
        {userStoriesList.map((userStoryItem: any) => {
          const authorId = String(userStoryItem.userId);
          const cached = authorProfileCache[authorId];
          const authorName =
            userStoryItem.fullName ||
            cached?.name ||
            (userStoryItem.lastName || userStoryItem.firstName
              ? `${userStoryItem.lastName || ''} ${userStoryItem.firstName || ''}`.trim()
              : 'Thành viên KLTN');

          const avatarSrc = userStoryItem.avatarUrl || cached?.avatar || '/default-avatar.png';
          const stories = userStoryItem.stories || [];
          const firstStory = stories[0] || {};
          const bgImage = firstStory.mediaUrl || null;

          return (
            <div
              key={authorId}
              onClick={() => {
                if (firstStory.id) {
                  storyService.viewStory(firstStory.id).catch(() => {});
                }
                setSelectedStory({ authorName, avatarSrc, firstStory });
              }}
              className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-gray-900 transition border border-gray-200/40 dark:border-transparent"
            >
              {/* Background Story Image or Colorful Gradient */}
              {bgImage ? (
                <img
                  src={bgImage}
                  alt={authorName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-3 text-center">
                  <span className="text-[11px] font-bold text-white line-clamp-3 leading-snug">
                    {firstStory.content || 'Tin mới 24h'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

              {/* Author Avatar with Story Ring */}
              <div className="absolute top-3 left-3 z-10">
                <img
                  src={avatarSrc}
                  alt={authorName}
                  className="w-9 h-9 rounded-full object-cover ring-4 ring-[#1877f2] shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
              </div>

              {/* Author Name */}
              <div className="absolute bottom-2 inset-x-2 z-10">
                <span className="text-[12px] font-semibold text-white drop-shadow-md truncate block">
                  {authorName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right navigation arrow button */}
      {userStoriesList.length > 3 && (
        <button
          onClick={handleScrollRight}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#3a3b3c] hover:bg-gray-100 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] shadow-xl border border-gray-200 dark:border-[#4e4f50] flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer transition"
          title="Xem thêm tin"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div onClick={() => setShowCreateModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#242526] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-[#393a3b] space-y-4 cursor-default">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-[#393a3b]">
              <h3 className="text-lg font-black text-gray-900 dark:text-[#e4e6eb]">Tạo tin 24h</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStorySubmit} className="space-y-4">
              {/* File Upload Button / Area */}
              <div>
                <input
                  type="file"
                  ref={storyFileInputRef}
                  onChange={handleStoryFileSelect}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => storyFileInputRef.current?.click()}
                  disabled={uploadingMedia}
                  className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#4e4f50] hover:border-[#1877f2] bg-gray-50 dark:bg-[#18191a] hover:bg-blue-50/50 text-gray-700 dark:text-[#e4e6eb] font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
                >
                  {uploadingMedia ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#1877f2]" />
                      <span>Đang nén & tải file lên AWS S3...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#1877f2]" />
                      <span>Tải ảnh / video từ thiết bị lên S3</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#e4e6eb] mb-1">
                  Hoặc nhập URL trực tiếp
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-100 dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                  />
                </div>
              </div>

              {imageUrl.trim() && (
                <div className="w-full h-44 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] flex items-center justify-center">
                  {imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') ? (
                    <video src={imageUrl.trim()} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={imageUrl.trim()} alt="Preview" className="w-full h-full object-cover" />
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating || !imageUrl.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-50 rounded-xl shadow transition"
                >
                  {creating ? 'Đang chia sẻ...' : 'Chia sẻ lên tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Story Detail Viewer Modal */}
      {selectedStory && (
        <div onClick={() => setSelectedStory(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-pointer">
          <button
            onClick={() => setSelectedStory(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          <div onClick={(e) => e.stopPropagation()} className="relative max-w-sm w-full h-[80vh] rounded-2xl overflow-hidden bg-black flex flex-col justify-between p-4 shadow-2xl cursor-default">
            {/* Author info */}
            <div className="flex items-center space-x-3 z-10 bg-gradient-to-b from-black/80 to-transparent p-2 rounded-xl">
              <img src={selectedStory.avatarSrc} alt={selectedStory.authorName} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500" />
              <span className="font-bold text-white text-sm">{selectedStory.authorName}</span>
            </div>

            {/* Media Image */}
            <img
              src={selectedStory.firstStory?.mediaUrl || selectedStory.avatarSrc}
              alt={selectedStory.authorName}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
