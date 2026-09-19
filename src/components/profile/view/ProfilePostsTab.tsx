import React from 'react';
import { Post, UserProfile } from '../../../types';
import { CreatePostBox } from '../../post/CreatePostBox';
import { PostCard } from '../../post/PostCard';
import { ProfileIntroBox } from './ProfileIntroBox';
import { ProfilePhotosBox } from './ProfilePhotosBox';
import { ProfileFriendsBox } from './ProfileFriendsBox';

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left Column: Intro Box, Photos Box, Friends Box */}
      <div className="lg:col-span-5 space-y-4">
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

      {/* Right Column: Create Post Box + User Posts */}
      <div className="lg:col-span-7 space-y-4">
        {isOwnProfile && (
          <CreatePostBox onPostCreated={handlePostCreated} />
        )}

        <div className="bg-white dark:bg-[#242526] rounded-2xl p-3 px-4 shadow-sm border border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-[#e4e6eb]">
            Bài viết ({posts.length})
          </h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm text-gray-400 dark:text-[#8a8d91] animate-pulse">
            Đang tải bài viết...
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
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 text-center shadow-sm border border-gray-200 dark:border-[#393a3b]">
            <p className="font-bold text-base text-gray-800 dark:text-[#e4e6eb]">
              Chưa có bài viết nào
            </p>
            <p className="text-xs text-gray-400 dark:text-[#8a8d91] mt-1">
              {isOwnProfile
                ? 'Hãy chia sẻ khoảnh khắc đầu tiên của bạn lên trang cá nhân!'
                : 'Người dùng này chưa đăng bài viết nào.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
