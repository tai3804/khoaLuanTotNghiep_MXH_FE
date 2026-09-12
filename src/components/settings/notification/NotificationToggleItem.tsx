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
    <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-[#3a3b3c]/50 rounded-xl">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBgColor}`}>
          {icon}
        </div>
        <div>
          <h5 className="text-xs font-bold text-gray-800 dark:text-[#e4e6eb]">{title}</h5>
          <p className="text-[11px] text-gray-400">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {extraAction}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
};
