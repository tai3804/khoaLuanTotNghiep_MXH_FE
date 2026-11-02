import React from 'react';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import {
  AuthInput,
  AuthPasswordInput,
  AuthSubmitButton,
  OtpInputField,
} from '../../components/common/login-modal/ui';

interface ForgotPasswordFormProps {
  forgotStep: 1 | 2;
  setForgotStep: (step: 1 | 2) => void;
  email: string;
  setEmail: (email: string) => void;
  resetOtp: string;
  setResetOtp: (otp: string) => void;
  newPassword: string;
  setNewPassword: (pass: string) => void;
  confirmNewPassword: string;
  setConfirmNewPassword: (pass: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  loading: boolean;
  onSendOtp: (e: React.FormEvent) => void;
  onResetPassword: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  forgotStep,
  email,
  setEmail,
  resetOtp,
  setResetOtp,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  showPassword,
  setShowPassword,
  loading,
  onSendOtp,
  onResetPassword,
  onBackToLogin,
}) => {
  const passwordsMatch = Boolean(confirmNewPassword && newPassword && confirmNewPassword === newPassword);
  const passwordsMismatch = Boolean(confirmNewPassword && newPassword && confirmNewPassword !== newPassword);

  return (
    <div className="space-y-4 animate-fade-in">
      {forgotStep === 1 ? (
        <form onSubmit={onSendOtp} className="space-y-4">
          <AuthInput
            label="Địa chỉ Email tài khoản"
            required
            autoFocus
            tabIndex={1}
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
          />

          <AuthSubmitButton
            type="submit"
            tabIndex={2}
            disabled={loading || !email.trim()}
            loading={loading}
            icon={ArrowRight}
            iconPosition="right"
            label="Gửi Mã Xác Thực OTP"
            className="mt-2"
          />
        </form>
      ) : (
        <form onSubmit={onResetPassword} className="space-y-3.5">
          <div className="p-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300 truncate">
            Mã OTP đã gửi tới: <strong className="font-semibold">{email}</strong>
          </div>

          <OtpInputField
            label="Mã OTP 6 số"
            required
            autoFocus
            tabIndex={1}
            value={resetOtp}
            onChange={setResetOtp}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <AuthPasswordInput
              label="Mật khẩu mới"
              required
              tabIndex={2}
              sizeVariant="compact"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mật khẩu mới"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            <AuthPasswordInput
              label="Nhập lại mật khẩu"
              required
              tabIndex={3}
              sizeVariant="compact"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Xác nhận lại"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              passwordsMatch={passwordsMatch}
              passwordsMismatch={passwordsMismatch}
            />
          </div>

          <AuthSubmitButton
            type="submit"
            tabIndex={4}
            disabled={loading || !newPassword || passwordsMismatch || resetOtp.length < 6}
            loading={loading}
            icon={CheckCircle2}
            iconPosition="left"
            label="Đặt Lại Mật Khẩu"
            className="mt-2"
          />
        </form>
      )}

      <div className="pt-2 text-center">
        <button
          type="button"
          tabIndex={5}
          onClick={onBackToLogin}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 dark:text-[#b0b3b8] hover:text-[#1877f2] dark:hover:text-[#4599ff] hover:underline transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại Đăng nhập</span>
        </button>
      </div>
    </div>
  );
};
