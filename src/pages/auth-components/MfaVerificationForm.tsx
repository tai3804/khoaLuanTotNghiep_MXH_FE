import React from 'react';
import { ShieldCheck, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';

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
      <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl flex items-center space-x-2.5 text-xs text-blue-800 dark:text-blue-300">
        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>Mở ứng dụng Google Authenticator hoặc Authy để lấy mã 6 chữ số.</span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
          Mã xác thực TOTP <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
            <KeyRound className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            autoFocus
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-base sm:text-lg font-mono font-bold tracking-[0.3em] text-center shadow-2xs"
          />
        </div>
      </div>

      <div className="flex flex-col space-y-2 pt-1">
        <button
          type="submit"
          disabled={loading || otpCode.length < 6}
          className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-white bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.99] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
          className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#383a3d] hover:text-[#1877f2] dark:hover:text-[#4599ff] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại đăng nhập</span>
        </button>
      </div>
    </form>
  );
};
