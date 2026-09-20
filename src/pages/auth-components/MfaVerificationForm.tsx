import React from 'react';
import { ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

interface MfaVerificationFormProps {
  otpCode: string;
  setOtpCode: (code: string) => void;
  loading: boolean;
  errorMessage: string | null;
  onVerify: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const MfaVerificationForm: React.FC<MfaVerificationFormProps> = ({
  otpCode,
  setOtpCode,
  loading,
  errorMessage,
  onVerify,
  onCancel,
}) => {
  return (
    <form onSubmit={onVerify} className="space-y-4">
      <div className="flex flex-col items-center text-center space-y-2 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
          Xác Thực 2 Bước (2FA TOTP)
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-300">
          Tài khoản của bạn đã được bật bảo vệ 2FA. Vui lòng mở ứng dụng <strong>Google Authenticator</strong> hoặc <strong>Authy</strong> và nhập mã OTP 6 chữ số.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
          Mã xác thực TOTP <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
          <input
            type="text"
            required
            autoFocus
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="Ví dụ: 123456"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8] tracking-[0.2em] text-center"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2 pt-2">
        <button
          type="submit"
          disabled={loading || otpCode.length < 6}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md disabled:opacity-50 transition flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Xác Thực Mở Khóa</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-700 dark:text-gray-300 font-bold text-xs py-3 rounded-xl transition"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </form>
  );
};
