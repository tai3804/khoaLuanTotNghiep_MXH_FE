import React from 'react';
import { QRCodeSvg } from '../../common/QRCodeSvg';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface MfaSecuritySectionProps {
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
  return (
    <div className="border-t border-gray-100 dark:border-[#393a3b] pt-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Xác Thực 2 Bước (MFA / 2FA TOTP)</span>
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-[#8a8d91] mt-0.5">
            Bảo vệ tài khoản bằng mã bảo mật 6 số từ Google Authenticator hoặc Authy.
          </p>
        </div>
      </div>

      {mfaStatusMsg && (
        <div
          className={`mb-4 p-3.5 rounded-xl flex items-center space-x-2 text-xs font-bold ${
            mfaStatusMsg.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}
        >
          {mfaStatusMsg.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{mfaStatusMsg.msg}</span>
        </div>
      )}

      {!mfaQrCode ? (
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSetupMfa}
            disabled={mfaLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <QrCode className="w-4 h-4" />
            <span>Thiết lập 2FA (Google Authenticator)</span>
          </button>

          <button
            onClick={handleOpenDisableMfaModal}
            disabled={mfaLoading}
            className="px-4 py-2 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Tắt 2FA</span>
          </button>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-4">
          <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
            <QrCode className="w-4 h-4" />
            <span>Quét mã QR dưới đây bằng Google Authenticator</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-white dark:bg-[#242526] p-4 rounded-xl">
            {mfaQrCode ? (
              <QRCodeSvg value={mfaQrCode} size={144} className="border border-gray-200 dark:border-[#393a3b]" />
            ) : null}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-600 dark:text-[#b0b3b8] font-semibold">
                Hoặc nhập khóa bảo mật thủ công:
              </p>
              <code className="block bg-gray-100 dark:bg-[#3a3b3c] p-2 rounded-xl text-xs font-mono text-emerald-600 dark:text-emerald-400 select-all">
                {mfaSecret}
              </code>
              <p className="text-[10px] text-gray-400 dark:text-[#8a8d91]">
                Mỗi mã OTP có hiệu lực trong vòng 30 giây.
              </p>
            </div>
          </div>

          <form onSubmit={handleEnableMfa} className="flex items-center space-x-2">
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="Nhập 6 số OTP..."
              className="bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b] text-gray-900 dark:text-[#e4e6eb] text-sm font-mono tracking-widest px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
            />
            <button
              type="submit"
              disabled={mfaLoading || otpCode.length < 6}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
            >
              {mfaLoading ? 'Đang kích hoạt...' : 'Kích hoạt 2FA'}
            </button>
            <button
              type="button"
              onClick={() => setMfaQrCode(null)}
              className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-[#e4e6eb] text-xs font-semibold cursor-pointer"
            >
              Hủy
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
