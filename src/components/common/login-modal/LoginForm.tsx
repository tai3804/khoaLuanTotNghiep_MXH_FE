import React, { useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Crown, User as UserIcon } from 'lucide-react';

// Tài khoản demo để đăng nhập nhanh theo từng vai trò khi phát triển / demo
const demoAccounts = [
  {
    role: 'Kiểm duyệt viên',
    roleBadge: 'MODERATOR',
    email: 'moderator@kltn.local',
    pass: 'mod123',
    icon: <ShieldCheck className="w-4 h-4 text-purple-500" />,
    style: 'border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/20 hover:border-purple-500',
  },
  {
    role: 'Quản trị viên',
    roleBadge: 'ADMIN',
    email: 'admin',
    pass: 'admin123',
    icon: <Crown className="w-4 h-4 text-amber-500" />,
    style: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 hover:border-amber-500',
  },
  {
    role: 'Người dùng',
    roleBadge: 'USER',
    email: 'testuser_kltn_01@gmail.com',
    pass: 'Password123@',
    icon: <UserIcon className="w-4 h-4 text-blue-500" />,
    style: 'border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/20 hover:border-blue-500',
  },
];

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
  onQuickLogin,
  onForgotPassword,
}) => {
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Sync browser autofill values into React state
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
    // Modern browsers (Chrome, Edge, Safari, password managers) often autofill after a slight delay
    const timers = [50, 150, 300, 600, 1200].map((t) => setTimeout(syncAutofill, t));
    return () => timers.forEach(clearTimeout);
  }, [syncAutofill]);

  const handleFormSubmit = (e: React.FormEvent) => {
    syncAutofill();
    onSubmit(e);
  };

  const handleSelectAccount = (acc: (typeof demoAccounts)[number]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    onQuickLogin?.(acc.email, acc.pass);
  };

  return (
    <div className="space-y-4">
    {/* Quick Role Login */}
    {onQuickLogin && (
      <div className="rounded-2xl border border-gray-200/80 bg-gray-50/60 p-3 dark:border-[#383a3d] dark:bg-[#1e1f20]/50">
        <p className="mb-2 text-xs font-bold text-gray-500 dark:text-gray-400">
          Đăng nhập nhanh theo vai trò:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {demoAccounts.map((acc) => (
            <button
              key={acc.role}
              type="button"
              disabled={loading}
              onClick={() => handleSelectAccount(acc)}
              className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition-all cursor-pointer hover:shadow-md active:scale-95 disabled:opacity-50 ${acc.style}`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-[#252628]">
                {acc.icon}
              </div>
              <span className="text-xs font-bold text-gray-800 dark:text-white leading-tight">
                {acc.role}
              </span>
              <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {acc.roleBadge}
              </span>
            </button>
          ))}
        </div>
      </div>
    )}

    <form
      onSubmit={handleFormSubmit}
      onMouseEnter={syncAutofill}
      onTouchStart={syncAutofill}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
          Email hoặc Tên đăng nhập <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
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
            placeholder="example@gmail.com"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8] transition"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[11px] font-semibold text-[#1877f2] hover:underline cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
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
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8] transition"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464d2] text-white font-bold text-xs py-3 rounded-xl shadow-sm disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
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
    </div>
  );
};
