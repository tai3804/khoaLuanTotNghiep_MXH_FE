import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from './Logo';
import { X, Lock, Mail, User, ArrowRight } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, closeLoginModal, login, register } = useAuth();
  const { t } = useLanguage();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!loginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegisterMode) {
        const ok = await register(username, email, password, fullName);
        if (!ok) setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!');
      } else {
        const ok = await login(username, password);
        if (!ok) setError('Đăng nhập thất bại. Tên đăng nhập hoặc mật khẩu chưa đúng!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={closeLoginModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in cursor-pointer">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#242526] w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-[#393a3b] p-6 relative transition-all cursor-default">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-[#b0b3b8] dark:hover:text-[#e4e6eb] p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <Logo size="md" />
          <h2 className="text-xl font-black text-gray-900 dark:text-[#e4e6eb] mt-4">
            {isRegisterMode ? (t('register') || 'Đăng Ký Tài Khoản') : (t('login') || 'Đăng Nhập')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
            {isRegisterMode
              ? 'Vui lòng điền thông tin để tạo tài khoản mới'
              : 'Vui lòng đăng nhập để tiếp tục trải nghiệm'}
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs font-bold p-3 rounded-xl mb-4 text-center border border-red-200 dark:border-red-800/60">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
                  {t('fullName') || 'Họ và Tên'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
                  {t('email') || 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
              {t('usernameOrEmail') || 'Tên đăng nhập hoặc Email'}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên đăng nhập"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
              {t('password') || 'Mật khẩu'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464d2] text-white font-bold text-xs py-3 rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegisterMode ? (t('register') || 'Đăng Ký') : (t('login') || 'Đăng Nhập')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-gray-200 dark:border-[#393a3b] pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
            className="text-xs text-[#1877f2] dark:text-[#4599ff] font-bold hover:underline cursor-pointer"
          >
            {isRegisterMode
              ? (t('alreadyHaveAccount') || 'Đã có tài khoản? Đăng nhập ngay')
              : (t('dontHaveAccount') || 'Chưa có tài khoản? Đăng ký ngay')}
          </button>
        </div>
      </div>
    </div>
  );
};
