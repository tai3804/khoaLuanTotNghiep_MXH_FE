import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import { authService } from '../../../services/api';

export const useSecuritySettingsData = () => {
  const toast = useToast();

  // Security & Devices States
  const [devices, setDevices] = useState<any[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // MFA 2FA States
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaStatusMsg, setMfaStatusMsg] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isDisableMfaModalOpen, setIsDisableMfaModalOpen] = useState(false);
  const [disableMfaLoading, setDisableMfaLoading] = useState(false);
  const [disableMfaError, setDisableMfaError] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoadingDevices(true);
    try {
      const devList = await authService.getDevices();
      setDevices(devList);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRevokeDevice = (deviceId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Đăng Xuất Thiết Bị Từ Xa',
      message: 'Bạn có chắc chắn muốn đăng xuất từ xa khỏi thiết bị này không? Phiên làm việc trên thiết bị đó sẽ bị hủy ngay lập tức.',
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setRevokingId(deviceId);
        try {
          await authService.revokeDevice(deviceId);
          localStorage.setItem('lastRevokedAt', Date.now().toString());
          setDevices((prev) =>
            prev.map((d) => (d.id === deviceId ? { ...d, status: 'REVOKED' } : d))
          );
          toast.showSuccess('Đã đăng xuất từ xa thiết bị thành công.');
        } catch (err: any) {
          toast.showError('Không thể thu hồi thiết bị: ' + (err.response?.data?.message || err.message));
        } finally {
          setRevokingId(null);
        }
      },
    });
  };

  const handleRevokeAllOthers = () => {
    const currentFingerprint = localStorage.getItem('deviceFingerprint');
    const activeOtherDevices = devices.filter(
      (d) => d.status !== 'REVOKED' && d.deviceFingerprint !== currentFingerprint
    );

    if (activeOtherDevices.length === 0) {
      toast.showInfo('Không có thiết bị từ xa nào khác đang đăng nhập.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Đăng Xuất Tất Cả Thiết Bị Khác',
      message: `Bạn có chắc chắn muốn đăng xuất tất cả ${activeOtherDevices.length} thiết bị từ xa khác? Tất cả các thiết bị đó sẽ bị ép đăng xuất ngay lập tức.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        setRevokingAll(true);
        try {
          await Promise.all(activeOtherDevices.map((d) => authService.revokeDevice(d.id).catch(() => null)));
          localStorage.setItem('lastRevokedAt', Date.now().toString());
          toast.showSuccess(`Đã đăng xuất từ xa thành công khỏi ${activeOtherDevices.length} thiết bị.`);
          fetchDevices();
        } catch (err: any) {
          toast.showError('Có lỗi xảy ra khi đăng xuất thiết bị từ xa.');
        } finally {
          setRevokingAll(false);
        }
      },
    });
  };

  const handleSetupMfa = async () => {
    setMfaLoading(true);
    setMfaStatusMsg(null);
    try {
      const data = await authService.setupMfa();
      setMfaQrCode(data.qrCodeUrl || data.qrCode || null);
      setMfaSecret(data.secretKey || null);
    } catch (err: any) {
      setMfaStatusMsg({
        type: 'error',
        msg: err.response?.data?.message || 'Không thể thiết lập 2FA lúc này.',
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setMfaLoading(true);
    setMfaStatusMsg(null);
    try {
      await authService.enableMfa(otpCode.trim());
      setMfaStatusMsg({
        type: 'success',
        msg: 'Chúc mừng! Xác thực 2 bước (2FA TOTP) đã được kích hoạt bảo vệ tài khoản của bạn.',
      });
      setMfaQrCode(null);
      setMfaSecret(null);
      setOtpCode('');
    } catch (err: any) {
      setMfaStatusMsg({
        type: 'error',
        msg: err.response?.data?.message || 'Mã OTP không chính xác. Vui lòng thử lại.',
      });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleOpenDisableMfaModal = () => {
    setDisableMfaError(null);
    setIsDisableMfaModalOpen(true);
  };

  const handleConfirmDisableMfa = async (code: string) => {
    setDisableMfaLoading(true);
    setDisableMfaError(null);
    try {
      await authService.disableMfa(code.trim());
      setMfaStatusMsg({
        type: 'success',
        msg: 'Đã tắt xác thực 2 bước (2FA) thành công.',
      });
      setIsDisableMfaModalOpen(false);
    } catch (err: any) {
      setDisableMfaError(err.response?.data?.message || 'Không thể tắt 2FA. Mã OTP không hợp lệ.');
    } finally {
      setDisableMfaLoading(false);
    }
  };

  return {
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
  };
};
