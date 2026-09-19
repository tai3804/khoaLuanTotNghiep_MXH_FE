import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';

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
  return (
    <form onSubmit={onSendOtp} className="space-y-3.5">
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
  );
};
