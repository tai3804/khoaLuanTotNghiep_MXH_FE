import React from 'react';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

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
  return (
    <div className="space-y-4">
      {forgotStep === 1 ? (
        <form onSubmit={onSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
              Địa chỉ Email tài khoản <span className="text-red-500">*</span>
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
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-white bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.99] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Gửi Mã Xác Thực OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={onResetPassword} className="space-y-3.5">
          <div className="p-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300 truncate">
            Mã OTP đã gửi tới: <strong className="font-semibold">{email}</strong>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
              Mã OTP 6 số <span className="text-red-500">*</span>
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
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-base font-mono font-bold tracking-[0.3em] text-center shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mật khẩu mới"
                  className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-xs sm:text-sm shadow-2xs"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
                Nhập lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Xác nhận lại"
                  className="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-xs sm:text-sm shadow-2xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !newPassword || newPassword !== confirmNewPassword || resetOtp.length < 6}
            className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-white bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.99] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Đặt Lại Mật Khẩu</span>
              </>
            )}
          </button>
        </form>
      )}

      <div className="pt-2 text-center">
        <button
          type="button"
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
