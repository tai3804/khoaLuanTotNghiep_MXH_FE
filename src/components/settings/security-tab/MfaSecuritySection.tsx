import React, { useState } from 'react';
import { QRCodeSvg } from '../../common/QRCodeSvg';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

interface MfaSecuritySectionProps {
  isMfaEnabled: boolean;
  mfaQrCode: string | null;
  setMfaQrCode: (val: string | null) => void;
  mfaSecret: string | null;
  otpCode: string;
  setOtpCode: (val: string) => void;
  mfaLoading: boolean;
  mfaStatusMsg: { type: 'success' | 'error'; msg: string } | null;
  handleSetupMfa: () => void;
  handleEnableMfa: (e: React.FormEvent) => void;
  handleOpenDisableMfaModal: () => void;
}

export const MfaSecuritySection: React.FC<MfaSecuritySectionProps> = ({
  isMfaEnabled,
  mfaQrCode,
  setMfaQrCode,
  mfaSecret,
  otpCode,
  setOtpCode,
  mfaLoading,
  mfaStatusMsg,
  handleSetupMfa,
  handleEnableMfa,
  handleOpenDisableMfaModal,
}) => {
  const [copiedSecret, setCopiedSecret] = useState(false);

  const handleCopySecret = () => {
    if (!mfaSecret) return;
    navigator.clipboard.writeText(mfaSecret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-gray-200/90 dark:border-[#393a3b] bg-white/70 dark:bg-[#242526]/70 p-5 shadow-xs transition-all space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 transition-colors ${
              isMfaEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
            }`}
          >
            {isMfaEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
                Xác thực 2 yếu tố (2FA TOTP)
              </h3>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isMfaEnabled
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isMfaEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {isMfaEnabled ? 'ĐÃ BẢO VỆ' : 'CHƯA BẬT'}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
              Bảo vệ tài khoản bằng mã bảo mật 6 số qua Google Authenticator, Microsoft Authenticator hoặc Authy.
            </p>
          </div>
        </div>

        {/* Action Toggle Button */}
        {!mfaQrCode && (
          <div className="flex items-center gap-2 shrink-0">
            {isMfaEnabled ? (
              <>
                <button
                  type="button"
                  onClick={handleSetupMfa}
                  disabled={mfaLoading}
                  className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl border border-gray-200 dark:border-[#393a3b] transition cursor-pointer flex items-center gap-1.5"
                  title="Cấu hình lại 2FA hoặc chuyển thiết bị"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Cấu hình lại</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenDisableMfaModal}
                  disabled={mfaLoading}
                  className="px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Tắt 2FA</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSetupMfa}
                disabled={mfaLoading}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" />
                <span>{mfaLoading ? 'Đang tạo mã...' : 'Thiết lập 2FA ngay'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Status Alert Message */}
      {mfaStatusMsg && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in ${
            mfaStatusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {mfaStatusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{mfaStatusMsg.msg}</span>
        </div>
      )}

      {/* Setup Step-by-Step Flow when QR Code is Generated */}
      {mfaQrCode && (
        <div className="pt-4 border-t border-gray-200 dark:border-[#393a3b] space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              Thiết lập bảo mật 2 bước TOTP
            </h4>
            <button
              type="button"
              onClick={() => setMfaQrCode(null)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
            >
              Hủy bỏ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Step 1: QR Code Card */}
            <div className="bg-gray-50/70 dark:bg-[#18191a] p-4 rounded-xl border border-gray-200/80 dark:border-[#393a3b] flex flex-col items-center text-center space-y-2">
              <span className="text-[11px] font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider">
                Bước 1: Quét mã QR
              </span>
              <div className="p-2 bg-white rounded-xl shadow-xs">
                <QRCodeSvg value={mfaQrCode} size={156} />
              </div>
              <p className="text-[11px] text-gray-400 dark:text-[#8a8d91]">
                Dùng camera hoặc tính năng quét trong Google Authenticator / Authy
              </p>
            </div>

            {/* Step 2 & 3: Manual Key & OTP Verification */}
            <div className="space-y-4">
              {/* Step 2: Manual Key */}
              <div className="bg-gray-50/70 dark:bg-[#18191a] p-3.5 rounded-xl border border-gray-200/80 dark:border-[#393a3b] space-y-1.5">
                <span className="text-[11px] font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#1877f2]" />
                  <span>Bước 2: Hoặc nhập khóa thủ công</span>
                </span>
                <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#242526] px-3 py-2 rounded-lg border border-gray-200/60 dark:border-[#393a3b]">
                  <code className="text-xs font-mono font-bold text-[#1877f2] select-all break-all">
                    {mfaSecret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-md text-gray-500 dark:text-[#b0b3b8] transition cursor-pointer shrink-0"
                    title="Sao chép khóa"
                  >
                    {copiedSecret ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Step 3: Verification Code Form */}
              <form onSubmit={handleEnableMfa} className="space-y-2.5">
                <span className="text-[11px] font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#1877f2]" />
                  <span>Bước 3: Nhập mã 6 số từ ứng dụng</span>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    className="flex-1 bg-white dark:bg-[#18191a] border border-gray-300 dark:border-[#393a3b] text-gray-900 dark:text-[#e4e6eb] text-center text-lg font-mono tracking-[0.3em] font-black px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1877f2]/20 focus:border-[#1877f2] shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={mfaLoading || otpCode.length < 6}
                    className="px-5 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-40 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                  >
                    {mfaLoading ? 'Đang kích hoạt...' : 'Kích hoạt 2FA'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
