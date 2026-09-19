import React from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';

interface RegisterStep2OtpProps {
  email: string;
  registerOtp: string;
  setRegisterOtp: (otp: string) => void;
  loading: boolean;
  onVerifyOtp: (e: React.FormEvent) => void;
  onResendOtp: () => void;
  onChangeEmail: () => void;
}

export const RegisterStep2Otp: React.FC<RegisterStep2OtpProps> = ({
  email,
  registerOtp,
  setRegisterOtp,
  loading,
  onVerifyOtp,
  onResendOtp,
  onChangeEmail,
}) => {
  return (
    <form onSubmit={onVerifyOtp} className="space-y-3.5">
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
          onClick={onResendOtp}
          disabled={loading}
          className="text-[#1877f2] dark:text-[#4599ff] hover:underline font-semibold cursor-pointer"
        >
          Gửi lại mã OTP
        </button>
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-gray-500 hover:underline cursor-pointer"
        >
          Đổi Email
        </button>
      </div>
    </form>
  );
};
