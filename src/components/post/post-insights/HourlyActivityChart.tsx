import React from 'react';

interface HourlyStatItem {
  hour: string;
  views: number;
  engagements: number;
}

interface HourlyActivityChartProps {
  data?: HourlyStatItem[];
}

export const HourlyActivityChart: React.FC<HourlyActivityChartProps> = ({
  data = [
    { hour: '00:00', views: 12, engagements: 2 },
    { hour: '04:00', views: 8, engagements: 1 },
    { hour: '08:00', views: 45, engagements: 11 },
    { hour: '12:00', views: 86, engagements: 24 },
    { hour: '16:00', views: 72, engagements: 18 },
    { hour: '20:00', views: 98, engagements: 31 },
  ],
}) => {
  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            Xu hướng xem theo khung giờ
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Số lượt xem & tương tác theo các mốc trong ngày
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-500" />
            <span className="text-gray-500 dark:text-gray-400">Lượt xem</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-purple-500" />
            <span className="text-gray-500 dark:text-gray-400">Tương tác</span>
          </div>
        </div>
      </div>

      <div className="pt-4 flex items-end justify-between gap-2 h-36 border-b border-gray-100 dark:border-gray-800 pb-2">
        {data.map((item) => {
          const viewHeight = Math.max(8, (item.views / maxViews) * 100);
          const engHeight = Math.max(4, (item.engagements / maxViews) * 100);

          return (
            <div key={item.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1 h-28 relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-10 bg-gray-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  {item.views} views • {item.engagements} tương tác
                </div>

                {/* Views Bar */}
                <div
                  style={{ height: `${viewHeight}%` }}
                  className="w-3 sm:w-4 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                />
                {/* Engagement Bar */}
                <div
                  style={{ height: `${engHeight}%` }}
                  className="w-2 sm:w-2.5 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                />
              </div>
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                {item.hour}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
