import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { userService } from '../../../services/api';
import { mediaService } from '../../../services/mediaService';

export const useProfileSettingsForm = () => {
  const { user, refreshUserProfile, updateUser } = useAuth();
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
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showUrlInputs, setShowUrlInputs] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const p = await userService.getMyProfile();
        if (p) {
          setFirstName(p.firstName || '');
          setLastName(p.lastName || '');
          setMiddleName(p.middleName || '');
          setBio(p.bio || '');
          setAvatarUrl(p.avatarUrl || '');
          setCoverUrl(p.coverUrl || '');
          setGender(p.gender || 'MALE');
          setLocation(p.location || '');
          setWebsite(p.website || '');
          if (p.dateOfBirth) {
            const dobStr = typeof p.dateOfBirth === 'string' ? p.dateOfBirth.split('T')[0] : '';
            setDateOfBirth(dobStr);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const media = await mediaService.uploadMedia(file, 'avatars');
      if (media && media.fileUrl) {
        setAvatarUrl(media.fileUrl);
        toast.showSuccess('Đã tải ảnh đại diện lên thành công!');
      }
    } catch (err: any) {
      toast.showError('Không thể tải ảnh đại diện lên: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const media = await mediaService.uploadMedia(file, 'covers');
      if (media && media.fileUrl) {
        setCoverUrl(media.fileUrl);
        setCoverError(false);
        toast.showSuccess('Đã tải ảnh bìa lên thành công!');
      }
    } catch (err: any) {
      toast.showError('Không thể tải ảnh bìa lên: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    if (dateOfBirth) {
      const age = calculateAge(dateOfBirth);
      if (age < 13) {
        setProfileError('Bạn phải từ 13 tuổi trở lên để sử dụng tài khoản.');
        setSavingProfile(false);
        return;
      }
    }

    try {
      await userService.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
      });

      const fullName = `${lastName} ${middleName ? middleName + ' ' : ''}${firstName}`.trim();
      updateUser?.({
        fullName,
        avatar: avatarUrl.trim() || user?.avatar || '',
      });
      refreshUserProfile?.();

      setProfileSuccess('Đã cập nhật thông tin hồ sơ cá nhân thành công!');
      toast.showSuccess('Cập nhật hồ sơ thành công!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể lưu hồ sơ. Vui lòng kiểm tra lại thông tin.';
      setProfileError(msg);
      toast.showError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  return {
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
  };
};
