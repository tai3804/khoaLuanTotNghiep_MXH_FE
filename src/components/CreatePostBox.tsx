import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Post } from '../types';
import { UserAvatar } from './UserAvatar';
import { Image, Tag, Smile, Globe, Users, Lock, X, Send } from 'lucide-react';

interface CreatePostBoxProps {
  onPostCreated: (newPost: Post) => void;
}

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({ onPostCreated }) => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feelings = ['😊 Đang cảm thấy vui vẻ', '☕ Đang uống cà phê', '🚀 Đang hào hứng', '💻 Đang lập trình', '🎧 Đang nghe nhạc'];

  const handleOpen = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    setIsOpenModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    if (!content.trim() && !imageUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const mediaUrls = imageUrl.trim() ? [imageUrl.trim()] : [];
      const userAvatar = user?.avatar || '';
      const userName = user?.fullName || user?.username || 'Bạn';

      let fullContent = content.trim();
      if (selectedFeeling) {
        fullContent = `${selectedFeeling}\n\n${fullContent}`;
      }

      const newPost: Post = {
        id: 'post-' + Date.now(),
        userId: user?.id || 'me',
        authorName: userName,
        authorAvatar: userAvatar,
        content: fullContent,
        mediaUrls,
        createdAt: 'Vừa xong',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        comments: [],
      };

      onPostCreated(newPost);
      setContent('');
      setImageUrl('');
      setSelectedFeeling(null);
      setShowImageInput(false);
      setIsOpenModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Quick trigger box on feed */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 mb-4 border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="flex items-center space-x-3 mb-3">
          <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="md" />
          <button
            onClick={handleOpen}
            className="w-full bg-gray-100 dark:bg-slate-700/70 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-300 text-left rounded-full py-2.5 px-4 text-xs md:text-sm font-medium transition-colors cursor-pointer"
          >
            {!isAuthenticated
              ? 'Đăng nhập để chia sẻ trạng thái của bạn...'
              : (t('whatsOnYourMind') || 'Bạn đang nghĩ gì thế') + ', ' + (user?.fullName || user?.username || 'bạn') + '?'}
          </button>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700 pt-2 flex items-center justify-around">
          <button
            onClick={handleOpen}
            className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold transition"
          >
            <Image className="w-5 h-5 text-green-500" />
            <span>{t('photoVideo') || 'Ảnh/video'}</span>
          </button>
          <button
            onClick={handleOpen}
            className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold transition"
          >
            <Tag className="w-5 h-5 text-blue-500" />
            <span>{t('tagFriends') || 'Gắn thẻ bạn bè'}</span>
          </button>
          <button
            onClick={handleOpen}
            className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-300 text-xs font-semibold transition"
          >
            <Smile className="w-5 h-5 text-amber-500" />
            <span>{t('feelingActivity') || 'Cảm xúc/hoạt động'}</span>
          </button>
        </div>
      </div>

      {/* Expanded Create Post Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transition-all transform scale-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-slate-100">Tạo bài viết</h3>
              <button
                onClick={() => setIsOpenModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* User info & Audience selector */}
              <div className="flex items-center space-x-3">
                <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="lg" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-slate-100">
                    {user?.fullName || user?.username || 'Người dùng'}
                  </h4>
                  {/* Privacy Selector Pills */}
                  <div className="flex items-center space-x-1 mt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setPrivacy(privacy === 'public' ? 'friends' : privacy === 'friends' ? 'private' : 'public')
                      }
                      className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-md text-[11px] font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                    >
                      {privacy === 'public' && (
                        <>
                          <Globe className="w-3 h-3 text-blue-500" />
                          <span>Công khai</span>
                        </>
                      )}
                      {privacy === 'friends' && (
                        <>
                          <Users className="w-3 h-3 text-green-500" />
                          <span>Bạn bè</span>
                        </>
                      )}
                      {privacy === 'private' && (
                        <>
                          <Lock className="w-3 h-3 text-red-500" />
                          <span>Chỉ mình tôi</span>
                        </>
                      )}
                    </button>

                    {selectedFeeling && (
                      <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
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
                className="w-full bg-transparent text-gray-900 dark:text-slate-100 text-sm focus:outline-none resize-none placeholder-gray-400 dark:placeholder-slate-500 leading-relaxed"
                autoFocus
              />

              {/* Image URL Input or Preview */}
              {showImageInput && (
                <div className="relative p-3 bg-gray-50 dark:bg-slate-900/60 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 dark:text-slate-300">Thêm liên kết hình ảnh</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageInput(false);
                        setImageUrl('');
                      }}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Dán đường dẫn ảnh..."
                    className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-xs p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {imageUrl.trim() && (
                    <div className="relative rounded-xl overflow-hidden max-h-48 bg-black/5">
                      <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* Feelings bar */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {feelings.map((f, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedFeeling(selectedFeeling === f ? null : f)}
                    className={`text-[11px] px-2.5 py-1 rounded-full transition font-medium ${
                      selectedFeeling === f
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Additional Options Container */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-slate-200">Thêm vào bài viết của bạn</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="p-2 hover:bg-green-50 dark:hover:bg-slate-700 rounded-full text-green-500 transition"
                    title="Thêm ảnh"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full text-blue-500 transition"
                    title="Gắn thẻ"
                  >
                    <Tag className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 hover:bg-amber-50 dark:hover:bg-slate-700 rounded-full text-amber-500 transition"
                    title="Cảm xúc"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !imageUrl.trim())}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 rounded-2xl shadow-lg disabled:opacity-40 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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