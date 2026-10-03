import React from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (pass: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
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
  onForgotPassword,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
          Email hoặc Tên đăng nhập <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        disabled={loading || !email.trim() || !password.trim()}
        className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs py-3 rounded-xl shadow-sm disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
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
  );
};
