import React from 'react';
import { Mail, Phone } from 'lucide-react';
import { NotificationToggleItem } from './NotificationToggleItem';

interface MessagesCallsSectionProps {
  settings: any;
  updateSettings: (newSettings: any) => Promise<any>;
  toast: any;
}

export const MessagesCallsSection: React.FC<MessagesCallsSectionProps> = ({
  settings,
  updateSettings,
  toast,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
        Tin nhắn & Cuộc gọi
      </h4>

      <div className="space-y-2">
        {/* Direct Message */}
        <NotificationToggleItem
          icon={<Mail className="w-4 h-4" />}
          iconBgColor="bg-sky-100 dark:bg-sky-950/50 text-sky-500"
          title="Tin nhắn trực tiếp"
          description="Nhận thông báo khi có tin nhắn mới gửi đến bạn"
          checked={settings?.message ?? true}
          onChange={async (val) => {
            await updateSettings({ message: val });
            toast.showSuccess(val ? 'Đã bật thông báo tin nhắn' : 'Đã tắt thông báo tin nhắn');
          }}
        />

        {/* Incoming & Missed Calls */}
        <NotificationToggleItem
          icon={<Phone className="w-4 h-4" />}
          iconBgColor="bg-teal-100 dark:bg-teal-950/50 text-teal-500"
          title="Cuộc gọi đến & Cuộc gọi nhỡ"
          description="Thông báo khi có người gọi hoặc khi bạn bị nhỡ cuộc gọi"
          checked={settings?.call ?? true}
          onChange={async (val) => {
            await updateSettings({ call: val });
            toast.showSuccess(val ? 'Đã bật thông báo cuộc gọi' : 'Đã tắt thông báo cuộc gọi');
          }}
        />
      </div>
    </div>
  );
};
