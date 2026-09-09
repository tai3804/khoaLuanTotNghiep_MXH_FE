import React, { useRef } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const StoriesBar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sample stories matching user's screenshot
  const stories = [
    {
      id: '1',
      name: 'DUDI Software',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      bgImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=600&fit=crop',
    },
    {
      id: '2',
      name: 'Ánh Ngọc',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      bgImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
    },
    {
      id: '3',
      name: 'Văn Dư',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=600&fit=crop',
    },
    {
      id: '4',
      name: 'Nhi Nhi',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
      bgImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop',
    },
    {
      id: '5',
      name: 'Trần Quốc Huy',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=600&fit=crop',
    },
  ];

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/bar mb-4">
      <div
        ref={scrollRef}
        className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-none select-none scroll-smooth"
      >
        {/* Create Story card */}
        <div className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] transition flex flex-col justify-between">
          <div className="h-[72%] w-full overflow-hidden bg-gray-100 dark:bg-[#3a3b3c]">
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

        {/* Stories from friends */}
        {stories.map((story) => (
          <div
            key={story.id}
            className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-[#3a3b3c] transition border border-gray-200/40 dark:border-transparent"
          >
            {/* Background Story Image */}
            <img
              src={story.bgImage}
              alt={story.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100"
            />
            {/* Dark gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

            {/* Author Avatar with Blue Story Ring */}
            <div className="absolute top-3 left-3 z-10">
              <img
                src={story.avatar}
                alt={story.name}
                className="w-9 h-9 rounded-full object-cover ring-4 ring-[#1877f2] shadow-sm"
              />
            </div>

            {/* Author Name */}
            <div className="absolute bottom-2 inset-x-2 z-10">
              <span className="text-[12px] font-semibold text-white drop-shadow-md truncate block">
                {story.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Right navigation arrow button */}
      <button
        onClick={handleScrollRight}
        className="w-10 h-10 rounded-full bg-white dark:bg-[#3a3b3c] hover:bg-gray-100 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] shadow-xl border border-gray-200 dark:border-[#4e4f50] flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer transition"
        title="Xem thêm tin"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
