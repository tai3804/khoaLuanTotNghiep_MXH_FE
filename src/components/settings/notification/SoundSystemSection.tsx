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
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
        Âm thanh & Hệ thống
      </h4>

      <div className="space-y-2">
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
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer"
            >
              Thử âm thanh
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
