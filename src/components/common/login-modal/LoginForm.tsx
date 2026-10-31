import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (pass: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onQuickLogin?: (email: string, pass: string) => void;
  onForgotPassword?: () => void;
  onCreateAccount?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  onSubmit,
  onForgotPassword,
  onCreateAccount,
}) => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Đồng bộ giá trị tự động điền của trình duyệt vào React state
  const syncAutofill = useCallback(() => {
    if (emailInputRef.current) {
      const val = emailInputRef.current.value;
      if (val && val !== email) {
        setEmail(val);
      }
    }
    if (passwordInputRef.current) {
      const val = passwordInputRef.current.value;
      if (val && val !== password) {
        setPassword(val);
      }
    }
  }, [email, password, setEmail, setPassword]);

  useEffect(() => {
    syncAutofill();
    const timers = [50, 150, 300, 600, 1200].map((t) => setTimeout(syncAutofill, t));
    return () => timers.forEach(clearTimeout);
  }, [syncAutofill]);

  const handleFormSubmit = (e: React.FormEvent) => {
    syncAutofill();
    onSubmit(e);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleFormSubmit}
        onMouseEnter={syncAutofill}
        onTouchStart={syncAutofill}
        className="space-y-4"
      >
        {/* Email or Username */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
            Email hoặc Tên đăng nhập <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              ref={emailInputRef}
              type="text"
              name="username"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onInput={syncAutofill}
              onFocus={syncAutofill}
              onBlur={syncAutofill}
              onAnimationStart={syncAutofill}
              placeholder="Nhập email hoặc tên tài khoản"
              className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-[#e4e6eb]">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs font-medium text-[#1877f2] dark:text-[#4599ff] hover:underline transition-colors cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            )}
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onInput={syncAutofill}
              onFocus={syncAutofill}
              onBlur={syncAutofill}
              onAnimationStart={syncAutofill}
              placeholder="Nhập mật khẩu của bạn"
              className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-2xs"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#1877f2] focus:ring-[#1877f2] dark:border-gray-600 dark:bg-[#18191a] cursor-pointer"
            />
            <span className="text-xs text-gray-600 dark:text-[#b0b3b8]">Ghi nhớ đăng nhập trên thiết bị này</span>
          </label>
        </div>

        {/* Log In Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-white bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.99] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Register link */}
      {onCreateAccount && (
        <div className="pt-2 text-center text-xs text-gray-500 dark:text-[#b0b3b8]">
          <span>Chưa có tài khoản? </span>
          <button
            type="button"
            disabled={loading}
            onClick={onCreateAccount}
            className="font-bold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer"
          >
            Đăng ký tài khoản mới
          </button>
        </div>
      )}
    </div>
  );
};
