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
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/30',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/30',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/30',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/30',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/30',
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
    <div className={`p-4 rounded-2xl border ${theme.border} ${theme.bg} transition-all duration-200 flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {label}
        </span>
        <div className={`p-2 rounded-xl bg-white dark:bg-gray-800 shadow-2xs ${theme.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
        </div>
        {subtext && (
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
