import React from 'react';

interface NotificationDropdownFooterProps {
  isEn: boolean;
  onClose: () => void;
  onNavigateSettings?: () => void;
}

export const NotificationDropdownFooter: React.FC<NotificationDropdownFooterProps> = ({
  isEn,
  onClose,
  onNavigateSettings,
}) => {
  return (
    <div className="p-2.5 bg-gray-50/80 dark:bg-[#3a3b3c]/40 border-t border-gray-100 dark:border-[#393a3b] text-center">
      <button
        onClick={() => {
          onClose();
          if (onNavigateSettings) onNavigateSettings();
        }}
        className="text-xs font-semibold text-[#1877f2] dark:text-[#2d88ff] hover:underline transition cursor-pointer"
      >
        {isEn ? 'Notification settings' : 'Cài đặt thông báo'}
      </button>
    </div>
  );
};
