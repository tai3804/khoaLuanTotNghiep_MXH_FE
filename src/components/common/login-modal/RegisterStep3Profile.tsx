import React from 'react';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface RegisterStep3ProfileProps {
  password: string;
  setPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  lastName: string;
  setLastName: (name: string) => void;
  firstName: string;
  setFirstName: (name: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (dob: string) => void;
  gender: string;
  setGender: (g: string) => void;
  loading: boolean;
  onComplete: (e: React.FormEvent) => void;
}

export const RegisterStep3Profile: React.FC<RegisterStep3ProfileProps> = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  lastName,
  setLastName,
  firstName,
  setFirstName,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  loading,
  onComplete,
}) => {
  return (
    <form onSubmit={onComplete} className="space-y-3.5">
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
            onClick={() => setShowPassword((prev) => !prev)}
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
  );
};
