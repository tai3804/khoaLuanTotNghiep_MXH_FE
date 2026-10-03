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
  setForgotStep,
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
      {/* Step Header */}
      <div className="mb-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Quên Mật Khẩu</span>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full">
            Bước {forgotStep}/2
          </span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
          {forgotStep === 1
            ? 'Nhập địa chỉ email tài khoản của bạn để nhận mã OTP khôi phục.'
            : `Nhập mã OTP đã được gửi tới ${email} và đặt mật khẩu mới.`}
        </p>
      </div>

      {forgotStep === 1 ? (
        <form onSubmit={onSendOtp} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
              Email tài khoản <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nhap-email-cua-ban@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs py-3 rounded-xl shadow-sm disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Gửi Mã OTP Khôi Phục</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={onResetPassword} className="space-y-3.5">
          {/* OTP Code */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">
                Mã OTP (6 số) <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setForgotStep(1)}
                className="text-[11px] font-semibold text-[#1877f2] hover:underline cursor-pointer"
              >
                Đổi email
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
              <input
                type="text"
                required
                maxLength={6}
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-bold tracking-widest placeholder-gray-400 dark:placeholder-[#b0b3b8] transition"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="•••••••• (Tối thiểu 6 ký tự)"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8] transition"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-bold text-gray-800 dark:text-[#e4e6eb] mb-1.5">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 dark:text-[#b0b3b8]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#4e4f50] focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-xs font-medium placeholder-gray-400 dark:placeholder-[#b0b3b8] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !resetOtp.trim() || !newPassword.trim() || !confirmNewPassword.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-sm disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Xác Nhận & Đặt Lại Mật Khẩu</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Back to login */}
      <div className="pt-3 border-t border-gray-100 dark:border-[#393a3b] text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-[#1877f2] dark:hover:text-[#1877f2] transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại đăng nhập</span>
        </button>
      </div>
    </div>
  );
};
