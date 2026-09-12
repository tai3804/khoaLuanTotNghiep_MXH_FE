import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { userService } from '../../../services/api';
import { mediaService } from '../../../services/mediaService';
import { UserProfile } from '../../../types';

interface UseEditProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const useEditProfileForm = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}: UseEditProfileFormProps) => {
  const { user: currentUser, refreshUserProfile, updateUser } = useAuth();
  const toast = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverError, setCoverError] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);

  const [showUrlInputs, setShowUrlInputs] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const names = (profile?.fullName || currentUser?.fullName || '').split(' ');
      setFirstName(profile?.firstName || names.slice(1).join(' ') || '');
      setLastName(profile?.lastName || names[0] || '');
      setMiddleName(profile?.middleName || '');
      setBio(profile?.bio || currentUser?.bio || '');
      setAvatarUrl(profile?.avatarUrl || currentUser?.avatar || '');
      setCoverUrl(profile?.coverUrl || '');
      setCoverError(false);
      setGender(profile?.gender || 'MALE');
      setLocation(profile?.location || '');
      setWebsite(profile?.website || '');

      if (profile?.dateOfBirth) {
        const dobStr = typeof profile.dateOfBirth === 'string' ? profile.dateOfBirth.split('T')[0] : '';
        setDateOfBirth(dobStr);
      } else {
        setDateOfBirth('');
      }

      // Load saved hobbies
      try {
        const uId = currentUser?.id || 'default';
        const saved = localStorage.getItem(`user_hobbies_${uId}`);
        if (saved) {
          setSelectedHobbies(JSON.parse(saved));
        } else {
          setSelectedHobbies(['🎧 Nghe nhạc', '✈️ Du lịch', '💻 Lập trình']);
        }
      } catch {
        setSelectedHobbies(['🎧 Nghe nhạc', '✈️ Du lịch', '💻 Lập trình']);
      }
    }
  }, [isOpen, profile, currentUser]);

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    toast.showInfo('Đang tải ảnh đại diện lên...');
    try {
      const media = await mediaService.uploadMedia(file, 'avatars');
      if (media && media.fileUrl) {
        setAvatarUrl(media.fileUrl);
        toast.showSuccess('Đã tải ảnh đại diện lên thành công!');
      }
    } catch (err: any) {
      toast.showError('Tải ảnh đại diện thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    toast.showInfo('Đang tải ảnh bìa lên...');
    try {
      const media = await mediaService.uploadMedia(file, 'covers');
      if (media && media.fileUrl) {
        setCoverUrl(media.fileUrl);
        setCoverError(false);
        toast.showSuccess('Đã tải ảnh bìa lên thành công!');
      }
    } catch (err: any) {
      toast.showError('Tải ảnh bìa thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateOfBirth) {
      const age = calculateAge(dateOfBirth);
      if (age < 13) {
        toast.showError('Bạn phải từ 13 tuổi trở lên để sử dụng dịch vụ.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const updated = await userService.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
        gender,
        dateOfBirth: dateOfBirth || undefined,
      });

      // Save hobbies to localStorage
      try {
        const uId = currentUser?.id || 'default';
        localStorage.setItem(`user_hobbies_${uId}`, JSON.stringify(selectedHobbies));
      } catch {}

      const fullNewName = `${lastName} ${middleName ? middleName + ' ' : ''}${firstName}`.trim();
      updateUser?.({
        fullName: fullNewName,
        avatar: avatarUrl.trim() || currentUser?.avatar || '',
        bio: bio.trim(),
      });
      refreshUserProfile?.();

      if (onProfileUpdated && updated) {
        onProfileUpdated(updated);
      }

      toast.showSuccess('Cập nhật hồ sơ cá nhân thành công!');
      onClose();
    } catch (err: any) {
      toast.showError('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    currentUser,
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
    selectedHobbies,
    showUrlInputs,
    setShowUrlInputs,
    uploadingAvatar,
    uploadingCover,
    isSaving,
    handleAvatarUpload,
    handleCoverUpload,
    toggleHobby,
    handleSave,
  };
};
