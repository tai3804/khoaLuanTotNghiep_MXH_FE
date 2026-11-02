import React, { useState, useEffect } from 'react';
import { ArrowRight, RotateCw, Edit3, ShieldCheck } from 'lucide-react';
import { OtpInputField, AuthSubmitButton } from './ui';

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
    <form onSubmit={onVerifyOtp} className="space-y-4 animate-fade-in">
      {/* Email Display Banner */}
      <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2.5 truncate pr-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-[#1877f2] dark:text-[#4599ff] shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-left truncate">
            <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
              Mã OTP đã được gửi tới:
            </p>
            <p className="text-xs sm:text-sm font-bold text-blue-950 dark:text-blue-100 truncate">
              {email}
            </p>
          </div>
        </div>
        <button
          type="button"
          tabIndex={4}
          onClick={onChangeEmail}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1877f2] dark:text-[#4599ff] hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer shrink-0"
          title="Đổi địa chỉ email khác"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Sửa</span>
        </button>
      </div>

      {/* OTP Input Field - tabIndex 1 */}
      <OtpInputField
        label="Nhập mã xác thực OTP (6 chữ số)"
        required
        autoFocus
        tabIndex={1}
        value={registerOtp}
        onChange={setRegisterOtp}
      />

      {/* Resend OTP */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <span className="text-gray-500 dark:text-[#b0b3b8]">Không nhận được mã?</span>
        <button
          type="button"
          tabIndex={3}
          disabled={cooldown > 0 || loading}
          onClick={handleResend}
          className="flex items-center space-x-1.5 font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline disabled:opacity-50 disabled:no-underline transition cursor-pointer"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại mã OTP'}</span>
        </button>
      </div>

      {/* Submit Button - tabIndex 2 ensures Tab from OTP goes straight here */}
      <AuthSubmitButton
        type="submit"
        tabIndex={2}
        disabled={loading || registerOtp.length < 6}
        loading={loading}
        icon={ArrowRight}
        iconPosition="right"
        label="Xác Thực OTP & Tiếp Tục"
        className="mt-3"
      />
    </form>
  );
};
