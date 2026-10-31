import React, { useState, useEffect } from 'react';
import { KeyRound, ArrowRight, RotateCw, Edit3 } from 'lucide-react';

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
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || loading) return;
    setCooldown(60);
    onResendOtp();
  };

  return (
    <form onSubmit={onVerifyOtp} className="space-y-4">
      <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl flex items-center justify-between">
        <div className="text-left truncate pr-2">
          <p className="text-[11px] text-blue-700 dark:text-blue-300 font-semibold">
            Mã OTP đã gửi tới:
          </p>
          <p className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-100 truncate">
            {email}
          </p>
        </div>
        <button
          type="button"
          onClick={onChangeEmail}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer shrink-0"
          title="Đổi email"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Sửa</span>
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
          Mã xác thực OTP (6 chữ số) <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
            <KeyRound className="w-4 h-4" />
          </div>
          <input
            type="text"
            maxLength={6}
            required
            autoFocus
            value={registerOtp}
            onChange={(e) => setRegisterOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-base sm:text-lg font-mono font-bold tracking-[0.3em] text-center shadow-2xs"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className="text-gray-500 dark:text-gray-400">Không nhận được mã?</span>
        <button
          type="button"
          disabled={cooldown > 0 || loading}
          onClick={handleResend}
          className="flex items-center space-x-1 font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline disabled:opacity-50 disabled:no-underline transition cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại mã'}</span>
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || registerOtp.length < 6}
        className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-white bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.99] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Xác Thực OTP & Tiếp Tục</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};
