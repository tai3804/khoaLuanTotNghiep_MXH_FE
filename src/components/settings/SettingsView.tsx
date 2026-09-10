import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../common/UserAvatar';
import { userService, authService } from '../../services/api';
import {
  User,
  Lock,
  Shield,
  Sun,
  Moon,
  Globe,
  Save,
  CheckCircle,
  Smartphone,
  Trash2,
  QrCode,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Volume2,
  Heart,
  MessageCircle,
  Share2,
  UserPlus,
  Phone,
  Mail,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const SettingsView: React.FC = () => {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const toast = useToast();
  const { settings, updateSettings, playNotificationSound } = useNotification();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'privacy' | 'appearance' | 'notifications'>('profile');

  // Profile Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [gender, setGender] = useState('MALE');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security & Devices States
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // MFA 2FA States
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaStatusMsg, setMfaStatusMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

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
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch Devices when Security tab is active
  const fetchDevices = async () => {
    setLoadingDevices(true);
    try {
      const devList = await authService.getDevices();
      setDevices(devList);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'security') {
      fetchDevices();
    }
  }, [activeSubTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const updated = await userService.updateMyProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        gender,
        location: location.trim() || undefined,
        website: website.trim() || undefined,
      });

      // Update local storage user info
      const savedUserStr = localStorage.getItem('user');
      if (savedUserStr) {
        try {
          const u = JSON.parse(savedUserStr);
          u.fullName = `${lastName} ${firstName}`.trim();
          u.avatar = avatarUrl.trim() || u.avatar;
          localStorage.setItem('user', JSON.stringify(u));
        } catch {
          // ignore
        }
      }

      setProfileSuccess('Đã cập nhật thông tin hồ sơ cá nhân thành công!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất thiết bị này không?')) return;
    setRevokingId(deviceId);
    try {
      await authService.revokeDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      toast.showSuccess('Đã đăng xuất thiết bị thành công.');
    } catch (err: any) {
      toast.showError('Không thể thu hồi thiết bị: ' + (err.response?.data?.message || err.message));
    } finally {
      setRevokingId(null);
    }
  };

  const handleSetupMfa = async () => {
    setMfaLoading(true);
    setMfaStatusMsg(null);
    try {
      const data = await authService.setupMfa();
      setMfaQrCode(data.qrCodeUrl || data.qrCode || null);
      setMfaSecret(data.secretKey || null);
    } catch (err: any) {
      setMfaStatusMsg({
        type: 'error',
        msg: err.response?.data?.message || 'Không thể thiết lập 2FA lúc này.',
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setMfaLoading(true);
    setMfaStatusMsg(null);
    try {
      await authService.enableMfa(otpCode.trim());
      setMfaStatusMsg({
        type: 'success',
        msg: 'Chúc mừng! Xác thực 2 bước (2FA TOTP) đã được kích hoạt bảo vệ tài khoản của bạn.',
      });
      setMfaQrCode(null);
      setMfaSecret(null);
      setOtpCode('');
    } catch (err: any) {
      setMfaStatusMsg({
        type: 'error',
        msg: err.response?.data?.message || 'Mã OTP không chính xác. Vui lòng thử lại.',
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    const code = window.prompt('Nhập mã OTP 6 chữ số từ ứng dụng Authenticator để xác nhận tắt 2FA:');
    if (!code) return;
    setMfaLoading(true);
    setMfaStatusMsg(null);
    try {
      await authService.disableMfa(code.trim());
      setMfaStatusMsg({
        type: 'success',
        msg: 'Đã tắt xác thực 2 bước (2FA) thành công.',
      });
    } catch (err: any) {
      setMfaStatusMsg({
        type: 'error',
        msg: err.response?.data?.message || 'Không thể tắt 2FA. Mã OTP không hợp lệ.',
      });
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Settings Header */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-[#393a3b] mb-5 flex items-center justify-between transition-colors">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center space-x-2">
            <span>⚙️</span>
            <span>Cài Đặt Hệ Thống & Tài Khoản</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
            Quản lý thông tin cá nhân, quyền riêng tư, thiết bị đăng nhập và bảo mật tài khoản.
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-[#1877f2]/20 text-[#1877f2] dark:text-[#4599ff] font-bold text-xs">
          Phiên bản KLTN 2026
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Settings Navigation Menu */}
        <div className="md:col-span-1 bg-white dark:bg-[#242526] rounded-2xl p-2 border border-gray-200 dark:border-[#393a3b] shadow-sm h-fit space-y-1 transition-colors">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'profile'
                ? 'bg-[#1877f2] text-white shadow-sm'
                : 'text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ cá nhân</span>
          </button>

          <button
            onClick={() => setActiveSubTab('security')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'security'
                ? 'bg-[#1877f2] text-white shadow-sm'
                : 'text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Thiết bị & Bảo mật (2FA)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'privacy'
                ? 'bg-[#1877f2] text-white shadow-sm'
                : 'text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Quyền riêng tư</span>
          </button>

          <button
            onClick={() => setActiveSubTab('appearance')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'appearance'
                ? 'bg-[#1877f2] text-white shadow-sm'
                : 'text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Giao diện & Ngôn ngữ</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notifications')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeSubTab === 'notifications'
                ? 'bg-[#1877f2] text-white shadow-sm'
                : 'text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Cài đặt thông báo</span>
          </button>
        </div>

        {/* Content Details */}
        <div className="md:col-span-3 bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-200 dark:border-[#393a3b] shadow-sm transition-colors">
          {/* TAB 1: PROFILE MANAGEMENT */}
          {activeSubTab === 'profile' && (
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] border-b border-gray-100 dark:border-[#393a3b] pb-3 mb-4">
                Hồ Sơ Cá Nhân (user-service API)
              </h3>

              {profileSuccess && (
                <div className="mb-4 p-3.5 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-xl flex items-center space-x-2 text-green-700 dark:text-green-300 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center space-x-2 text-red-700 dark:text-red-300 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {loadingProfile ? (
                <div className="py-12 text-center text-xs text-gray-400 dark:text-[#8a8d91] space-y-2">
                  <div className="w-6 h-6 border-2 border-[#1877f2] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Đang tải hồ sơ từ user-service...</p>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Avatar & Cover Preview */}
                  <div className="flex items-center space-x-4 p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl border border-gray-200/60 dark:border-[#393a3b]">
                    <UserAvatar src={avatarUrl || user?.avatar} alt={firstName || 'User'} size="xl" />
                    <div className="flex-1 space-y-1">
                      <label className="block text-xs font-bold text-gray-700 dark:text-[#e4e6eb]">
                        Đường dẫn Ảnh đại diện (Avatar URL)
                      </label>
                      <input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                      />
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">
                        Họ và Tên đệm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Nguyễn Văn"
                        className="w-full bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-4 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
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
                        className="w-full bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-4 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                      />
                    </div>
                  </div>

                  {/* Bio Field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">Tiểu sử (Bio)</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Giới thiệu đôi nét về bạn..."
                      className="w-full bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-4 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2] resize-none leading-relaxed"
                    />
                  </div>

                  {/* Gender & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">Giới tính</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-4 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                      >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8] mb-1">Địa điểm / Thành phố</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="TP. Hồ Chí Minh"
                        className="w-full bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-4 py-2 rounded-xl border border-gray-200 dark:border-[#393a3b] text-xs focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Lưu hồ sơ cá nhân</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: SECURITY, ACTIVE DEVICES & 2FA */}
          {activeSubTab === 'security' && (
            <div className="space-y-6">
              {/* Active Devices Section */}
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#393a3b] pb-3 mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-[#1877f2]" />
                      <span>Quản Lý Thiết Bị Đăng Nhập (auth-service)</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-[#8a8d91] mt-0.5">
                      Danh sách các phiên làm việc và thiết bị đang đăng nhập tài khoản của bạn.
                    </p>
                  </div>
                  <button
                    onClick={fetchDevices}
                    className="p-1.5 text-gray-400 hover:text-[#1877f2] dark:hover:text-[#e4e6eb] transition"
                    title="Làm mới thiết bị"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingDevices ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {loadingDevices ? (
                  <div className="py-6 text-center text-xs text-gray-400 dark:text-[#8a8d91]">Đang tải danh sách thiết bị...</div>
                ) : devices.length === 0 ? (
                  <div className="p-4 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl text-center text-xs text-gray-400 dark:text-[#8a8d91]">
                    Chưa có danh sách thiết bị nào được lưu trữ.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {devices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl border border-gray-200/60 dark:border-[#393a3b]"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-[#1877f2]/20 flex items-center justify-center text-[#1877f2] dark:text-[#4599ff]">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h5 className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb]">
                                {device.deviceName || 'Trình duyệt Web'}
                              </h5>
                              <span className="bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                {device.status || 'ACTIVE'}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-[#8a8d91] mt-0.5">
                              IP: {device.ipAddress || '127.0.0.1'} • Vị trí: {device.location || 'Việt Nam'} • HĐ: {device.lastActiveAt ? new Date(device.lastActiveAt).toLocaleString('vi-VN') : 'Vừa xong'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRevokeDevice(device.id)}
                          disabled={revokingId === device.id}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{revokingId === device.id ? 'Đang hủy...' : 'Đăng xuất'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MFA / 2FA Section */}
              <div className="border-t border-gray-100 dark:border-[#393a3b] pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Xác Thực 2 Bước (MFA / 2FA TOTP)</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-[#8a8d91] mt-0.5">
                      Bảo vệ tài khoản bằng mã bảo mật 6 số từ Google Authenticator hoặc Authy.
                    </p>
                  </div>
                </div>

                {mfaStatusMsg && (
                  <div
                    className={`mb-4 p-3.5 rounded-xl flex items-center space-x-2 text-xs font-bold ${
                      mfaStatusMsg.type === 'success'
                        ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                        : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    }`}
                  >
                    {mfaStatusMsg.type === 'success' ? (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{mfaStatusMsg.msg}</span>
                  </div>
                )}

                {!mfaQrCode ? (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSetupMfa}
                      disabled={mfaLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Thiết lập 2FA (Google Authenticator)</span>
                    </button>

                    <button
                      onClick={handleDisableMfa}
                      disabled={mfaLoading}
                      className="px-4 py-2 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Tắt 2FA</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                      <QrCode className="w-4 h-4" />
                      <span>Quét mã QR dưới đây bằng Google Authenticator</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-white dark:bg-[#242526] p-4 rounded-xl">
                      {mfaQrCode ? (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mfaQrCode)}`}
                          alt="MFA QR Code"
                          className="w-36 h-36 rounded-xl border border-gray-200 dark:border-[#393a3b]"
                        />
                      ) : null}
                      <div className="space-y-1.5">
                        <p className="text-xs text-gray-600 dark:text-[#b0b3b8] font-semibold">
                          Hoặc nhập khóa bảo mật thủ công:
                        </p>
                        <code className="block bg-gray-100 dark:bg-[#3a3b3c] p-2 rounded-xl text-xs font-mono text-emerald-600 dark:text-emerald-400 select-all">
                          {mfaSecret}
                        </code>
                        <p className="text-[10px] text-gray-400 dark:text-[#8a8d91]">
                          Mỗi mã OTP có hiệu lực trong vòng 30 giây.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleEnableMfa} className="flex items-center space-x-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Nhập 6 số OTP..."
                        className="bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b] text-gray-900 dark:text-[#e4e6eb] text-sm font-mono tracking-widest px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
                      />
                      <button
                        type="submit"
                        disabled={mfaLoading || otpCode.length < 6}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
                      >
                        {mfaLoading ? 'Đang kích hoạt...' : 'Kích hoạt 2FA'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setMfaQrCode(null)}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-[#e4e6eb] text-xs font-semibold"
                      >
                        Hủy
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PRIVACY */}
          {activeSubTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] border-b border-gray-100 dark:border-[#393a3b] pb-3">
                Cài Đặt Quyền Riêng Tư
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Ai có thể xem bài viết của bạn?</h4>
                    <p className="text-[10px] text-gray-400 dark:text-[#8a8d91]">Mặc định đối tượng hiển thị bài viết</p>
                  </div>
                  <select className="bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b] text-xs font-bold rounded-xl px-3 py-1.5 text-gray-800 dark:text-[#e4e6eb] focus:outline-none">
                    <option>Công khai (Public)</option>
                    <option>Bạn bè (Friends)</option>
                    <option>Chỉ mình tôi (Private)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE & LANGUAGE */}
          {activeSubTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] border-b border-gray-100 dark:border-[#393a3b] pb-3">
                Tùy Chỉnh Giao Diện & Ngôn Ngữ
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Giao diện Sáng / Tối</h4>
                      <p className="text-[10px] text-gray-400 dark:text-[#8a8d91]">Hiện tại: {theme === 'dark' ? 'Chế độ Tối (Dark)' : 'Chế độ Sáng (Light)'}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    Chuyển đổi
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Ngôn ngữ hiển thị</h4>
                      <p className="text-[10px] text-gray-400 dark:text-[#8a8d91]">Đang chọn: {language === 'vi' ? 'Tiếng Việt' : 'English'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                    className="px-4 py-1.5 bg-gray-200 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] rounded-xl text-xs font-bold hover:bg-gray-300 dark:hover:bg-[#4e4f50] transition cursor-pointer"
                  >
                    Đổi sang {language === 'vi' ? 'English' : 'Tiếng Việt'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATION SETTINGS (UC-NO05) */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 dark:border-[#393a3b] pb-3">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span>Cấu hình thông báo (UC-NO05)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
                  Chọn loại thông báo bạn muốn nhận và bật âm thanh khi có tương tác mới.
                </p>
              </div>

              {/* Category 1: Social Interactions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
                  Tương tác & Bài viết
                </h4>

                <div className="space-y-2">
                  {/* Like Post */}
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-500">
                        <Heart className="w-4 h-4 fill-rose-500" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Cảm xúc & Lượt thích</h5>
                        <p className="text-[11px] text-gray-400">Khi ai đó thích hoặc bày tỏ cảm xúc về bài viết của bạn</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.likePost ?? true}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          await updateSettings({ likePost: val });
                          toast.showSuccess(val ? 'Đã bật thông báo lượt thích' : 'Đã tắt thông báo lượt thích');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Comment Post */}
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-500">
                        <MessageCircle className="w-4 h-4 fill-blue-500" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Bình luận & Phản hồi</h5>
                        <p className="text-[11px] text-gray-400">Khi ai đó bình luận bài viết hoặc trả lời bình luận của bạn</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.commentPost ?? true}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          await updateSettings({ commentPost: val });
                          toast.showSuccess(val ? 'Đã bật thông báo bình luận' : 'Đã tắt thông báo bình luận');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Share Post */}
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Chia sẻ bài viết</h5>
                        <p className="text-[11px] text-gray-400">Khi người khác chia sẻ bài viết của bạn lên trang cá nhân</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.sharePost ?? true}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          await updateSettings({ sharePost: val });
                          toast.showSuccess(val ? 'Đã bật thông báo chia sẻ' : 'Đã tắt thông báo chia sẻ');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Category 2: Connections & Friends */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
                  Bạn bè & Mối quan hệ
                </h4>

                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Lời mời & Chấp nhận kết bạn</h5>
                      <p className="text-[11px] text-gray-400">Khi nhận lời mời kết bạn mới hoặc ai đó chấp nhận lời mời</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings?.friendRequest ?? true}
                      onChange={async (e) => {
                        const val = e.target.checked;
                        await updateSettings({ friendRequest: val });
                        toast.showSuccess(val ? 'Đã bật thông báo kết bạn' : 'Đã tắt thông báo kết bạn');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Category 3: Messages & Calls */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
                  Tin nhắn & Cuộc gọi
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/50 flex items-center justify-center text-sky-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Tin nhắn trực tiếp</h5>
                        <p className="text-[11px] text-gray-400">Nhận thông báo khi có tin nhắn mới gửi đến bạn</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.message ?? true}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          await updateSettings({ message: val });
                          toast.showSuccess(val ? 'Đã bật thông báo tin nhắn' : 'Đã tắt thông báo tin nhắn');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center text-teal-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Cuộc gọi đến & Cuộc gọi nhỡ</h5>
                        <p className="text-[11px] text-gray-400">Thông báo khi có người gọi hoặc khi bạn bị nhỡ cuộc gọi</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.call ?? true}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          await updateSettings({ call: val });
                          toast.showSuccess(val ? 'Đã bật thông báo cuộc gọi' : 'Đã tắt thông báo cuộc gọi');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Category 4: Sound & System */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
                  Âm thanh & Hệ thống
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-500">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Âm thanh thông báo realtime</h5>
                        <p className="text-[11px] text-gray-400">Phát âm thanh nhẹ (chime) khi có thông báo mới gửi tới</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => playNotificationSound()}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer"
                      >
                        Thử âm thanh
                      </button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings?.sound ?? true}
                          onChange={async (e) => {
                            const val = e.target.checked;
                            await updateSettings({ sound: val });
                            if (val) playNotificationSound();
                            toast.showSuccess(val ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-500">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">Thông báo hệ thống & Cảnh báo</h5>
                        <p className="text-[11px] text-gray-400">Các thông báo cập nhật, bảo trì và cảnh báo tài khoản</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings?.system ?? true}
                        onChange={async (e) => {
                          const val = e.target.checked;
                          await updateSettings({ system: val });
                          toast.showSuccess(val ? 'Đã bật thông báo hệ thống' : 'Đã tắt thông báo hệ thống');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
