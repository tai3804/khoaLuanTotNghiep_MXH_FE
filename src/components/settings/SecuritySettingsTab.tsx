import React from 'react';
import { ConfirmModal } from '../common/ConfirmModal';
import { OtpModal } from '../common/OtpModal';
import {
  useSecuritySettingsData,
  ActiveDevicesSection,
  MfaSecuritySection,
} from './security-tab';

export const SecuritySettingsTab: React.FC = () => {
  const {
    devices,
    loadingDevices,
    revokingId,
    revokingAll,
    confirmModal,
    setConfirmModal,
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
      {/* Active Devices Management Section */}
      <ActiveDevicesSection
        devices={devices}
        loadingDevices={loadingDevices}
        revokingId={revokingId}
        revokingAll={revokingAll}
        fetchDevices={fetchDevices}
        handleRevokeDevice={handleRevokeDevice}
        handleRevokeAllOthers={handleRevokeAllOthers}
      />

      {/* Multi-Factor Authentication (MFA / 2FA) Section */}
      <MfaSecuritySection
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
        confirmText="Tắt 2FA"
        cancelText="Hủy"
        loading={disableMfaLoading}
        error={disableMfaError}
        onConfirm={handleConfirmDisableMfa}
        onClose={() => setIsDisableMfaModalOpen(false)}
      />
    </div>
  );
};
