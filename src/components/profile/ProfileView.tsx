import React from 'react';
import { EditProfileModal } from './EditProfileModal';
import { ArchiveModal } from './archive';
import { useNavigate } from 'react-router-dom';
import { ChatUser } from '../chat/chat-box';

import {
  useProfileViewData,
  ProfileHeaderBanner,
  ProfilePostsTab,
  ProfileAboutTab,
  ProfileFriendsTab,
  ProfilePhotosTab,
} from './view';
import { ProfessionalModeModal, ProfessionalDashboardModal } from './professional';
import { ImageCropperModal } from '../common/image-cropper';
import { userService } from '../../services/userService';

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
  const navigate = useNavigate();
  const [showArchiveModal, setShowArchiveModal] = React.useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = React.useState(false);
  const [showProfessionalDashboard, setShowProfessionalDashboard] = React.useState(false);
  const [archivedPostIds, setArchivedPostIds] = React.useState<string[]>([]);
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
    selectedCropFile,
    cropMode,
    handleCropComplete,
    handleCropClose,
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

  React.useEffect(() => {
    try { setArchivedPostIds(JSON.parse(localStorage.getItem(`profile_management_archived_posts_${targetUserId || currentUser?.id || 'me'}`) || '[]')); } catch { setArchivedPostIds([]); }
  }, [targetUserId, currentUser?.id]);

  // Record profile view when someone views another user's profile
  React.useEffect(() => {
    if (!isOwnProfile && targetUserId) {
      const storageKey = `profile_viewed_${targetUserId}`;
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, '1');
        userService.recordProfileView(targetUserId).catch(() => {});
      }
    }
  }, [isOwnProfile, targetUserId]);

  const publishedPosts = posts.filter((post) => !archivedPostIds.includes(post.id));

  return (
    <div className="w-full space-y-4 pb-8">
      {/* Profile Banner, Header Info, Stats, Actions & Tab Navigation */}
      <ProfileHeaderBanner
        isOwnProfile={isOwnProfile}
        coverUrl={coverUrl}
        avatarUrl={avatarUrl}
        fullName={fullName}
        friendCount={friends.length}
        postCount={publishedPosts.length}
        isProfessionalMode={Boolean(profile?.isProfessionalMode)}
        creatorCategory={profile?.creatorCategory}
        profileViewCount={profile?.profileViewCount}
        followerCount={profile?.followerCount}
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
        onShowArchive={() => setShowArchiveModal(true)}
        onOpenProfessionalDashboard={() => setShowProfessionalDashboard(true)}
        onOpenProfessionalModeModal={() => setShowProfessionalModal(true)}
        onAddFriend={handleAddFriendProfile}
        onCancelRequest={handleCancelSentRequest}
        onAcceptRequest={handleAcceptFriendRequest}
        onRejectRequest={handleRejectFriendRequest}
        onUnfriend={handleUnfriendProfile}
        onSelectChatUser={onSelectChatUser}
        targetUserId={targetUserId}
      />

      {/* Main Content Body */}
      <div className="w-full">
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
            posts={publishedPosts}
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
      {/* Archive Modal (Kho lưu trữ bài viết & Dung lượng phương tiện) */}
      {isOwnProfile && (
        <ArchiveModal
          isOpen={showArchiveModal}
          onClose={() => setShowArchiveModal(false)}
          userId={targetUserId || currentUser?.id || 'me'}
          onPostRestored={(restoredPost) => {
            if (restoredPost) {
              setArchivedPostIds((prev) => prev.filter((id) => id !== restoredPost.id));
              if (profileData.posts) {
                // If not already in posts list, add it
                if (!profileData.posts.some((p) => p.id === restoredPost.id)) {
                  profileData.handlePostCreated(restoredPost);
                }
              }
            }
          }}
        />
      )}

      {/* Professional Mode Modal (Bật / Tắt / Chọn Category) */}
      {isOwnProfile && (
        <ProfessionalModeModal
          isOpen={showProfessionalModal}
          onClose={() => setShowProfessionalModal(false)}
          isCurrentlyEnabled={Boolean(profile?.isProfessionalMode)}
          currentCategory={profile?.creatorCategory}
          fullName={fullName}
          avatarUrl={avatarUrl}
          followerCount={profile?.followerCount}
          onSuccess={(updated) => {
            if (setProfile && updated) {
              setProfile((prev: any) => ({
                ...prev,
                ...updated,
                isProfessionalMode: updated.isProfessionalMode,
                creatorCategory: updated.creatorCategory,
              }));
            }
          }}
        />
      )}

      {/* Professional Dashboard Modal (Bảng điều khiển & Phân tích lượt xem) */}
      {isOwnProfile && (
        <ProfessionalDashboardModal
          isOpen={showProfessionalDashboard}
          onClose={() => setShowProfessionalDashboard(false)}
          fullName={fullName}
          avatarUrl={avatarUrl}
          creatorCategory={profile?.creatorCategory}
          profileViewCount={profile?.profileViewCount}
          followerCount={profile?.followerCount}
        />
      )}

      {/* Image Cropper Modal (Facebook / TikTok Style) */}
      <ImageCropperModal
        isOpen={Boolean(selectedCropFile && cropMode)}
        imageFile={selectedCropFile}
        mode={cropMode || 'avatar'}
        onCropComplete={handleCropComplete}
        onClose={handleCropClose}
      />
    </div>
  );
};
