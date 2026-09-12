import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import {
  useProfileSettingsForm,
  ProfileSettingsHeader,
  ProfileMediaBannerSection,
  PersonalDetailsSection,
  BioContactSection,
} from './profile-tab';

export const ProfileSettingsTab: React.FC = () => {
  const {
    user,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    middleName,
    setMiddleName,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    coverUrl,
    setCoverUrl,
    coverError,
    setCoverError,
    dateOfBirth,
    setDateOfBirth,
    gender,
    setGender,
    location,
    setLocation,
    website,
    setWebsite,
    loadingProfile,
    savingProfile,
    uploadingAvatar,
    uploadingCover,
    showUrlInputs,
    setShowUrlInputs,
    profileSuccess,
    profileError,
    avatarInputRef,
    coverInputRef,
    handleAvatarUpload,
    handleCoverUpload,
    handleSaveProfile,
  } = useProfileSettingsForm();

  return (
    <div className="space-y-6">
      <ProfileSettingsHeader
        profileSuccess={profileSuccess}
        profileError={profileError}
      />

      {loadingProfile ? (
        <div className="py-16 text-center text-xs text-gray-400 dark:text-[#8a8d91] space-y-3">
          <Loader2 className="w-8 h-8 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin mx-auto text-[#1877f2]" />
          <p className="font-semibold text-gray-600 dark:text-[#b0b3b8]">Đang tải dữ liệu hồ sơ cá nhân...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section 1: Visual Live Profile Banner & Media Inputs */}
          <ProfileMediaBannerSection
            user={user}
            coverUrl={coverUrl}
            setCoverUrl={setCoverUrl}
            coverError={coverError}
            setCoverError={setCoverError}
            uploadingCover={uploadingCover}
            coverInputRef={coverInputRef}
            handleCoverUpload={handleCoverUpload}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            uploadingAvatar={uploadingAvatar}
            avatarInputRef={avatarInputRef}
            handleAvatarUpload={handleAvatarUpload}
            firstName={firstName}
            lastName={lastName}
            middleName={middleName}
            bio={bio}
            showUrlInputs={showUrlInputs}
            setShowUrlInputs={setShowUrlInputs}
          />

          {/* Section 2: Personal Details Form */}
          <PersonalDetailsSection
            lastName={lastName}
            setLastName={setLastName}
            middleName={middleName}
            setMiddleName={setMiddleName}
            firstName={firstName}
            setFirstName={setFirstName}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            gender={gender}
            setGender={setGender}
          />

          {/* Section 3: Bio & Contact Info */}
          <BioContactSection
            bio={bio}
            setBio={setBio}
            location={location}
            setLocation={setLocation}
            website={website}
            setWebsite={setWebsite}
          />

          {/* Action Save Button Bar */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="submit"
              disabled={savingProfile || uploadingAvatar || uploadingCover}
              className="px-6 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {savingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{savingProfile ? 'Đang lưu hồ sơ...' : 'Lưu Thay Đổi Hồ Sơ'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
