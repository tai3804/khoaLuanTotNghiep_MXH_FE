import React from 'react';
import { UserPlus } from 'lucide-react';
import { NotificationToggleItem } from './NotificationToggleItem';

interface FriendInteractionsSectionProps {
  settings: any;
  updateSettings: (newSettings: any) => Promise<any>;
  toast: any;
}

export const FriendInteractionsSection: React.FC<FriendInteractionsSectionProps> = ({
  settings,
  updateSettings,
  toast,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
        Bạn bè & Mối quan hệ
      </h4>

      <NotificationToggleItem
        icon={<UserPlus className="w-4 h-4" />}
        iconBgColor="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-500"
        title="Lời mời & Chấp nhận kết bạn"
        description="Khi nhận lời mời kết bạn mới hoặc ai đó chấp nhận lời mời"
        checked={settings?.friendRequest ?? true}
        onChange={async (val) => {
          await updateSettings({ friendRequest: val });
          toast.showSuccess(val ? 'Đã bật thông báo kết bạn' : 'Đã tắt thông báo kết bạn');
        }}
      />
    </div>
  );
};
