import React from 'react';
import { Compass, Feed, Link, User } from 'lucide-react';

interface TrafficSourcesBreakdownProps {
  sources?: Record<string, number>;
}

export const TrafficSourcesBreakdown: React.FC<TrafficSourcesBreakdownProps> = ({
  sources = {
    'Bảng tin người theo dõi': 62.0,
    'Trang cá nhân': 18.5,
    'Khám phá / Đề xuất': 14.5,
    'Chia sẻ & Liên kết': 5.0,
  },
}) => {
  const sourceIcons: Record<string, any> = {
    'Bảng tin người theo dõi': Feed,
    'Trang cá nhân': User,
    'Khám phá / Đề xuất': Compass,
    'Chia sẻ & Liên kết': Link,
  };

  const getSourceColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-emerald-500',
      'bg-amber-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
          Nguồn lưu lượng truy cập
        </h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Tỷ lệ %
        </span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="w-full h-3 bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden flex shadow-inner">
        {Object.entries(sources).map(([name, pct], idx) => (
          <div
            key={name}
            style={{ width: `${Math.max(2, pct)}%` }}
            className={`${getSourceColor(idx)} transition-all duration-500`}
            title={`${name}: ${pct}%`}
          />
        ))}
      </div>

      {/* Legend list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {Object.entries(sources).map(([name, pct], idx) => {
          return (
            <div key={name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-gray-50 dark:bg-gray-800/80">
              <div className="flex items-center gap-2 truncate">
                <span className={`w-2.5 h-2.5 rounded-full ${getSourceColor(idx)} shrink-0`} />
                <span className="text-gray-700 dark:text-gray-300 truncate font-medium">
                  {name}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white shrink-0 ml-2">
                {pct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
