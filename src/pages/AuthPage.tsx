import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  Sparkles,
} from 'lucide-react';

interface AuthPageProps {
  onGoHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onGoHome }) => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isLoginMode) {
      if (!usernameOrEmail.trim() || !password.trim()) {
        setErrorMessage('Vui lòng nhập đầy đủ thông tin đăng nhập.');
        return;
      }
      setLoading(true);
      try {
        const ok = await login(usernameOrEmail.trim(), password.trim());
        if (ok) {
          if (onGoHome) onGoHome();
        } else {
          setErrorMessage('Đăng nhập thất bại. Email hoặc mật khẩu không chính xác!');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!');
      } finally {
        setLoading(false);
      }
    } else {
      if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('Vui lòng điền đầy đủ các trường thông tin.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(t('passwordsDoNotMatch') || 'Mật khẩu xác nhận không khớp!');
        return;
      }
      setLoading(true);
      try {
        const ok = await register(username.trim(), email.trim(), password.trim(), fullName.trim());
        if (ok) {
          setSuccessMessage(t('registerSuccess') || 'Đăng ký thành công! Hãy đăng nhập.');
          setIsLoginMode(true);
        } else {
          setErrorMessage('Đăng ký thất bại. Email có thể đã tồn tại hoặc mật khẩu chưa đủ 6 ký tự!');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Đăng ký thất bại. Vui lòng thử lại!');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex flex-col justify-between transition-colors duration-300"
      style={{ backgroundImage: "url('/login_bg.jpg')" }}
    >
      {/* Dark Gradient Overlay for optimal contrast & modern aesthetics */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/80 to-blue-950/85 backdrop-blur-[3px] pointer-events-none" />

      {/* Content wrapper with higher z-index */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between">
        {/* Top Header controls */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/15 backdrop-blur-md bg-slate-900/40">
          {/* Click Logo or Text to go Home */}
          <Logo onClick={onGoHome} variant="light" />

          <div className="flex items-center space-x-3">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                Vào Trang Chủ
              </button>
            )}

            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="w-14 h-9 flex items-center justify-center space-x-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/80 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="uppercase">{language}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/80 text-white shadow-sm transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-300" />}
            </button>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 flex items-center justify-center px-4 py-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Branding Section - High Contrast White Text */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-900/70 border border-blue-400/40 text-blue-200 text-xs font-bold shadow-lg backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Mạng Xã Hội Khóa Luận Tốt Nghiệp 2026</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {t('authTitle') || 'Kết Nối Với Bạn Bè Và Thế Giới Xung Quanh'}
            </h1>

            <p className="text-base text-slate-200 max-w-lg leading-relaxed drop-shadow">
              {t('authSubTitle') || 'Nền tảng chia sẻ trạng thái, nhắn tin thời gian thực và tương tác với hiệu năng cao.'}
            </p>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md transition-all">
              {/* Form Mode Switcher Tabs */}
              <div className="flex bg-gray-200/80 dark:bg-slate-800/80 p-1 rounded-2xl mb-6 border border-gray-300/50 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(true);
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    isLoginMode
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t('login') || 'Đăng Nhập'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginMode(false);
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    !isLoginMode
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t('register') || 'Tạo Tài Khoản'}
                </button>
              </div>

              {/* Error & Success Messages */}
              {errorMessage && (
                <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold rounded-2xl text-center">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs font-bold rounded-2xl text-center">
                  {successMessage}
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginMode && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                        {t('fullName') || 'Họ và Tên'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Nguyễn Văn A"
                          className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-slate-400"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                        {t('username') || 'Tên người dùng'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="nguyenvana"
                          className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-slate-400"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                    {isLoginMode ? (t('usernameOrEmail') || 'Tên đăng nhập hoặc Email') : (t('email') || 'Email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                    <input
                      type={isLoginMode ? 'text' : 'email'}
                      value={isLoginMode ? usernameOrEmail : email}
                      onChange={(e) => (isLoginMode ? setUsernameOrEmail(e.target.value) : setEmail(e.target.value))}
                      placeholder={isLoginMode ? 'user@example.com hoặc username' : 'user@example.com'}
                      className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-slate-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                    {t('password') || 'Mật khẩu'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-10 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-slate-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isLoginMode && (
                  <div>
                    <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                      {t('confirmPassword') || 'Xác nhận mật khẩu'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/25 disabled:opacity-40 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isLoginMode ? (t('login') || 'Đăng Nhập') : (t('register') || 'Đăng Ký')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-xs font-medium text-slate-300 dark:text-slate-300 drop-shadow">
          © 2026 Khóa Luận Tốt Nghiệp Mạng Xã Hội. All rights reserved.
        </footer>
      </div>
    </div>
  );
};
