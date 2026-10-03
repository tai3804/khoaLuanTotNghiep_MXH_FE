import React from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, ShieldCheck, Crown, User as UserIcon } from 'lucide-react';

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
}

interface DemoAccount {
  role: string;
  roleBadge: string;
  email: string;
  pass: string;
  icon: React.ReactNode;
  badgeBg: string;
  badgeText: string;
  borderHover: string;
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
}) => {
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

  const handleSelectAccount = (acc: typeof demoAccounts[0], autoSubmit: boolean = false) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    if (autoSubmit && onQuickLogin) {
      onQuickLogin(acc.email, acc.pass);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Role Login */}
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
              onClick={() => handleSelectAccount(acc, true)}
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

      {/* Manual Login Form */}
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
            Email đăng nhập <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com hoặc moderator@kltn.local"
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
    </div>
  );
};
