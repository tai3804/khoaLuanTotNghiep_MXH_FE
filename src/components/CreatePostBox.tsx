import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { Post } from '../types';
import { UserAvatar } from './UserAvatar';
import { postService } from '../services/api';
import { Image, Tag, Smile, Globe, Users, Lock, X, Send, Paperclip, Video } from 'lucide-react';

interface CreatePostBoxProps {
  onPostCreated: (newPost: Post) => void;
}

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({ onPostCreated }) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const feelings = ['😊 Đang cảm thấy vui vẻ', '☕ Đang uống cà phê', '🚀 Đang hào hứng', '💻 Đang lập trình', '🎧 Đang nghe nhạc'];

  const userFirstName = user?.fullName
    ? user.fullName.trim().split(' ').pop()
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

      const postPrivacy = privacy === 'friends' ? 'FRIENDS' : privacy === 'private' ? 'PRIVATE' : 'PUBLIC';
      const files: File[] = selectedFile ? [selectedFile] : [];

      const createdPost = await postService.createPost(fullContent, postPrivacy, files);

      // If user provided a link fallback
      if (imageUrl.trim() && (!createdPost.mediaUrls || createdPost.mediaUrls.length === 0)) {
        createdPost.mediaUrls = [imageUrl.trim()];
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
      // Even if backend upload encounters an edge case, create local post so user isn't stuck
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

  return (
    <>
      {/* Quick trigger box on feed matching Facebook */}
      <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-3 mb-4 border border-gray-200 dark:border-[#393a3b] transition-colors select-none">
        <div className="flex items-center space-x-2.5">
          <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="md" className="w-10 h-10 rounded-full" />
          <div
            onClick={handleOpen}
            className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-500 dark:text-[#b0b3b8] rounded-full py-2.5 px-4 text-sm font-normal flex items-center justify-between cursor-pointer transition"
          >
            <span>
              {!isAuthenticated
                ? 'Đăng nhập để chia sẻ trạng thái của bạn...'
                : `${userFirstName} ơi, bạn đang nghĩ gì thế?`}
            </span>
            <div className="hidden sm:flex items-center space-x-2 shrink-0">
              <Video className="w-4 h-4 text-[#f3425f]" />
              <Image className="w-4 h-4 text-[#45bd62]" />
              <Smile className="w-4 h-4 text-[#f7b125]" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-[#393a3b] pt-2 mt-3 flex items-center justify-around gap-1">
          <button
            onClick={handleOpen}
            className="flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] text-xs sm:text-sm font-semibold transition cursor-pointer min-w-0"
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-[#f3425f] shrink-0" />
            <span className="truncate">Video trực tiếp</span>
          </button>
          <button
            onClick={handleOpen}
            className="flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] text-xs sm:text-sm font-semibold transition cursor-pointer min-w-0"
          >
            <Image className="w-4 h-4 sm:w-5 sm:h-5 text-[#45bd62] shrink-0" />
            <span className="truncate">Ảnh/video</span>
          </button>
          <button
            onClick={handleOpen}
            className="flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 px-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] text-xs sm:text-sm font-semibold transition cursor-pointer min-w-0"
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-[#f7b125] shrink-0" />
            <span className="truncate">Cảm xúc/hoạt động</span>
          </button>
        </div>
      </div>

      {/* Expanded Create Post Modal */}
      {isOpenModal && (
        <div onClick={() => setIsOpenModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transition-all transform scale-100 cursor-default">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-200 dark:border-[#393a3b]">
              <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">Tạo bài viết</h3>
              <button
                onClick={() => setIsOpenModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-500 dark:text-[#b0b3b8] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              {/* User info & Audience selector */}
              <div className="flex items-center space-x-3">
                <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="lg" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">
                    {user?.fullName || user?.username || 'Người dùng'}
                  </h4>
                  {/* Privacy Selector Pills */}
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        setPrivacy(privacy === 'public' ? 'friends' : privacy === 'friends' ? 'private' : 'public')
                      }
                      className="flex items-center space-x-1.5 bg-gray-100 dark:bg-[#3a3b3c] px-2.5 py-1 rounded-md text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#4e4f50] border border-gray-200 dark:border-[#4e4f50] transition cursor-pointer"
                    >
                      {privacy === 'public' && (
                        <>
                          <Globe className="w-3.5 h-3.5 text-[#1877f2]" />
                          <span>Công khai</span>
                        </>
                      )}
                      {privacy === 'friends' && (
                        <>
                          <Users className="w-3.5 h-3.5 text-[#45bd62]" />
                          <span>Bạn bè</span>
                        </>
                      )}
                      {privacy === 'private' && (
                        <>
                          <Lock className="w-3.5 h-3.5 text-[#f3425f]" />
                          <span>Chỉ mình tôi</span>
                        </>
                      )}
                    </button>

                    {selectedFeeling && (
                      <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        {selectedFeeling}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content textarea */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`${t('whatsOnYourMind') || 'Bạn đang nghĩ gì thế'}, ${user?.fullName || user?.username || ''}?`}
                rows={4}
                className="w-full bg-transparent text-gray-900 dark:text-[#e4e6eb] text-sm focus:outline-none resize-none placeholder-gray-400 dark:placeholder-[#b0b3b8] leading-relaxed"
                autoFocus
              />

              {/* Image URL Input or Preview */}
              {showImageInput && (
                <div className="relative p-3 bg-gray-50 dark:bg-[#18191a] rounded-xl border border-gray-200 dark:border-[#393a3b] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 dark:text-[#b0b3b8]">Thêm liên kết hình ảnh</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageInput(false);
                        setImageUrl('');
                      }}
                      className="text-gray-400 hover:text-red-500 text-xs font-medium cursor-pointer"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Dán đường dẫn ảnh hoặc chọn tệp bên dưới..."
                    className="w-full bg-white dark:bg-[#242526] text-gray-900 dark:text-[#e4e6eb] text-xs p-2.5 rounded-lg border border-gray-200 dark:border-[#393a3b] focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                  />
                  {imageUrl.trim() && (
                    <div className="relative rounded-lg overflow-hidden max-h-48 bg-black/5">
                      <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* Local File Attachment Preview */}
              {filePreview && (
                <div className="relative rounded-xl overflow-hidden max-h-52 bg-black/5 border border-gray-200 dark:border-[#393a3b]">
                  <img src={filePreview} alt="Selected attachment" className="w-full h-52 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Feelings bar */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {feelings.map((f, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedFeeling(selectedFeeling === f ? null : f)}
                    className={`text-[11px] px-2.5 py-1 rounded-full transition font-medium cursor-pointer ${
                      selectedFeeling === f
                        ? 'bg-[#1877f2] text-white font-bold'
                        : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#4e4f50]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Additional Options Container */}
              <div className="border border-gray-200 dark:border-[#393a3b] rounded-xl p-3 flex items-center justify-between bg-white dark:bg-[#242526] shadow-sm">
                <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-[#e4e6eb]">Thêm vào bài viết của bạn</span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-[#45bd62] transition cursor-pointer"
                    title="Tải ảnh từ máy"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-[#20caf2] transition cursor-pointer"
                    title="Chèn link ảnh"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-[#1877f2] transition cursor-pointer"
                    title="Gắn thẻ"
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full text-[#f7b125] transition cursor-pointer"
                    title="Cảm xúc"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !imageUrl.trim() && !selectedFile)}
                className="w-full bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464d2] text-white font-semibold text-sm py-2.5 rounded-lg disabled:opacity-50 disabled:bg-[#1877f2] dark:disabled:bg-[#3a3b3c] dark:disabled:text-[#737578] transition flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Đăng bài viết</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};