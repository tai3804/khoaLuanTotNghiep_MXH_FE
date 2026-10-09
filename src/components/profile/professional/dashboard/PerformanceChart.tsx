import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Info } from 'lucide-react';
import { DailyMetric } from '../types';

interface PerformanceChartProps {
  data: DailyMetric[];
  period: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data = [],
  period,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeMetric, setActiveMetric] = useState<'views' | 'engagements'>('views');

  if (!data || data.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-[#242526] border border-gray-100 dark:border-neutral-800 text-center">
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          Chưa có dữ liệu thống kê trong khoảng thời gian này.
        </p>
      </div>
    );
  }

  // Calculate scales
  const maxViews = Math.max(...data.map((d) => d.views), 10);
  const maxEngagements = Math.max(...data.map((d) => d.engagements), 10);
  const chartHeight = 180;
  const chartWidth = 700;

  // Format date helper (MM-DD)
  const formatShortDate = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      if (parts.length >= 3) return `${parts[2]}/${parts[1]}`;
      return dStr;
    } catch {
      return dStr;
    }
  };

  const hoveredItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#242526] border border-gray-100 dark:border-neutral-800 shadow-xs space-y-4">
      {/* Chart Title & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb] flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Biến động Lượt xem & Tương tác</span>
            </h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">
              {period} qua
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
            Rê chuột vào các cột mốc để xem chi tiết số lượt xem và tương tác từng ngày
          </p>
        </div>

        {/* Metric Switcher buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-neutral-800/80 self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveMetric('views')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeMetric === 'views'
                ? 'bg-white dark:bg-[#242526] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-[#e4e6eb]'
            }`}
          >
            Lượt xem (Views)
          </button>
          <button
            onClick={() => setActiveMetric('engagements')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              activeMetric === 'engagements'
                ? 'bg-white dark:bg-[#242526] text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-[#e4e6eb]'
            }`}
          >
            Tương tác (Reactions)
          </button>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative pt-2">
        {/* Floating Tooltip */}
        {hoveredItem && (
          <div className="absolute top-0 right-4 z-10 p-2.5 rounded-xl bg-gray-900/90 dark:bg-neutral-800/95 text-white shadow-xl text-xs backdrop-blur-xs border border-white/10 pointer-events-none animate-in fade-in duration-150 flex items-center gap-3">
            <div>
              <span className="text-gray-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {hoveredItem.date}
              </span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-blue-400">
                👁️ {hoveredItem.views.toLocaleString('vi-VN')} views
              </span>
              <span className="text-rose-400">
                ❤️ {hoveredItem.engagements.toLocaleString('vi-VN')} tương tác
              </span>
            </div>
          </div>
        )}

        {/* Chart Body */}
        <div className="h-48 w-full flex items-end gap-1 sm:gap-2 px-2 pt-6 pb-2 border-b border-gray-100 dark:border-neutral-800">
          {data.map((item, index) => {
            const val = activeMetric === 'views' ? item.views : item.engagements;
            const maxVal = activeMetric === 'views' ? maxViews : maxEngagements;
            const heightPercent = Math.max(Math.round((val / maxVal) * 100), 4);
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={item.date}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
              >
                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-200 ${
                    activeMetric === 'views'
                      ? isHovered
                        ? 'bg-blue-600 dark:bg-blue-400 shadow-md shadow-blue-500/30'
                        : 'bg-blue-500/30 dark:bg-blue-500/40 hover:bg-blue-500/60'
                      : isHovered
                      ? 'bg-indigo-600 dark:bg-indigo-400 shadow-md shadow-indigo-500/30'
                      : 'bg-indigo-500/30 dark:bg-indigo-500/40 hover:bg-indigo-500/60'
                  }`}
                />

                {/* Subtitle / Day label for sampled items */}
                {(data.length <= 14 || index % Math.ceil(data.length / 7) === 0) && (
                  <span className="text-[10px] text-gray-400 dark:text-neutral-500 mt-2 font-medium truncate">
                    {formatShortDate(item.date)}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 pt-2 px-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
              <span>Lượt xem</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
              <span>Tương tác (Like, Comment, Share)</span>
            </div>
          </div>
          <span className="text-[11px] text-gray-400">Cập nhật theo thời gian thực</span>
        </div>
      </div>
    </div>
  );
};
