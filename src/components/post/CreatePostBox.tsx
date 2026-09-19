import React from 'react';
import { Post } from '../../types';
import {
  useCreatePost,
  QuickCreatePostTrigger,
  CreatePostModalHeader,
  CreatePostForm,
} from './create-post';

interface CreatePostBoxProps {
  onPostCreated: (newPost: Post) => void;
}

export const CreatePostBox: React.FC<CreatePostBoxProps> = ({ onPostCreated }) => {
  const {
    user,
    isAuthenticated,
    t,
    userFirstName,
    isOpenModal,
    setIsOpenModal,
    content,
    setContent,
    imageUrl,
    setImageUrl,
    filePreview,
    setFilePreview,
    privacy,
    setPrivacy,
    showImageInput,
    setShowImageInput,
    selectedFeeling,
    setSelectedFeeling,
    setSelectedFile,
    isSubmitting,
    fileInputRef,
    feelings,
    handleOpen,
    handleFileChange,
    handleSubmit,
  } = useCreatePost({ onPostCreated });

  return (
    <>
      {/* Quick trigger box on feed */}
      <QuickCreatePostTrigger
        user={user}
        userFirstName={userFirstName}
        isAuthenticated={isAuthenticated}
        onOpen={handleOpen}
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
              selectedFeeling={selectedFeeling}
              setSelectedFeeling={setSelectedFeeling}
              content={content}
              setContent={setContent}
              showImageInput={showImageInput}
              setShowImageInput={setShowImageInput}
              imageUrl={imageUrl}
              setImageUrl={setImageUrl}
              filePreview={filePreview}
              setFilePreview={setFilePreview}
              setSelectedFile={setSelectedFile}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              feelings={feelings}
              isSubmitting={isSubmitting}
              handleSubmit={handleSubmit}
              t={t}
            />
          </div>
        </div>
      )}
    </>
  );
};
