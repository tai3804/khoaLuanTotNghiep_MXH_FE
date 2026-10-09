import React from 'react';
import { MediaGalleryModal } from './MediaGalleryModal';
import { EditProfileModal } from './EditProfileModal';
import { ProfileManagementModal } from './ProfileManagementModal';
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
  const [showManagementModal, setShowManagementModal] = React.useState(false);
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
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] pb-12">
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
        onShowManagement={() => setShowManagementModal(true)}
        onShowMediaGallery={() => setShowMediaGalleryModal(true)}
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
      {isOwnProfile && <ProfileManagementModal
        isOpen={showManagementModal}
        onClose={() => setShowManagementModal(false)}
        posts={posts}
        userId={targetUserId || currentUser?.id || 'me'}
        onEditProfile={() => setShowEditModal(true)}
        onOpenMedia={() => setShowMediaGalleryModal(true)}
        onOpenPrivacy={() => navigate('/settings/privacy')}
        onArchiveChange={setArchivedPostIds}
      />}

      {/* Professional Mode Modal (Bật / Tắt / Chọn Category) */}
      {isOwnProfile && (
        <ProfessionalModeModal
          isOpen={showProfessionalModal}
          onClose={() => setShowProfessionalModal(false)}
          isCurrentlyEnabled={Boolean(profile?.isProfessionalMode)}
          currentCategory={profile?.creatorCategory}
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
    </div>
  );
};
