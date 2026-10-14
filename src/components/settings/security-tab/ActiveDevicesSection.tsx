import React from 'react';
import { Smartphone, Laptop, Globe, Trash2, RefreshCw, LogOut, ShieldCheck } from 'lucide-react';

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

  const getDeviceIcon = (name: string = '') => {
    const lower = name.toLowerCase();
    if (lower.includes('iphone') || lower.includes('android') || lower.includes('mobile')) {
      return <Smartphone className="w-4 h-4 text-emerald-500" />;
    }
    if (lower.includes('mac') || lower.includes('windows') || lower.includes('laptop')) {
      return <Laptop className="w-4 h-4 text-blue-500" />;
    }
    return <Globe className="w-4 h-4 text-indigo-500" />;
  };

  return (
    <div className="rounded-2xl border border-gray-200/90 dark:border-[#393a3b] bg-white/70 dark:bg-[#242526]/70 p-5 shadow-xs transition-all space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-[#393a3b] pb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#1877f2]" />
            <span>Quản lý thiết bị đăng nhập</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
              {devices.filter((d) => d.status !== 'REVOKED').length} thiết bị hoạt động
            </span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            Danh sách các phiên làm việc và thiết bị đang đăng nhập tài khoản của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasOtherActiveDevices && (
            <button
              onClick={handleRevokeAllOthers}
              disabled={revokingAll}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              title="Đăng xuất khỏi tất cả các thiết bị từ xa khác"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{revokingAll ? 'Đang xử lý...' : 'Đăng xuất tất cả thiết bị khác'}</span>
            </button>
          )}

          <button
            onClick={fetchDevices}
            disabled={loadingDevices}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer shrink-0"
            title="Làm mới danh sách thiết bị"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingDevices ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loadingDevices ? (
        <div className="py-8 text-center text-xs text-gray-400 dark:text-[#8a8d91]">
          Đang tải danh sách thiết bị đăng nhập...
        </div>
      ) : devices.length === 0 ? (
        <div className="p-4 bg-gray-50 dark:bg-[#3a3b3c]/40 rounded-xl text-center text-xs text-gray-400 dark:text-[#8a8d91]">
          Chưa có phiên đăng nhập nào được lưu.
        </div>
      ) : (
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {devices.map((device) => {
            const isCurrent =
              device.deviceFingerprint &&
              device.deviceFingerprint === currentFingerprint;
            const isRevoked = device.status === 'REVOKED';

            return (
              <div
                key={device.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  isRevoked
                    ? 'bg-gray-50/50 dark:bg-[#202122]/50 border-gray-200/50 dark:border-[#393a3b]/50 opacity-55'
                    : isCurrent
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs'
                    : 'bg-white dark:bg-[#202122] border-gray-200/70 dark:border-[#393a3b]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isRevoked
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                        : isCurrent
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                        : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {getDeviceIcon(device.deviceName)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] truncate">
                        {device.deviceName || 'Trình duyệt Web'}
                      </h5>

                      {isCurrent && (
                        <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border border-blue-300/80 dark:border-blue-700">
                          Phiên hiện tại
                        </span>
                      )}

                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          isRevoked
                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {isRevoked ? 'ĐÃ THU HỒI' : 'HOẠT ĐỘNG'}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 dark:text-[#8a8d91] mt-0.5 truncate">
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
                    className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0 ml-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>
                      {revokingId === device.id
                        ? 'Đang thu hồi...'
                        : isCurrent
                        ? 'Đăng xuất'
                        : 'Thu hồi'}
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
