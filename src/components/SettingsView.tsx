import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { UserAvatar } from './UserAvatar';
import {
  User,
  Lock,
  Shield,
  Sun,
  Moon,
  Globe,
  Save,
  CheckCircle,
  Key,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'privacy' | 'appearance'>('profile');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Settings Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-slate-700 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-slate-100 flex items-center space-x-2">
            <span>⚙️</span>
            <span>Cài Đặt Hệ Thống & Tài Khoản</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Quản lý thông tin cá nhân, quyền riêng tư, bảo mật và tùy chỉnh giao diện ứng dụng.
          </p>
        </div>
        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs">
          Phiên bản FE 1.0.0
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation Menu */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800 rounded-3xl p-3 border border-gray-200 dark:border-slate-700 shadow-sm h-fit space-y-1">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
              activeSubTab === 'profile'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ cá nhân</span>
          </button>

          <button
            onClick={() => setActiveSubTab('security')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
              activeSubTab === 'security'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Mật khẩu & Bảo mật</span>
          </button>

          <button
            onClick={() => setActiveSubTab('privacy')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
              activeSubTab === 'privacy'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Quyền riêng tư</span>
          </button>

          <button
            onClick={() => setActiveSubTab('appearance')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-bold transition ${
              activeSubTab === 'appearance'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Giao diện & Ngôn ngữ</span>
          </button>
        </div>

        {/* Content Details */}
        <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
          {savedSuccess && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl flex items-center space-x-2 text-green-700 dark:text-green-300 text-xs font-bold">
              <CheckCircle className="w-4 h-4" />
              <span>Đã lưu thành công các cài đặt của bạn!</span>
            </div>
          )}

          {activeSubTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-700 pb-3">
                Cấu Hình Hồ Sơ Cá Nhân
              </h3>

              <div className="flex items-center space-x-4">
                <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="xl" />
                <div>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-100 transition"
                  >
                    Thay đổi ảnh đại diện
                  </button>
                  <p className="text-[10px] text-gray-400 mt-1">Hỗ trợ JPG, PNG, WebP (Tối đa 5MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Địa chỉ Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email..."
                  className="w-full bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-600 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          )}

          {activeSubTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-700 pb-3">
                Bảo Mật & Mật Khẩu
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-600 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    className="w-full bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-slate-100 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-slate-600 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
                  >
                    <Key className="w-4 h-4" />
                    <span>Cập nhật mật khẩu</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'privacy' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-700 pb-3">
                Cài Đặt Quyền Riêng Tư
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">Ai có thể xem bài viết của bạn?</h4>
                    <p className="text-[10px] text-gray-400">Mặc định đối tượng hiển thị bài viết</p>
                  </div>
                  <select className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-xs font-bold rounded-xl px-3 py-1.5 text-gray-800 dark:text-slate-200 focus:outline-none">
                    <option>Công khai (Public)</option>
                    <option>Bạn bè (Friends)</option>
                    <option>Chỉ mình tôi (Private)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-slate-100 border-b border-gray-100 dark:border-slate-700 pb-3">
                Tùy Chỉnh Giao Diện & Ngôn Ngữ
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">Giao diện Sáng / Tối</h4>
                      <p className="text-[10px] text-gray-400">Hiện tại: {theme === 'dark' ? 'Chế độ Tối (Dark)' : 'Chế độ Sáng (Light)'}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    Chuyển đổi
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">Ngôn ngữ hiển thị</h4>
                      <p className="text-[10px] text-gray-400">Đang chọn: {language === 'vi' ? 'Tiếng Việt' : 'English'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                    className="px-4 py-1.5 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-100 rounded-xl text-xs font-bold hover:bg-gray-300 transition"
                  >
                    Đổi sang {language === 'vi' ? 'English' : 'Tiếng Việt'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
