import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../common/UserAvatar';
import { userService } from '../../services/api';
import { mediaService } from '../../services/mediaService';
import {
  User,
  Globe,
  Save,
  Camera,
  Upload,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Info,
} from 'lucide-react';

export const ProfileSettingsTab: React.FC = () => {
  const { user, refreshUserProfile, updateUser } = useAuth();
  const toast = useToast();

  // Profile Form States
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

  // Load User Profile on Mount
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

  return (
    <div className="space-y-6">
      {/* Profile Header Title */}
      <div className="border-b border-gray-100 dark:border-[#393a3b] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center space-x-2">
            <User className="w-5 h-5 text-[#1877f2]" />
            <span>Chỉnh Sửa Hồ Sơ Cá Nhân</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            Tùy chỉnh thông tin hiển thị, ảnh đại diện và thông tin liên hệ của bạn trên mạng xã hội.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-[#1877f2]/10 text-[#1877f2] border border-blue-100 dark:border-[#1877f2]/30 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hồ sơ công khai</span>
          </span>
        </div>
      </div>

      {profileSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{profileSuccess}</span>
        </div>
      )}

      {profileError && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2 text-red-700 dark:text-red-300 text-xs font-bold shadow-sm">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <span>{profileError}</span>
        </div>
      )}

      {loadingProfile ? (
        <div className="py-16 text-center text-xs text-gray-400 dark:text-[#8a8d91] space-y-3">
          <Loader2 className="w-8 h-8 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin mx-auto text-[#1877f2]" />
          <p className="font-semibold text-gray-600 dark:text-[#b0b3b8]">Đang tải dữ liệu hồ sơ cá nhân...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Visual Live Profile Banner Card */}
          <div className="bg-gray-50 dark:bg-[#18191a] border border-gray-200 dark:border-[#393a3b] rounded-2xl p-4 shadow-sm overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-gray-700 dark:text-[#e4e6eb] uppercase tracking-wider flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-[#1877f2]" />
                <span>Ảnh Đại Diện & Ảnh Bìa</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowUrlInputs(!showUrlInputs)}
                className="text-[11px] font-bold text-[#1877f2] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{showUrlInputs ? 'Ẩn ô nhập URL' : 'Tùy chỉnh bằng URL trực tiếp'}</span>
              </button>
            </div>

            {/* Interactive Cover Photo Container */}
            <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] group">
              {coverUrl && !coverError ? (
                <img
                  src={coverUrl}
                  alt=""
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  onError={() => setCoverError(true)}
                />
              ) : null}

              {/* Cover photo upload trigger overlay */}
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white backdrop-blur-md rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md disabled:opacity-50"
              >
                {uploadingCover ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <span>{uploadingCover ? 'Đang tải lên...' : 'Đổi ảnh bìa'}</span>
              </button>
            </div>

            {/* Avatar and Info Header Overlap */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-12 px-3">
              <div className="flex items-end space-x-4">
                {/* Avatar circle container */}
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-[#242526] shadow-lg overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] flex items-center justify-center">
                    <UserAvatar
                      src={avatarUrl || user?.avatar}
                      alt={firstName || 'User'}
                      size="xl"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-1 right-1 p-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full shadow-md transition cursor-pointer border-2 border-white dark:border-[#242526] disabled:opacity-50"
                    title="Thay đổi ảnh đại diện"
                  >
                    {uploadingAvatar ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Name preview beside avatar */}
                <div className="pb-1">
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb] leading-snug">
                    {[lastName, middleName, firstName].filter(Boolean).join(' ') || 'Tên của bạn'}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                    {bio ? `"${bio.length > 50 ? bio.substring(0, 50) + '...' : bio}"` : 'Thành viên KLTN Social'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pb-1">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#1877f2]" />
                  <span>Tải ảnh đại diện</span>
                </button>
              </div>
            </div>

            {/* Optional Direct URL Inputs */}
            {showUrlInputs && (
              <div className="pt-3 border-t border-gray-200 dark:border-[#393a3b] space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
                    Đường dẫn Ảnh đại diện (Avatar URL)
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
                    Đường dẫn Ảnh bìa (Cover URL)
                  </label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://example.com/cover.jpg"
                    className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Personal Details Form */}
          <div className="bg-gray-50/50 dark:bg-[#252728] border border-gray-200/80 dark:border-[#393a3b] rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-extrabold text-gray-700 dark:text-[#e4e6eb] uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-4 h-4 text-[#1877f2]" />
              <span>Thông Tin Cá Nhân Cơ Bản</span>
            </h4>

            {/* Name Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
                  Họ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nguyễn"
                  className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
                  Tên đệm
                </label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Văn"
                  className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
                  Tên chính <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="An"
                  className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>
            </div>

            {/* Date of Birth & Gender Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1877f2]" />
                  <span>Ngày sinh</span>
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
                <p className="text-[10px] text-gray-400 dark:text-[#8a8d91] mt-1 flex items-center space-x-1">
                  <Info className="w-3 h-3 text-blue-500" />
                  <span>Yêu cầu từ 13 tuổi trở lên.</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
                  Giới tính
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Bio & Contact Info */}
          <div className="bg-gray-50/50 dark:bg-[#252728] border border-gray-200/80 dark:border-[#393a3b] rounded-2xl p-4 space-y-4">
            <h4 className="text-xs font-extrabold text-gray-700 dark:text-[#e4e6eb] uppercase tracking-wider flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-[#1877f2]" />
              <span>Giới Thiệu & Liên Hệ</span>
            </h4>

            {/* Bio Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
                  Tiểu sử (Bio)
                </label>
                <span className="text-[10px] text-gray-400">{bio.length}/500</span>
              </div>
              <textarea
                rows={3}
                maxLength={500}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Giới thiệu đôi nét về bản thân, công việc hoặc sở thích của bạn..."
                className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2] resize-none leading-relaxed"
              />
            </div>

            {/* Location & Website Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>Tỉnh / Thành phố</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ví dụ: TP. Hồ Chí Minh"
                  className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1 flex items-center space-x-1">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Website / Link cá nhân</span>
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                />
              </div>
            </div>
          </div>

          {/* Action Button Bar */}
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
