import React from 'react';
import { Mail, ArrowRight, ShieldAlert } from 'lucide-react';
import { useSystemConfig } from '../../../context/SystemConfigContext';

interface RegisterStep1EmailProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  onSendOtp: (e?: React.FormEvent) => void;
}

export const RegisterStep1Email: React.FC<RegisterStep1EmailProps> = ({
  email,
  setEmail,
  loading,
  onSendOtp,
}) => {
  const { allowRegistration } = useSystemConfig();

  if (!allowRegistration) {
    return (
      <div className="p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-2">
        <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
        <h4 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          Tạm Đóng Đăng Ký
        </h4>
        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
          Tính năng đăng ký tài khoản mới hiện đang tạm đóng theo thiết lập của Quản trị viên. Vui lòng thử lại sau!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSendOtp} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
          Địa chỉ Email đăng ký <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-sm placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-2xs"
          />
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
          Hệ thống sẽ gửi mã OTP 6 chữ số tới email này để xác thực.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-white bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.99] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Tiếp Tục & Gửi Mã OTP</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
