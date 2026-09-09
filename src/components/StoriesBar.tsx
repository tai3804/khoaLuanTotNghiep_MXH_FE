import React, { useState, useRef } from 'react';
import { Plus, ChevronRight, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export interface StoryItem {
  id: string;
  authorName: string;
  authorAvatar: string;
  mediaUrl: string;
  createdAt: string;
  isSelf?: boolean;
}

export const StoriesBar: React.FC = () => {
  const { user, isAuthenticated, openLoginModal } = useAuth();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real stories list (initially empty because no mock data)
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);

  const handleCreateStoryClick = () => {
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    const newStory: StoryItem = {
      id: 'story-' + Date.now(),
      authorName: user?.fullName || user?.username || 'Bạn',
      authorAvatar: user?.avatar || '/default-avatar.png',
      mediaUrl: previewUrl,
      createdAt: 'Vừa xong',
      isSelf: true,
    };

    setStories((prev) => [newStory, ...prev]);
    // reset input
    e.target.value = '';
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div className="relative group/bar mb-4">
        {/* Hidden file input for uploading a real story */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />

        <div
          ref={scrollRef}
          className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-none select-none scroll-smooth items-stretch"
        >
          {/* 1. Nơi để người dùng bấm ĐĂNG TIN (Create Story Card) */}
          <div
            onClick={handleCreateStoryClick}
            className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] transition flex flex-col justify-between"
          >
            <div className="h-[72%] w-full overflow-hidden bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center">
              <img
                src={user?.avatar || '/default-avatar.png'}
                alt={user?.fullName || 'Tạo tin'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="h-[28%] bg-white dark:bg-[#242526] flex flex-col items-center justify-end pb-2 relative">
              <div className="w-9 h-9 rounded-full bg-[#1877f2] border-4 border-white dark:border-[#242526] flex items-center justify-center text-white shadow-md absolute -top-4.5 group-hover:bg-[#166fe5] transition">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-semibold text-gray-900 dark:text-[#e4e6eb] leading-tight mt-3">
                {t('createStory') || 'Tạo tin'}
              </span>
            </div>
          </div>

          {/* 2. Các tin người dùng đã đăng (chỉ hiển thị khi có dữ liệu thật) */}
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-[#3a3b3c] transition border border-gray-200/40 dark:border-transparent"
            >
              <img
                src={story.mediaUrl}
                alt={story.authorName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

              {/* Author Avatar with Blue Story Ring */}
              <div className="absolute top-3 left-3 z-10">
                <img
                  src={story.authorAvatar}
                  alt={story.authorName}
                  className="w-9 h-9 rounded-full object-cover ring-4 ring-[#1877f2] shadow-sm"
                />
              </div>

              {/* Author Name */}
              <div className="absolute bottom-2 inset-x-2 z-10">
                <span className="text-[12px] font-semibold text-white drop-shadow-md truncate block">
                  {story.authorName}
                </span>
              </div>
            </div>
          ))}

          {/* 3. Khung placeholder khi chưa có ai đăng tin (để khu vực không bị hẫng) */}
          {stories.length === 0 && (
            <div
              onClick={handleCreateStoryClick}
              className="relative w-36 sm:w-44 h-48 sm:h-52 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#393a3b] hover:border-[#1877f2] dark:hover:border-[#1877f2] cursor-pointer flex-shrink-0 flex flex-col items-center justify-center p-3 text-center transition bg-white/40 dark:bg-[#242526]/40 group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-[#3a3b3c] flex items-center justify-center text-[#1877f2] mb-2 group-hover:scale-110 transition">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] leading-tight">
                Chia sẻ tin của bạn
              </p>
              <p className="text-[11px] text-gray-400 dark:text-[#b0b3b8] mt-1">
                Tin sẽ hiển thị trong 24 giờ tới bạn bè
              </p>
            </div>
          )}
        </div>

        {stories.length > 2 && (
          <button
            onClick={handleScrollRight}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#3a3b3c] hover:bg-gray-100 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] shadow-xl border border-gray-200 dark:border-[#4e4f50] flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer transition"
            title="Xem thêm tin"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <button
            onClick={() => setActiveStory(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative w-full max-w-sm h-[75vh] max-h-[640px] rounded-2xl overflow-hidden shadow-2xl bg-black flex flex-col justify-between">
            {/* Story Header */}
            <div className="absolute top-0 inset-x-0 p-4 z-20 bg-gradient-to-b from-black/80 to-transparent flex items-center space-x-3">
              <img
                src={activeStory.authorAvatar}
                alt={activeStory.authorName}
                className="w-10 h-10 rounded-full ring-2 ring-white object-cover"
              />
              <div className="text-white min-w-0 flex-1">
                <h4 className="font-bold text-sm truncate">{activeStory.authorName}</h4>
                <p className="text-[11px] text-gray-300">{activeStory.createdAt}</p>
              </div>
            </div>

            {/* Story Media */}
            <img
              src={activeStory.mediaUrl}
              alt="Story"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};
