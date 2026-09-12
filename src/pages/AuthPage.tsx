import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/api';
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
  ShieldCheck,
  KeyRound,
} from 'lucide-react';

interface AuthPageProps {
  onGoHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onGoHome }) => {
  const { login, verifyMfaLogin, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register specific states
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Multi-step Registration States (1: Email, 2: OTP, 3: Profile & Password)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [registerOtp, setRegisterOtp] = useState('');
  const [registerSessionToken, setRegisterSessionToken] = useState('');

  // 2FA Login States
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSendRegisterOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ Email.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await authService.sendRegisterOtp(email.trim());
      setSuccessMessage('Mã OTP xác thực 6 số đã được gửi tới email ' + email.trim() + '. Vui lòng kiểm tra hộp thư!');
      setRegisterStep(2);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể gửi mã OTP. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerOtp.trim() || registerOtp.trim().length < 6) {
      setErrorMessage('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await authService.verifyRegisterOtp(email.trim(), registerOtp.trim());
      const token = res?.registerSessionToken || res;
      setRegisterSessionToken(token);
      setSuccessMessage('Xác thực Email thành công! Hãy nhập thông tin cá nhân và mật khẩu để hoàn tất.');
      setRegisterStep(3);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!password.trim() || !confirmPassword.trim() || !lastName.trim() || !firstName.trim() || !dateOfBirth) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t('passwordsDoNotMatch') || 'Mật khẩu xác nhận không khớp!');
      return;
    }

    // Check age >= 13 years old
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 13) {
      setErrorMessage('Bạn phải từ đủ 13 tuổi trở lên mới được tạo tài khoản!');
      return;
    }

    setLoading(true);
    try {
      const ok = await register({
        registerSessionToken,
        email: email.trim(),
        password: password.trim(),
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        dateOfBirth,
        gender,
      });
      if (ok) {
        setSuccessMessage(t('registerSuccess') || 'Tạo tài khoản thành công! Vui lòng đăng nhập.');
        setIsLoginMode(true);
        setRegisterStep(1);
        setRegisterOtp('');
        setRegisterSessionToken('');
      } else {
        setErrorMessage('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await login(email.trim(), password.trim());
      if (res.success) {
        if (res.mfaRequired && res.mfaToken) {
          setMfaRequired(true);
          setMfaToken(res.mfaToken);
        } else if (onGoHome) {
          onGoHome();
        }
      } else {
        setErrorMessage('Đăng nhập thất bại. Email hoặc mật khẩu không chính xác!');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfaOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      const ok = await verifyMfaLogin(mfaToken, otpCode.trim());
      if (ok) {
        if (onGoHome) onGoHome();
      } else {
        setErrorMessage('Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại Google Authenticator!');
      }
    } catch (err: any) {
      setErrorMessage('Xác thực 2FA thất bại: ' + (err.message || 'Mã OTP không đúng'));
    } finally {
      setLoading(false);
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
        <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-white/15 backdrop-blur-md bg-slate-900/40">
          {/* Click Logo or Text to go Home */}
          <Logo onClick={onGoHome} variant="light" />

          <div className="flex items-center space-x-2 sm:space-x-3">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] sm:text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                Vào Trang Chủ
              </button>
            )}

            <button
              onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
              className="w-12 sm:w-14 h-8 sm:h-9 flex items-center justify-center space-x-1 rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/80 text-white text-[11px] sm:text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
              <span className="uppercase">{language}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/80 text-white shadow-sm transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-300" />}
            </button>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 flex items-center justify-center px-3 sm:px-6 py-6 sm:py-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Hero Branding Section - High Contrast White Text */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-blue-900/70 border border-blue-400/40 text-blue-200 text-[11px] sm:text-xs font-bold shadow-lg backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse" />
              <span>Mạng Xã Hội Khóa Luận Tốt Nghiệp 2026</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {t('authTitle') || 'Kết Nối Với Bạn Bè Và Thế Giới Xung Quanh'}
            </h1>

            <p className="text-xs sm:text-base text-slate-200 max-w-lg leading-relaxed drop-shadow mx-auto lg:mx-0">
              {t('authSubTitle') || 'Nền tảng chia sẻ trạng thái, nhắn tin thời gian thực và tương tác với hiệu năng cao.'}
            </p>
          </div>

          {/* Right Form Card */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 w-full max-w-md transition-all">
              {mfaRequired ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center space-y-2 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                      Xác Thực 2 Bước (2FA TOTP)
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-300">
                      Tài khoản của bạn đã được bật bảo vệ 2FA. Vui lòng mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Authy</strong> và nhập mã OTP 6 chữ số.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold rounded-2xl text-center">
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleVerifyMfaOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                        Mã OTP (6 chữ số)
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 dark:text-slate-400" />
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="123456"
                          className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-3 rounded-2xl border border-gray-300 dark:border-slate-700 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpCode.trim().length < 6}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-emerald-500/25 disabled:opacity-40 transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Xác Nhận Đăng Nhập 2FA</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMfaRequired(false);
                        setMfaToken('');
                        setOtpCode('');
                        setErrorMessage(null);
                      }}
                      className="w-full text-xs text-gray-500 dark:text-slate-400 hover:underline text-center pt-2 cursor-pointer font-semibold"
                    >
                      Quay lại màn hình đăng nhập
                    </button>
                  </form>
                </div>
              ) : (
                <>
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

                  {/* Multi-step Registration Progress Stepper */}
                  {!isLoginMode && (
                    <div className="flex items-center justify-between mb-5 px-2">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          registerStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          1
                        </div>
                        <span className="text-[10px] font-bold mt-1 text-gray-600 dark:text-slate-300">Email</span>
                      </div>
                      <div className={`flex-1 h-0.5 mx-2 ${registerStep >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`} />
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          registerStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          2
                        </div>
                        <span className="text-[10px] font-bold mt-1 text-gray-600 dark:text-slate-300">Mã OTP</span>
                      </div>
                      <div className={`flex-1 h-0.5 mx-2 ${registerStep >= 3 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`} />
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          registerStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          3
                        </div>
                        <span className="text-[10px] font-bold mt-1 text-gray-600 dark:text-slate-300">Thông Tin</span>
                      </div>
                    </div>
                  )}

                  {/* Auth Forms */}
                  {isLoginMode ? (
                    /* LOGIN FORM */
                    <form onSubmit={handleSubmitLogin} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                          Email đăng nhập <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-slate-400"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                          Mật khẩu <span className="text-red-500">*</span>
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
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/25 disabled:opacity-40 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Đăng Nhập</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : registerStep === 1 ? (
                    /* REGISTER STEP 1: EMAIL INPUT */
                    <form onSubmit={handleSendRegisterOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                          Nhập Email để bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <input
                            type="email"
                            required
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-slate-400"
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">
                          Hệ thống sẽ kiểm tra xem email đã được đăng ký chưa và gửi mã OTP xác nhận.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !email.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/25 disabled:opacity-40 transition flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Tiếp Theo (Gửi Mã OTP)</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : registerStep === 2 ? (
                    /* REGISTER STEP 2: OTP VERIFICATION */
                    <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                          Mã OTP xác thực đã được gửi tới email:
                        </p>
                        <p className="text-sm font-extrabold text-blue-900 dark:text-blue-100">{email}</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                          Nhập mã OTP 6 chữ số <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <input
                            type="text"
                            maxLength={6}
                            required
                            autoFocus
                            value={registerOtp}
                            onChange={(e) => setRegisterOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-3 rounded-2xl border border-gray-300 dark:border-slate-700 text-base font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || registerOtp.length < 6}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/25 disabled:opacity-40 transition flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Xác Nhận Mã OTP</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <button
                          type="button"
                          onClick={() => handleSendRegisterOtp()}
                          disabled={loading}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                        >
                          Gửi lại mã OTP
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegisterStep(1)}
                          className="text-gray-500 dark:text-slate-400 hover:underline cursor-pointer"
                        >
                          Đổi Email khác
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* REGISTER STEP 3: PASSWORD & PERSONAL INFO */
                    <form onSubmit={handleCompleteRegistration} className="space-y-4">
                      {/* Password Section with Tab order optimization */}
                      <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                          Mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            tabIndex={1}
                            required
                            autoFocus
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-10 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-slate-400"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1.5">
                          Xác nhận mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            tabIndex={2}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white pl-10 pr-4 py-2.5 rounded-2xl border border-gray-300 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-slate-400"
                          />
                        </div>
                      </div>

                      {/* Personal Info Section */}
                      <div className="pt-2 border-t border-gray-200 dark:border-slate-700/80 space-y-3">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          Thông Tin Cá Nhân
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1">
                              Họ & Tên đệm <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              tabIndex={3}
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Nguyễn Văn"
                              className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1">
                              Tên chính <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              tabIndex={4}
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="An"
                              className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1">
                              Ngày sinh <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              tabIndex={5}
                              required
                              value={dateOfBirth}
                              onChange={(e) => setDateOfBirth(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-[10px] text-gray-400 dark:text-slate-400">Từ 13 tuổi trở lên</span>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-800 dark:text-slate-100 mb-1">
                              Giới tính
                            </label>
                            <select
                              tabIndex={6}
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="MALE">Nam</option>
                              <option value="FEMALE">Nữ</option>
                              <option value="OTHER">Khác</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        tabIndex={7}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-3 rounded-2xl shadow-lg shadow-blue-500/25 disabled:opacity-40 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Hoàn Tất Đăng Ký</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}
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
