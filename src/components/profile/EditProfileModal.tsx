import React from 'react';
import { UserProfile } from '../../types';
import {
  EditModalHeader,
  EditModalFooter,
  EditAvatarSection,
  EditCoverSection,
  EditBioSection,
  EditPersonalInfoSection,
  EditHobbiesSection,
  useEditProfileForm,
  AVAILABLE_HOBBIES,
} from './edit-modal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const form = useEditProfileForm({ isOpen, onClose, profile, onProfileUpdated });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#242526] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <EditModalHeader onClose={onClose} />

        {/* Modal Body Scrollable */}
        <form onSubmit={form.handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-gray-900 dark:text-[#e4e6eb]">
          {/* Section 1: Avatar */}
          <EditAvatarSection
            avatarUrl={form.avatarUrl}
            currentUserAvatar={form.currentUser?.avatar}
            firstName={form.firstName}
            uploadingAvatar={form.uploadingAvatar}
            onAvatarUpload={form.handleAvatarUpload}
          />

          {/* Section 2: Cover Photo */}
          <EditCoverSection
            coverUrl={form.coverUrl}
            coverError={form.coverError}
            setCoverError={form.setCoverError}
            uploadingCover={form.uploadingCover}
            onCoverUpload={form.handleCoverUpload}
            showUrlInputs={form.showUrlInputs}
            setShowUrlInputs={form.setShowUrlInputs}
            avatarUrl={form.avatarUrl}
            setAvatarUrl={form.setAvatarUrl}
            setCoverUrl={form.setCoverUrl}
          />

          {/* Section 3: Bio */}
          <EditBioSection bio={form.bio} setBio={form.setBio} />

          {/* Section 4: Personal Details */}
          <EditPersonalInfoSection
            lastName={form.lastName}
            setLastName={form.setLastName}
            middleName={form.middleName}
            setMiddleName={form.setMiddleName}
            firstName={form.firstName}
            setFirstName={setFirstName => form.setFirstName(setFirstName)}
            dateOfBirth={form.dateOfBirth}
            setDateOfBirth={form.setDateOfBirth}
            gender={form.gender}
            setGender={form.setGender}
            location={form.location}
            setLocation={form.setLocation}
            website={form.website}
            setWebsite={form.setWebsite}
          />

          {/* Section 5: Hobbies */}
          <EditHobbiesSection
            availableHobbies={AVAILABLE_HOBBIES}
            selectedHobbies={form.selectedHobbies}
            onToggleHobby={form.toggleHobby}
          />

          {/* Modal Footer Controls */}
          <EditModalFooter onClose={onClose} isSaving={form.isSaving} />
        </form>
      </div>
    </div>
  );
};
