import React from 'react';
import { Post, UserProfile } from '../../../types';
import { CreatePostBox } from '../../post/CreatePostBox';
import { PostCard } from '../../../components/post/post-card';
import { ProfileIntroBox } from './ProfileIntroBox';
import { ProfilePhotosBox } from './ProfilePhotosBox';
import { ProfileFriendsBox } from './ProfileFriendsBox';
import { useLanguage } from '../../../context/LanguageContext';

interface ProfilePostsTabProps {
  isOwnProfile: boolean;
  profile: UserProfile | null;
  isEditingBio: boolean;
  setIsEditingBio: (val: boolean) => void;
  bioInput: string;
  setBioInput: (val: string) => void;
  handleSaveBio: () => void;
  selectedHobbies: string[];
  allPostPhotos: string[];
  friends: any[];
  posts: Post[];
  loading: boolean;
  setActiveTab: (tab: 'posts' | 'about' | 'friends' | 'photos') => void;
  onViewProfile?: (userId: string) => void;
  onShowEditModal: () => void;
  handlePostCreated: (post: Post) => void;
  handlePostDeleted: (postId: string) => void;
}

export const ProfilePostsTab: React.FC<ProfilePostsTabProps> = ({
  isOwnProfile,
  profile,
  isEditingBio,
  setIsEditingBio,
  bioInput,
  setBioInput,
  handleSaveBio,
  selectedHobbies,
  allPostPhotos,
  friends,
  posts,
  loading,
  setActiveTab,
  onViewProfile,
  onShowEditModal,
  handlePostCreated,
  handlePostDeleted,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  return (
    <div className="flex flex-col lg:flex-row gap-4 xl:gap-5 items-start">
      {/* Left Column: Intro Box, Photos Box, Friends Box (Fixed 360px-380px) */}
      <div className="w-full lg:w-[360px] xl:w-[380px] shrink-0 space-y-4">
        <ProfileIntroBox
          isOwnProfile={isOwnProfile}
          profile={profile}
          isEditingBio={isEditingBio}
          setIsEditingBio={setIsEditingBio}
          bioInput={bioInput}
          setBioInput={setBioInput}
          onSaveBio={handleSaveBio}
          selectedHobbies={selectedHobbies}
          onShowEditModal={onShowEditModal}
        />

        <ProfilePhotosBox
          photos={allPostPhotos}
          onSeeAllPhotos={() => setActiveTab('photos')}
        />

        <ProfileFriendsBox
          friends={friends}
          onSeeAllFriends={() => setActiveTab('friends')}
          onViewProfile={onViewProfile}
        />
      </div>

      {/* Right Column: Create Post Box + User Posts (Wide Feed ~740px-780px) */}
      <div className="flex-1 min-w-0 w-full space-y-4">
        {isOwnProfile && (
          <CreatePostBox onPostCreated={handlePostCreated} />
        )}

        <div className="bg-white dark:bg-[#242526] rounded-2xl p-3 px-4 shadow-xs border border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">
            {isEn ? `Posts (${posts.length})` : `Bài viết (${posts.length})`}
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400 dark:text-[#8a8d91] animate-pulse">
            {isEn ? 'Loading posts...' : 'Đang tải bài viết...'}
          </div>
        ) : posts.length > 0 ? (
          posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              onDeletePost={handlePostDeleted}
            />
          ))
        ) : (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 text-center shadow-xs border border-gray-200 dark:border-[#393a3b]">
            <p className="font-bold text-base text-gray-800 dark:text-[#e4e6eb]">
              {isEn ? 'No posts yet' : 'Chưa có bài viết nào'}
            </p>
            <p className="text-xs text-gray-400 dark:text-[#8a8d91] mt-1">
              {isOwnProfile
                ? (isEn ? 'Share your first moment on your profile!' : 'Hãy chia sẻ khoảnh khắc đầu tiên của bạn lên trang cá nhân!')
                : (isEn ? 'This user hasn’t posted anything yet.' : 'Người dùng này chưa đăng bài viết nào.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
