import React from 'react';
import { MediaGalleryModal } from './MediaGalleryModal';
import { EditProfileModal } from './EditProfileModal';
import { ChatUser } from '../chat/ChatBox';

import {
  useProfileViewData,
  ProfileHeaderBanner,
  ProfilePostsTab,
  ProfileAboutTab,
  ProfileFriendsTab,
  ProfilePhotosTab,
} from './view';

interface ProfileViewProps {
  userId?: string | null;
  onSelectChatUser?: (user: ChatUser) => void;
  onViewProfile?: (userId: string) => void;
  onNavigateSettings?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userId,
  onSelectChatUser,
  onViewProfile,
}) => {
  const profileData = useProfileViewData({ userId });
  const {
    currentUser,
    profile,
    setProfile,
    posts,
    friends,
    loading,
    activeTab,
    setActiveTab,
    isEditingBio,
    setIsEditingBio,
    bioInput,
    setBioInput,
    coverError,
    setCoverError,
    showEditModal,
    setShowEditModal,
    showMediaGalleryModal,
    setShowMediaGalleryModal,
    selectedHobbies,
    isOwnProfile,
    targetUserId,
    isFriend,
    hasPendingSent,
    hasPendingReceived,
    fullName,
    avatarUrl,
    coverUrl,
    allPostPhotos,
    handleAvatarFileSelect,
    handleCoverFileSelect,
    handleSaveBio,
    handlePostCreated,
    handlePostDeleted,
    handleAddFriendProfile,
    handleCancelSentRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleUnfriendProfile,
  } = profileData;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] pb-12">
      {/* Profile Banner, Header Info, Stats, Actions & Tab Navigation */}
      <ProfileHeaderBanner
        isOwnProfile={isOwnProfile}
        coverUrl={coverUrl}
        avatarUrl={avatarUrl}
        fullName={fullName}
        friendCount={friends.length}
        postCount={posts.length}
        coverError={coverError}
        setCoverError={setCoverError}
        isFriend={isFriend}
        hasPendingSent={hasPendingSent}
        hasPendingReceived={hasPendingReceived}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAvatarFileSelect={handleAvatarFileSelect}
        onCoverFileSelect={handleCoverFileSelect}
        onShowEditModal={() => setShowEditModal(true)}
        onShowMediaGallery={() => setShowMediaGalleryModal(true)}
        onAddFriend={handleAddFriendProfile}
        onCancelRequest={handleCancelSentRequest}
        onAcceptRequest={handleAcceptFriendRequest}
        onRejectRequest={handleRejectFriendRequest}
        onUnfriend={handleUnfriendProfile}
        onSelectChatUser={onSelectChatUser}
        targetUserId={targetUserId}
      />

      {/* Main Content Body */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        {/* Tab: Posts */}
        {activeTab === 'posts' && (
          <ProfilePostsTab
            isOwnProfile={isOwnProfile}
            profile={profile}
            isEditingBio={isEditingBio}
            setIsEditingBio={setIsEditingBio}
            bioInput={bioInput}
            setBioInput={setBioInput}
            handleSaveBio={handleSaveBio}
            selectedHobbies={selectedHobbies}
            allPostPhotos={allPostPhotos}
            friends={friends}
            posts={posts}
            loading={loading}
            setActiveTab={setActiveTab}
            onViewProfile={onViewProfile}
            onShowEditModal={() => setShowEditModal(true)}
            handlePostCreated={handlePostCreated}
            handlePostDeleted={handlePostDeleted}
          />
        )}

        {/* Tab: About */}
        {activeTab === 'about' && (
          <ProfileAboutTab
            isOwnProfile={isOwnProfile}
            fullName={fullName}
            profile={profile}
            currentUserEmail={currentUser?.email}
            onShowEditModal={() => setShowEditModal(true)}
          />
        )}

        {/* Tab: Friends */}
        {activeTab === 'friends' && (
          <ProfileFriendsTab
            friends={friends}
            onViewProfile={onViewProfile}
            onSelectChatUser={onSelectChatUser}
          />
        )}

        {/* Tab: Photos */}
        {activeTab === 'photos' && (
          <ProfilePhotosTab
            allPostPhotos={allPostPhotos}
            fullName={fullName}
          />
        )}
      </div>

      {/* Media Gallery Modal */}
      <MediaGalleryModal
        userId={targetUserId || ''}
        isOpen={showMediaGalleryModal}
        onClose={() => setShowMediaGalleryModal(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onProfileUpdated={(updated) => {
          setProfile(updated);
          setCoverError(false);
        }}
      />
    </div>
  );
};
