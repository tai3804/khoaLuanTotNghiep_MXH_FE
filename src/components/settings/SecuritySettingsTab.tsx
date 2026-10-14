import React from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import { OtpModal } from '../common/OtpModal';
import {
  useSecuritySettingsData,
  ActiveDevicesSection,
  MfaSecuritySection,
} from './security-tab';
import { Shield, Lock } from 'lucide-react';

export const SecuritySettingsTab: React.FC = () => {
  const {
    devices,
    loadingDevices,
    revokingId,
    revokingAll,
    confirmModal,
    setConfirmModal,
    isMfaEnabled,
    mfaQrCode,
    setMfaQrCode,
    mfaSecret,
    otpCode,
    setOtpCode,
    mfaLoading,
    mfaStatusMsg,
    isDisableMfaModalOpen,
    setIsDisableMfaModalOpen,
    disableMfaLoading,
    disableMfaError,
    fetchDevices,
    handleRevokeDevice,
    handleRevokeAllOthers,
    handleSetupMfa,
    handleEnableMfa,
    handleOpenDisableMfaModal,
    handleConfirmDisableMfa,
  } = useSecuritySettingsData();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="pb-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1877f2]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-[#e4e6eb]">
                Mật khẩu &amp; Bảo mật
              </h2>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                Bảo vệ tài khoản với xác thực 2 bước (2FA) và giám sát các thiết bị đăng nhập từ xa.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section 1: Multi-Factor Authentication (MFA / 2FA TOTP) */}
      <MfaSecuritySection
        isMfaEnabled={isMfaEnabled}
        mfaQrCode={mfaQrCode}
        setMfaQrCode={setMfaQrCode}
        mfaSecret={mfaSecret}
        otpCode={otpCode}
        setOtpCode={setOtpCode}
        mfaLoading={mfaLoading}
        mfaStatusMsg={mfaStatusMsg}
        handleSetupMfa={handleSetupMfa}
        handleEnableMfa={handleEnableMfa}
        handleOpenDisableMfaModal={handleOpenDisableMfaModal}
      />

      {/* Section 2: Active Devices Management */}
      <ActiveDevicesSection
        devices={devices}
        loadingDevices={loadingDevices}
        revokingId={revokingId}
        revokingAll={revokingAll}
        fetchDevices={fetchDevices}
        handleRevokeDevice={handleRevokeDevice}
        handleRevokeAllOthers={handleRevokeAllOthers}
      />

      {/* Confirmation Modal for Revoking Device */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* OTP Modal for Disabling 2FA */}
      <OtpModal
        isOpen={isDisableMfaModalOpen}
        title="Xác nhận tắt 2FA"
        description="Vui lòng nhập mã OTP 6 chữ số từ ứng dụng Authenticator để xác nhận tắt 2FA:"
        confirmText="Xác nhận tắt"
        cancelText="Hủy"
        loading={disableMfaLoading}
        error={disableMfaError}
        onConfirm={handleConfirmDisableMfa}
        onClose={() => setIsDisableMfaModalOpen(false)}
      />
    </div>
  );
};
