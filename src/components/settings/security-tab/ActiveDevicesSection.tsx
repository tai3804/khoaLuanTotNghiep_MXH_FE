import React from 'react';
import { Smartphone, Trash2, RefreshCw, LogOut } from 'lucide-react';

interface ActiveDevicesSectionProps {
  devices: any[];
  loadingDevices: boolean;
  revokingId: string | null;
  revokingAll: boolean;
  fetchDevices: () => void;
  handleRevokeDevice: (deviceId: string) => void;
  handleRevokeAllOthers: () => void;
}

export const ActiveDevicesSection: React.FC<ActiveDevicesSectionProps> = ({
  devices,
  loadingDevices,
  revokingId,
  revokingAll,
  fetchDevices,
  handleRevokeDevice,
  handleRevokeAllOthers,
}) => {
  const currentFingerprint = localStorage.getItem('deviceFingerprint');
  const hasOtherActiveDevices = devices.some(
    (d) => d.status !== 'REVOKED' && d.deviceFingerprint !== currentFingerprint
  );

  return (
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
          {hasOtherActiveDevices && (
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
            className="p-1.5 text-gray-400 hover:text-[#1877f2] dark:hover:text-[#e4e6eb] transition cursor-pointer"
            title="Làm mới thiết bị"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDevices ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loadingDevices ? (
        <div className="py-6 text-center text-xs text-gray-400 dark:text-[#8a8d91]">
          Đang tải danh sách thiết bị...
        </div>
      ) : devices.length === 0 ? (
        <div className="p-4 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl text-center text-xs text-gray-400 dark:text-[#8a8d91]">
          Chưa có danh sách thiết bị nào được lưu trữ.
        </div>
      ) : (
        <div className="space-y-2">
          {devices.map((device) => {
            const isCurrent =
              device.deviceFingerprint &&
              device.deviceFingerprint === currentFingerprint;
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
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isRevoked
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        : isCurrent
                        ? 'bg-blue-100 dark:bg-[#1877f2]/30 text-[#1877f2] dark:text-blue-400'
                        : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300'
                    }`}
                  >
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
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isRevoked
                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            : 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                        }`}
                      >
                        {isRevoked ? 'ĐÃ THU HỒI' : 'HOẠT ĐỘNG'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-[#8a8d91] mt-0.5">
                      IP: {device.ipAddress || '127.0.0.1'} • Vị trí: {device.location || 'Việt Nam'} • HĐ:{' '}
                      {device.lastActiveAt
                        ? new Date(device.lastActiveAt).toLocaleString('vi-VN')
                        : 'Vừa xong'}
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
                    <span>
                      {revokingId === device.id
                        ? 'Đang thu hồi...'
                        : isCurrent
                        ? 'Đăng xuất'
                        : 'Đăng xuất từ xa'}
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
