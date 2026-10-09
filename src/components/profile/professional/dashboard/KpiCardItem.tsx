import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardItemProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  growthPercent?: number;
  gradientClass?: string;
  iconColorClass?: string;
  tooltip?: string;
}

export const KpiCardItem: React.FC<KpiCardItemProps> = ({
  title,
  value,
  subtitle,
  icon,
  growthPercent = 12.5,
  gradientClass = 'from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20',
  iconColorClass = 'text-blue-600 dark:text-blue-400 bg-blue-500/10',
  tooltip,
}) => {
  const isPositive = growthPercent >= 0;

  return (
    <div
      className="relative p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#242526] border border-gray-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition group overflow-hidden"
      title={tooltip}
    >
      {/* Background soft glow */}
      <div
        className={`absolute -right-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br ${gradientClass} blur-xl opacity-60 group-hover:opacity-100 transition`}
      />

      <div className="relative flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${iconColorClass} shrink-0 shadow-xs`}>
          {icon}
        </div>
      </div>

      <div className="relative flex items-baseline justify-between gap-2">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-[#e4e6eb]">
          {typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
        </h3>

        {growthPercent !== undefined && (
          <div
            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 shrink-0" />
            ) : (
              <TrendingDown className="w-3 h-3 shrink-0" />
            )}
            <span>
              {isPositive ? '+' : ''}
              {growthPercent}%
            </span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="relative text-xs text-gray-400 dark:text-neutral-500 mt-1 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
