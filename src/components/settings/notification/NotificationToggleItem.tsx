import React from 'react';

export interface NotificationToggleItemProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  extraAction?: React.ReactNode;
}

export const NotificationToggleItem: React.FC<NotificationToggleItemProps> = ({
  icon,
  iconBgColor,
  title,
  description,
  checked,
  onChange,
  extraAction,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/70 dark:bg-[#18191a] border border-gray-100 dark:border-[#393a3b]/60 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-150">
      <div className="flex items-center space-x-3.5 min-w-0 pr-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${iconBgColor}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h5 className="text-[13px] font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight truncate">{title}</h5>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 leading-snug">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 flex-shrink-0">
        {extraAction}
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#1877f2] shadow-inner"></div>
        </label>
      </div>
    </div>
  );
};

