import React from 'react';
import { Mail, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useSystemConfig } from '../../../context/SystemConfigContext';
import { AuthInput, AuthSubmitButton } from './ui';

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
      <div className="p-6 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-center space-y-2.5 animate-fade-in">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-300">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
          Tạm Đóng Đăng Ký
        </h4>
        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed max-w-xs mx-auto">
          Tính năng đăng ký tài khoản mới hiện đang tạm đóng theo thiết lập của Quản trị viên. Vui lòng quay lại sau!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSendOtp} className="space-y-4 animate-fade-in">
      <AuthInput
        label="Địa chỉ Email đăng ký"
        required
        autoFocus
        tabIndex={1}
        icon={Mail}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@gmail.com"
        hint={
          <div className="flex items-center space-x-1.5 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
            <Sparkles className="w-3.5 h-3.5 text-[#1877f2] shrink-0" />
            <span>Hệ thống sẽ gửi mã OTP 6 số để kích hoạt tài khoản của bạn.</span>
          </div>
        }
      />

      {/* Submit Button - tabIndex 2 ensures Tab from email (1) goes straight here */}
      <AuthSubmitButton
        type="submit"
        tabIndex={2}
        disabled={loading || !email.trim()}
        loading={loading}
        icon={ArrowRight}
        iconPosition="right"
        label="Tiếp Tục & Gửi Mã OTP"
        className="mt-3"
      />
    </form>
  );
};
