import React from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { OtpInputField, AuthSubmitButton } from '../../components/common/login-modal/ui';

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
    <form onSubmit={onVerify} className="space-y-4 animate-fade-in">
      <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl flex items-center space-x-2.5 text-xs text-blue-800 dark:text-blue-300">
        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>Mở ứng dụng Google Authenticator hoặc Authy để lấy mã 6 chữ số.</span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
          {errorMessage}
        </div>
      )}

      <OtpInputField
        label="Mã xác thực TOTP"
        required
        autoFocus
        tabIndex={1}
        value={otpCode}
        onChange={setOtpCode}
      />

      <div className="flex flex-col space-y-2 pt-1">
        <AuthSubmitButton
          type="submit"
          tabIndex={2}
          disabled={loading || otpCode.length < 6}
          loading={loading}
          icon={ArrowRight}
          iconPosition="right"
          label="Xác Thực Mở Khóa"
        />

        <button
          type="button"
          tabIndex={3}
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
