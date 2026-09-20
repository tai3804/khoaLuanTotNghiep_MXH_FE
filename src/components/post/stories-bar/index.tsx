import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useStoriesData } from './useStoriesData';
import { CreateStoryCard } from './CreateStoryCard';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewerModal } from './StoryViewerModal';
import { UserAvatar } from '../../common/UserAvatar';

export const StoriesBar: React.FC = () => {
  const data = useStoriesData();
  
  return (
    <div className="relative mb-4 bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-3 flex items-center overflow-hidden h-[200px]">
      <div
        ref={data.scrollRef}
        className="flex space-x-2.5 overflow-x-auto overflow-y-hidden hide-scrollbar scroll-smooth w-full h-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Nút Tạo Tin Của Bạn */}
        <CreateStoryCard
          user={data.user}
          onOpenModal={() => data.setShowCreateModal(true)}
          t={data.t}
        />

        {/* Danh sách tin của bạn bè / server */}
        {data.loading && data.userStoriesList.length === 0 ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="min-w-[110px] w-[110px] h-full bg-gray-200 dark:bg-[#3a3b3c] rounded-xl animate-pulse shrink-0 border border-gray-100 dark:border-[#4e4f50]"
            />
          ))
        ) : (
          data.userStoriesList.map((userStoryGrp) => (
            <div
              key={userStoryGrp.userId}
              onClick={() => data.setSelectedStory(userStoryGrp)}
              className="group relative min-w-[110px] w-[110px] h-full rounded-xl overflow-hidden cursor-pointer shrink-0 shadow-sm border border-black/5 dark:border-white/5"
            >
              <img
                src={userStoryGrp.stories[0]?.mediaUrl || userStoryGrp.userAvatar || '/default-avatar.png'}
                alt={userStoryGrp.userName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition duration-300" />
              <div className="absolute top-2 left-2 ring-2 ring-[#1877f2] rounded-full p-[1px] bg-white dark:bg-[#242526]">
                <UserAvatar src={userStoryGrp.userAvatar} alt={userStoryGrp.userName} size="sm" />
              </div>
              <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-bold leading-tight truncate drop-shadow-md">
                {userStoryGrp.userName}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={data.handleScrollRight}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-[#3a3b3c] rounded-full shadow-md flex items-center justify-center text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#4e4f50] transition z-10 hidden md:flex cursor-pointer"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Modals */}
      <CreateStoryModal
        isOpen={data.showCreateModal}
        onClose={() => data.setShowCreateModal(false)}
        imageUrl={data.imageUrl}
        setImageUrl={data.setImageUrl}
        creating={data.creating}
        uploadingMedia={data.uploadingMedia}
        storyFileInputRef={data.storyFileInputRef}
        handleStoryFileSelect={data.handleStoryFileSelect}
        handleCreateStorySubmit={data.handleCreateStorySubmit}
      />

      <StoryViewerModal
        selectedStory={data.selectedStory}
        onClose={() => data.setSelectedStory(null)}
      />
    </div>
  );
};

export * from './useStoriesData';
export * from './CreateStoryCard';
export * from './CreateStoryModal';
export * from './StoryViewerModal';

