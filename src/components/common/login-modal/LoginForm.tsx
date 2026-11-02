import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Mail, LogIn } from 'lucide-react';
import { AuthInput, AuthPasswordInput, AuthSubmitButton } from './ui';

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
        {/* Email or Username - Tab index 1 */}
        <AuthInput
          inputRef={emailInputRef}
          label="Email hoặc Tên đăng nhập"
          required
          icon={Mail}
          type="text"
          name="username"
          autoComplete="username"
          tabIndex={1}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onInput={syncAutofill}
          onFocus={syncAutofill}
          onBlur={syncAutofill}
          onAnimationStart={syncAutofill}
          placeholder="Nhập email hoặc tên tài khoản"
        />

        {/* Password - Tab index 2 */}
        <AuthPasswordInput
          inputRef={passwordInputRef}
          label="Mật khẩu"
          required
          name="password"
          autoComplete="current-password"
          tabIndex={2}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onInput={syncAutofill}
          onFocus={syncAutofill}
          onBlur={syncAutofill}
          onAnimationStart={syncAutofill}
          placeholder="Nhập mật khẩu của bạn"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              tabIndex={4}
              className="w-4 h-4 rounded text-[#1877f2] focus:ring-[#1877f2] dark:border-gray-600 dark:bg-[#18191a] cursor-pointer"
            />
            <span className="text-xs text-gray-600 dark:text-[#b0b3b8]">Ghi nhớ đăng nhập</span>
          </label>

          {onForgotPassword && (
            <button
              type="button"
              tabIndex={5}
              onClick={onForgotPassword}
              className="text-xs font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline transition-colors cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          )}
        </div>

        {/* Log In Button - Tab index 3 ensures Email (1) -> Password (2) -> Submit (3) */}
        <AuthSubmitButton
          type="submit"
          tabIndex={3}
          disabled={loading}
          loading={loading}
          icon={LogIn}
          iconPosition="left"
          label="Đăng Nhập"
          className="mt-2"
        />
      </form>

      {/* Switch to Register link */}
      {onCreateAccount && (
        <div className="pt-2 text-center text-xs text-gray-500 dark:text-[#b0b3b8]">
          <span>Chưa có tài khoản? </span>
          <button
            type="button"
            tabIndex={6}
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
