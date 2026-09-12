import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../common/UserAvatar';
import { userService } from '../../services/api';
import { mediaService } from '../../services/mediaService';
import { UserProfile } from '../../types';
import {
  X,
  Camera,
  Loader2,
  Image as ImageIcon,
  User,
  MapPin,
  Globe,
  Calendar,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

const AVAILABLE_HOBBIES = [
  '🎧 Nghe nhạc',
  '⚽ Đá bóng',
  '✈️ Du lịch',
  '🎮 Chơi game',
  '📚 Đọc sách',
  '💻 Lập trình',
  '🍳 Nấu ăn',
  '📷 Chụp ảnh',
  '🎬 Xem phim',
  '☕ Cà phê',
  '🏃 Chạy bộ',
  '🎨 Vẽ tranh',
  '🎸 Chơi đàn',
  '🛍️ Mua sắm',
  '🧘 Thể hình & Gym',
  '🐾 Thú cưng',
];

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
  const { user: currentUser, refreshUserProfile, updateUser } = useAuth();
  const toast = useToast();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

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
  const [education, setEducation] = useState('');
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
      setEducation((profile as any)?.education || '');
      
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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#242526] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between relative bg-white dark:bg-[#242526] shrink-0">
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb] text-center w-full">
            Chỉnh sửa trang cá nhân
          </h3>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-[#b0b3b8] dark:hover:text-[#e4e6eb] bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scrollable */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-gray-900 dark:text-[#e4e6eb]">
          {/* Section 1: Avatar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                Ảnh đại diện
              </h4>
              <label
                htmlFor="edit-modal-avatar-file-input"
                className="text-xs font-bold text-[#1877f2] hover:underline cursor-pointer flex items-center space-x-1"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Chỉnh sửa</span>
                )}
              </label>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-gray-100 dark:border-[#3a3b3c] shadow-md overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center">
                  <UserAvatar
                    src={avatarUrl || currentUser?.avatar}
                    alt={firstName || 'User'}
                    size="xl"
                    className="w-full h-full object-cover"
                  />
                </div>
                <input
                  id="edit-modal-avatar-file-input"
                  type="file"
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="edit-modal-avatar-file-input"
                  className="absolute bottom-1 right-1 p-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full shadow-md transition cursor-pointer border-2 border-white dark:border-[#242526]"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Cover Photo */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#393a3b]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                Ảnh bìa
              </h4>
              <label
                htmlFor="edit-modal-cover-file-input"
                className="text-xs font-bold text-[#1877f2] hover:underline cursor-pointer flex items-center space-x-1"
              >
                {uploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Chỉnh sửa</span>
                )}
              </label>
            </div>

            {/* Interactive Cover Container (Blank when no cover photo exists or error) */}
            <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] group shadow-inner">
              {coverUrl && !coverError ? (
                <img
                  src={coverUrl}
                  alt=""
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  onError={() => setCoverError(true)}
                />
              ) : null}

              <input
                id="edit-modal-cover-file-input"
                type="file"
                onChange={handleCoverUpload}
                accept="image/*"
                className="hidden"
              />

              <label
                htmlFor="edit-modal-cover-file-input"
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
              >
                {uploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <span>{uploadingCover ? 'Đang tải...' : 'Tải ảnh bìa lên'}</span>
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowUrlInputs(!showUrlInputs)}
                className="text-[11px] font-bold text-gray-500 dark:text-[#b0b3b8] hover:text-[#1877f2] flex items-center space-x-1 cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{showUrlInputs ? 'Ẩn ô nhập URL' : 'Hoặc dán link URL ảnh'}</span>
              </button>
            </div>

            {showUrlInputs && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
                    Link URL ảnh đại diện
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
                    Link URL ảnh bìa
                  </label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => {
                      setCoverUrl(e.target.value);
                      setCoverError(false);
                    }}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Bio */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#393a3b]">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                Tiểu sử
              </h4>
            </div>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Mô tả bản thân của bạn..."
              maxLength={101}
              rows={3}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
            />
            <p className="text-[11px] text-right text-gray-400 dark:text-[#8a8d91]">
              Còn {101 - bio.length} ký tự
            </p>
          </div>

          {/* Section 4: Personal Details Form */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#393a3b]">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
              Thông tin cá nhân
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">Họ (*)</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Nguyễn"
                  className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">Tên đệm</label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Văn"
                  className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">Tên (*)</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="An"
                  className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
                  Giới tính
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác / Ẩn</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
                  Nơi ở hiện tại
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="TP. Hồ Chí Minh, Việt Nam"
                  className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-[#b0b3b8] mb-1">
                  Website cá nhân
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-gray-50 dark:bg-[#3a3b3c] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Hobbies */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-[#393a3b]">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb]">
              Sở thích
            </h4>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_HOBBIES.map((hobby) => {
                const isSelected = selectedHobbies.includes(hobby);
                return (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => toggleHobby(hobby)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1877f2] text-white border-[#1877f2] shadow-sm'
                        : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] border-gray-200 dark:border-[#4e4f50] hover:bg-gray-200 dark:hover:bg-[#4e4f50]'
                    }`}
                  >
                    {hobby}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              Tất cả thông tin chỉnh sửa sẽ được lưu vào hồ sơ cá nhân của bạn.
            </p>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gray-200 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-300 dark:hover:bg-[#4e4f50] transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#1877f2] text-white hover:bg-[#166fe5] shadow-md transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu thay đổi</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
