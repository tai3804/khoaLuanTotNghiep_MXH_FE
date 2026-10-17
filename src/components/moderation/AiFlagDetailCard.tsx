import React from 'react';
import { Sparkles } from 'lucide-react';
import { ModerationReport } from '../../services/moderationService';
import { aiCategoryLabels, aiSeverityStyles } from './moderationConstants';

export const AiFlagDetailCard: React.FC<{ report: ModerationReport }> = ({ report }) => {
  const percent = report.aiScore != null ? Math.round(report.aiScore * 100) : null;
  const severity = report.aiSeverity ? aiSeverityStyles[report.aiSeverity.toUpperCase()] : undefined;
  const category = report.aiCategory
    ? aiCategoryLabels[report.aiCategory.toUpperCase()] || report.aiCategory
    : null;
  const barColor =
    percent == null ? 'bg-gray-400' : percent >= 85 ? 'bg-red-500' : percent >= 65 ? 'bg-orange-500' : 'bg-amber-500';
  const explanation = report.aiReason || report.description;

  return (
    <div className="mt-2 rounded-xl border border-purple-200/50 bg-purple-50/40 p-3 dark:border-purple-900/30 dark:bg-purple-950/20">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-300">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            AI phân tích
          </span>
          {category && (
            <span className="rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 shadow-2xs dark:bg-[#1a1b1d] dark:text-gray-200">
              {category}
            </span>
          )}
        </div>
        {severity && (
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${severity.className}`}>
            Mức độ: {severity.label}
          </span>
        )}
      </div>

      {percent !== null && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950/60">
            <div className={`h-full rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${Math.min(100, percent)}%` }} />
          </div>
          <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{percent}% nghi vấn</span>
        </div>
      )}

      {explanation && (
        <p className="mt-1.5 text-xs font-medium italic text-gray-600 dark:text-gray-300">
          "{explanation}"
        </p>
      )}
    </div>
  );
};
