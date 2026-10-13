import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InsightKpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  colorTheme?: 'blue' | 'purple' | 'emerald' | 'amber' | 'rose';
}

const colorMap = {
  blue: {
    text: 'text-[#1877f2] dark:text-blue-400',
  },
  purple: {
    text: 'text-purple-600 dark:text-purple-400',
  },
  emerald: {
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    text: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    text: 'text-rose-600 dark:text-rose-400',
  },
};

export const InsightKpiCard: React.FC<InsightKpiCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  colorTheme = 'blue',
}) => {
  const theme = colorMap[colorTheme] || colorMap.blue;

  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/80 dark:bg-[#1a1b1d] transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600 dark:text-[#b0b3b8]">
          {label}
        </span>
        <div className={`p-2 rounded-xl bg-white dark:bg-[#242526] shadow-2xs border border-gray-100 dark:border-[#393a3b]/60 ${theme.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-xl font-black text-gray-900 dark:text-[#e4e6eb] tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
        </div>
        {subtext && (
          <div className="text-[11px] text-gray-400 dark:text-[#b0b3b8] mt-0.5">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
