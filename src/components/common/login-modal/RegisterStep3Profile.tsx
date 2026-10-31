import React, { useMemo } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, User, Calendar, Check, Shield } from 'lucide-react';

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
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, text: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, text: 'Yếu', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, text: 'Trung bình', color: 'bg-amber-500' };
    return { score: 3, text: 'Mạnh', color: 'bg-emerald-500' };
  }, [password]);

  return (
    <form onSubmit={onComplete} className="space-y-3.5">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
            Họ & Tên đệm <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
              <User className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Nguyễn Văn"
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-xs sm:text-sm shadow-2xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
            Tên chính <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="An"
            className="w-full px-3 py-2.5 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-xs sm:text-sm shadow-2xs"
          />
        </div>
      </div>

      {/* Birthday & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
            Ngày sinh <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-xs sm:text-sm shadow-2xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
            Giới tính <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'MALE', label: 'Nam' },
              { id: 'FEMALE', label: 'Nữ' },
              { id: 'OTHER', label: 'Khác' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGender(item.id)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  gender === item.id
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-[#1877f2] text-[#1877f2] dark:text-[#4599ff] shadow-xs'
                    : 'bg-white dark:bg-[#18191a] border-gray-300 dark:border-[#3e4042] text-gray-600 dark:text-[#b0b3b8] hover:border-gray-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Password fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
            Mật khẩu đăng nhập <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-xs sm:text-sm shadow-2xs"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
            Xác nhận lại mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu"
              className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-xs sm:text-sm shadow-2xs"
            />
            {confirmPassword && password && confirmPassword === password && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-500">
                <Check className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password strength & hints */}
      {password && (
        <div className="space-y-1">
          <div className="flex h-1.5 w-full bg-gray-200 dark:bg-[#383a3d] rounded-full overflow-hidden gap-1">
            <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-transparent'}`} />
            <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-transparent'}`} />
            <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-transparent'}`} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Độ mạnh: <strong className={passwordStrength.score === 3 ? 'text-emerald-500' : passwordStrength.score === 2 ? 'text-amber-500' : 'text-red-500'}>{passwordStrength.text}</strong></span>
            <span>Nên có chữ hoa, số & ký tự đặc biệt</span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-white bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.99] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Shield className="w-4 h-4" />
            <span>Hoàn Tất Đăng Ký Tài Khoản</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
