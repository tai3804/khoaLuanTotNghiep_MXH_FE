import React from 'react';
import { Post } from '../../types';
import {
  useCreatePost,
  QuickCreatePostTrigger,
  CreatePostModalHeader,
  CreatePostForm,
  LiveVideoModal,
} from './create-post';

interface CreatePostBoxProps {
  onPostCreated: (newPost: Post) => void;
  groupId?: string;
}

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({ onPostCreated, groupId }) => {
  const {
    user,
    isAuthenticated,
    t,
    userFirstName,
    isOpenModal,
    setIsOpenModal,
    isLiveModalOpen,
    setIsLiveModalOpen,
    content,
    setContent,
    imageUrl,
    setImageUrl,
    filePreview,
    selectedFileType,
    taggedFriends,
    setTaggedFriends,
    showTagFriendsModal,
    setShowTagFriendsModal,
    privacy,
    setPrivacy,
    showImageInput,
    setShowImageInput,
    isSubmitting,
    scheduledPublishAt,
    setScheduledPublishAt,
    fileInputRef,
    handleOpen,
    handleOpenLive,
    handleOpenFilePicker,
    handleFileChange,
    handleClearFile,
    handleStartLiveStream,
    handleSubmit,
  } = useCreatePost({ onPostCreated, groupId });

  return (
    <>
      {/* Quick Trigger Box on Feed */}
      <QuickCreatePostTrigger
        user={user}
        userFirstName={userFirstName}
        isAuthenticated={isAuthenticated}
        onOpen={handleOpen}
        onOpenLive={handleOpenLive}
        onOpenFilePicker={handleOpenFilePicker}
      />

      {/* Expanded Create Post Modal */}
      {isOpenModal && (
        <div
          onClick={() => setIsOpenModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transition-all transform scale-100 cursor-default"
          >
            <CreatePostModalHeader onClose={() => setIsOpenModal(false)} />

            <CreatePostForm
              user={user}
              privacy={privacy}
              setPrivacy={setPrivacy}
              content={content}
              setContent={setContent}
              showImageInput={showImageInput}
              setShowImageInput={setShowImageInput}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              filePreview={filePreview}
              selectedFileType={selectedFileType}
              onClearFile={handleClearFile}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              isSubmitting={isSubmitting}
              handleSubmit={handleSubmit}
              t={t}
              taggedFriends={taggedFriends}
              setTaggedFriends={setTaggedFriends}
              showTagFriendsModal={showTagFriendsModal}
              setShowTagFriendsModal={setShowTagFriendsModal}
              scheduledPublishAt={scheduledPublishAt}
              setScheduledPublishAt={setScheduledPublishAt}
            />
          </div>
        </div>
      )}

      {/* Live Video Broadcasting Modal */}
      <LiveVideoModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        user={user}
        onStartLiveStream={handleStartLiveStream}
      />
    </>
  );
};
