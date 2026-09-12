import React from 'react';
import { ChevronRight } from 'lucide-react';
import { storyService, authorProfileCache } from '../../services/api';
import {
  useStoriesData,
  CreateStoryCard,
  CreateStoryModal,
  StoryViewerModal,
} from './stories-bar';

export const StoriesBar: React.FC = () => {
  const {
    user,
    t,
    scrollRef,
    userStoriesList,
    showCreateModal,
    setShowCreateModal,
    imageUrl,
    setImageUrl,
    creating,
    uploadingMedia,
    selectedStory,
    setSelectedStory,
    storyFileInputRef,
    handleScrollRight,
    handleStoryFileSelect,
    handleCreateStorySubmit,
  } = useStoriesData();

  return (
    <div className="relative group/bar mb-4">
      <div
        ref={scrollRef}
        className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-none select-none scroll-smooth"
      >
        {/* Create Story Card */}
        <CreateStoryCard
          user={user}
          onOpenModal={() => setShowCreateModal(true)}
          t={t}
        />

        {/* Real Stories List */}
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
      <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        creating={creating}
        uploadingMedia={uploadingMedia}
        storyFileInputRef={storyFileInputRef}
        handleStoryFileSelect={handleStoryFileSelect}
        handleCreateStorySubmit={handleCreateStorySubmit}
      />

      {/* Story Viewer Lightbox Modal */}
      <StoryViewerModal
        selectedStory={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </div>
  );
};
