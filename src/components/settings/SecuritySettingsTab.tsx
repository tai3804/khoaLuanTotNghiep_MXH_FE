import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/api';
import { ConfirmModal } from '../common/ConfirmModal';
import { OtpModal } from '../common/OtpModal';
import {
  Smartphone,
  Trash2,
  QrCode,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  LogOut,
} from 'lucide-react';

export const SecuritySettingsTab: React.FC = () => {
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

  // Fetch Devices on Mount
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

  return (
    <div className="space-y-6">
      {/* Active Devices Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-[#393a3b] pb-3 mb-3 gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-[#e4e6eb] flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-[#1877f2]" />
              <span>Quản Lý Thiết Bị Đăng Nhập (Đăng Xuất Từ Xa)</span>
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-[#8a8d91] mt-0.5">
              Danh sách các phiên làm việc và thiết bị đang đăng nhập tài khoản của bạn.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {devices.some((d) => d.status !== 'REVOKED' && d.deviceFingerprint !== localStorage.getItem('deviceFingerprint')) && (
              <button
                onClick={handleRevokeAllOthers}
                disabled={revokingAll}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                title="Đăng xuất khỏi tất cả các thiết bị từ xa khác"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{revokingAll ? 'Đang đăng xuất...' : 'Đăng xuất tất cả thiết bị khác'}</span>
              </button>
            )}
            <button
              onClick={fetchDevices}
              className="p-1.5 text-gray-400 hover:text-[#1877f2] dark:hover:text-[#e4e6eb] transition"
              title="Làm mới thiết bị"
            >
              <RefreshCw className={`w-4 h-4 ${loadingDevices ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loadingDevices ? (
          <div className="py-6 text-center text-xs text-gray-400 dark:text-[#8a8d91]">Đang tải danh sách thiết bị...</div>
        ) : devices.length === 0 ? (
          <div className="p-4 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl text-center text-xs text-gray-400 dark:text-[#8a8d91]">
            Chưa có danh sách thiết bị nào được lưu trữ.
          </div>
        ) : (
          <div className="space-y-2">
            {devices.map((device) => {
              const isCurrent = device.deviceFingerprint && device.deviceFingerprint === localStorage.getItem('deviceFingerprint');
              const isRevoked = device.status === 'REVOKED';

              return (
                <div
                  key={device.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                    isRevoked
                      ? 'bg-gray-100/50 dark:bg-[#2d2e2f]/50 border-gray-200 dark:border-[#393a3b] opacity-60'
                      : isCurrent
                      ? 'bg-blue-50/50 dark:bg-[#1877f2]/10 border-blue-200 dark:border-blue-800/40'
                      : 'bg-gray-50 dark:bg-[#3a3b3c]/50 border-gray-200/60 dark:border-[#393a3b]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isRevoked
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        : isCurrent
                        ? 'bg-blue-100 dark:bg-[#1877f2]/30 text-[#1877f2] dark:text-blue-400'
                        : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300'
                    }`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h5 className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb]">
                          {device.deviceName || 'Trình duyệt Web'}
                        </h5>
                        {isCurrent && (
                          <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-300 dark:border-blue-700">
                            Thiết bị này
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isRevoked
                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            : 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                        }`}>
                          {isRevoked ? 'ĐÃ THU HỒI' : 'HOẠT ĐỘNG'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-[#8a8d91] mt-0.5">
                        IP: {device.ipAddress || '127.0.0.1'} • Vị trí: {device.location || 'Việt Nam'} • HĐ: {device.lastActiveAt ? new Date(device.lastActiveAt).toLocaleString('vi-VN') : 'Vừa xong'}
                      </p>
                    </div>
                  </div>

                  {!isRevoked && (
                    <button
                      onClick={() => handleRevokeDevice(device.id)}
                      disabled={revokingId === device.id}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{revokingId === device.id ? 'Đang thu hồi...' : isCurrent ? 'Đăng xuất' : 'Đăng xuất từ xa'}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MFA / 2FA Section */}
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
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(mfaQrCode)}`}
                  alt="MFA QR Code"
                  className="w-36 h-36 rounded-xl border border-gray-200 dark:border-[#393a3b]"
                />
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
                className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-[#e4e6eb] text-xs font-semibold"
              >
                Hủy
              </button>
            </form>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

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
