import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Logo } from './Logo';
import { X, Lock, Mail, User, ArrowRight, KeyRound, Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/api';

export const LoginModal: React.FC = () => {
  const { loginModalOpen, closeLoginModal, login, register } = useAuth();
  const { t } = useLanguage();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Multi-step Register states
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [registerOtp, setRegisterOtp] = useState('');
  const [registerSessionToken, setRegisterSessionToken] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!loginModalOpen) return null;

  const handleSendRegisterOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ Email.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await authService.sendRegisterOtp(email.trim());
      setSuccessMsg('Mã OTP xác thực đã được gửi tới email của bạn!');
      setRegisterStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể gửi mã OTP. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerOtp.trim() || registerOtp.trim().length < 6) {
      setError('Vui lòng nhập đầy đủ mã OTP 6 chữ số.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await authService.verifyRegisterOtp(email.trim(), registerOtp.trim());
      const token = res?.registerSessionToken || res;
      setRegisterSessionToken(token);
      setSuccessMsg('Xác thực Email thành công! Hãy nhập thông tin cá nhân và mật khẩu.');
      setRegisterStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!password.trim() || !confirmPassword.trim() || !lastName.trim() || !firstName.trim() || !dateOfBirth) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Check age >= 13
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 13) {
      setError('Bạn phải từ đủ 13 tuổi trở lên mới được tạo tài khoản!');
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
        setSuccessMsg('Tạo tài khoản thành công! Vui lòng đăng nhập.');
        setIsRegisterMode(false);
        setRegisterStep(1);
      } else {
        setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(email.trim(), password.trim());
      if (!res.success) setError('Đăng nhập thất bại. Email hoặc mật khẩu chưa đúng!');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={closeLoginModal} className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 animate-fade-in cursor-pointer">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-[#393a3b] p-4 sm:p-6 relative transition-all cursor-default max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-700 dark:text-[#b0b3b8] dark:hover:text-[#e4e6eb] p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-4 sm:mb-5 flex flex-col items-center">
          <Logo size="md" />
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-[#e4e6eb] mt-2.5 sm:mt-3">
            {isRegisterMode ? (t('register') || 'Đăng Ký Tài Khoản') : (t('login') || 'Đăng Nhập')}
          </h2>
        </div>

        {/* Stepper Header for Register */}
        {isRegisterMode && (
          <div className="flex items-center justify-between mb-4 px-1 sm:px-4">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                registerStep >= 1 ? 'bg-[#1877f2] text-white' : 'bg-gray-200 text-gray-500'
              }`}>1</div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 font-semibold text-gray-500">Email</span>
            </div>
            <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 ${registerStep >= 2 ? 'bg-[#1877f2]' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                registerStep >= 2 ? 'bg-[#1877f2] text-white' : 'bg-gray-200 text-gray-500'
              }`}>2</div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 font-semibold text-gray-500">Mã OTP</span>
            </div>
            <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 ${registerStep >= 3 ? 'bg-[#1877f2]' : 'bg-gray-200'}`} />
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                registerStep >= 3 ? 'bg-[#1877f2] text-white' : 'bg-gray-200 text-gray-500'
              }`}>3</div>
              <span className="text-[9px] sm:text-[10px] mt-0.5 font-semibold text-gray-500">Thông Tin</span>
            </div>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs font-bold p-3 rounded-xl mb-4 text-center border border-red-200 dark:border-red-800/60">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 text-xs font-bold p-3 rounded-xl mb-4 text-center border border-emerald-200 dark:border-emerald-800/60">
            {successMsg}
          </div>
        )}

        {!isRegisterMode ? (
          /* LOGIN FORM */
          <form onSubmit={handleSubmitLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
                Email đăng nhập <span className="text-red-500">*</span>
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

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8]"
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
              className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs py-3 rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : registerStep === 1 ? (
          /* STEP 1: EMAIL */
          <form onSubmit={handleSendRegisterOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
                Nhập Email để bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs py-3 rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Tiếp Theo (Gửi Mã OTP)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : registerStep === 2 ? (
          /* STEP 2: OTP VERIFICATION */
          <form onSubmit={handleVerifyRegisterOtp} className="space-y-3.5">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
                Mã OTP 6 số đã được gửi tới email:
              </p>
              <p className="text-xs font-extrabold text-blue-900 dark:text-blue-100">{email}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
                Nhập mã OTP 6 chữ số <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={registerOtp}
                  onChange={(e) => setRegisterOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || registerOtp.length < 6}
              className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs py-3 rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                className="text-[#1877f2] dark:text-[#4599ff] hover:underline font-semibold cursor-pointer"
              >
                Gửi lại mã OTP
              </button>
              <button
                type="button"
                onClick={() => setRegisterStep(1)}
                className="text-gray-500 hover:underline cursor-pointer"
              >
                Đổi Email
              </button>
            </div>
          </form>
        ) : (
          /* STEP 3: PASSWORDS & PROFILE INFO WITH TAB ORDER OPTIMIZATION */
          <form onSubmit={handleCompleteRegistration} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  tabIndex={1}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8]"
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
              <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  tabIndex={2}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-[#393a3b] space-y-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#1877f2] dark:text-[#4599ff]">
                Thông Tin Cá Nhân
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1">
                    Họ & Tên đệm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    tabIndex={3}
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Nguyễn Văn"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1">
                    Tên chính <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    tabIndex={4}
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="An"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    tabIndex={5}
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1">
                    Giới tính
                  </label>
                  <select
                    tabIndex={6}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-lg border border-gray-300 dark:border-[#4e4f50] text-xs"
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
              className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs py-3 rounded-lg shadow-sm disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Hoàn Tất Đăng Ký</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-5 border-t border-gray-200 dark:border-[#393a3b] pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
              setSuccessMsg('');
              setRegisterStep(1);
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
