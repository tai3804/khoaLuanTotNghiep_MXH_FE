import React from 'react';
import { Volume2, Bell } from 'lucide-react';
import { NotificationToggleItem } from './NotificationToggleItem';

interface SoundSystemSectionProps {
  settings: any;
  updateSettings: (newSettings: any) => Promise<any>;
  playNotificationSound: () => void;
  toast: any;
}

export const SoundSystemSection: React.FC<SoundSystemSectionProps> = ({
  settings,
  updateSettings,
  playNotificationSound,
  toast,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl p-5 shadow-xs space-y-3">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-[#8a8d91]">
        Âm thanh & Hệ thống
      </h4>

      <div className="space-y-2.5">
        {/* Realtime Sound */}
        <NotificationToggleItem
          icon={<Volume2 className="w-4 h-4" />}
          iconBgColor="bg-amber-100 dark:bg-amber-950/50 text-amber-500"
          title="Âm thanh thông báo realtime"
          description="Phát âm thanh nhẹ (chime) khi có thông báo mới gửi tới"
          checked={settings?.sound ?? true}
          onChange={async (val) => {
            await updateSettings({ sound: val });
            if (val) playNotificationSound();
            toast.showSuccess(val ? 'Đã bật âm thanh' : 'Đã tắt âm thanh');
          }}
          extraAction={
            <button
              onClick={() => playNotificationSound()}
              className="text-xs font-bold text-[#1877f2] hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Thử chuông
            </button>
          }
        />

        {/* System & Alerts */}
        <NotificationToggleItem
          icon={<Bell className="w-4 h-4" />}
          iconBgColor="bg-purple-100 dark:bg-purple-950/50 text-purple-500"
          title="Thông báo hệ thống & Cảnh báo"
          description="Các thông báo cập nhật, bảo trì và cảnh báo tài khoản"
          checked={settings?.system ?? true}
          onChange={async (val) => {
            await updateSettings({ system: val });
            toast.showSuccess(val ? 'Đã bật thông báo hệ thống' : 'Đã tắt thông báo hệ thống');
          }}
        />
      </div>
    </div>
  );
};

