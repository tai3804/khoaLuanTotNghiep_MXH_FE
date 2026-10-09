import React from 'react';
import { Clock } from 'lucide-react';

interface ActiveHoursCardProps {
  hourlyActivity?: Array<{
    hour: string;
    activePercentage: number;
  }>;
}

export const ActiveHoursCard: React.FC<ActiveHoursCardProps> = ({
  hourlyActivity,
}) => {
  const list = hourlyActivity || [];
  const maxActivity = list.length > 0 ? Math.max(...list.map((h) => h.activePercentage), 0) : 0;
  const hasData = maxActivity > 0;

  // Find dynamic peak hour from real data
  const peakHourItem = hasData
    ? [...list].sort((a, b) => b.activePercentage - a.activePercentage)[0]
    : null;

  return (
    <div className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Thời gian người theo dõi hoạt động tích cực
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Khung giờ vàng đăng bài để tối đa hóa lượt tiếp cận
            </p>
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          <div className="pt-3 flex items-end justify-between gap-1.5 h-32 border-b border-gray-100 dark:border-gray-800 pb-2">
            {list.map((item) => {
              const height = Math.max(8, (item.activePercentage / Math.max(1, maxActivity)) * 100);
              const isPeak = item.activePercentage === maxActivity;

              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="w-full flex items-end justify-center relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md">
                      {item.activePercentage}% hoạt động
                    </div>

                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        isPeak
                          ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-xs shadow-orange-500/30 group-hover:brightness-110'
                          : 'bg-gradient-to-t from-blue-500/70 to-indigo-400/70 group-hover:from-blue-500 group-hover:to-indigo-500'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${isPeak ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-gray-400 dark:text-gray-500'}`}>
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>

          {peakHourItem && (
            <div className="text-[11px] text-amber-700 dark:text-amber-400/90 bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between">
              <span>💡 Khung giờ hoạt động cao nhất của bạn: <strong>{peakHourItem.hour}</strong></span>
              <span className="font-semibold text-amber-600 dark:text-amber-300">Độ active {peakHourItem.activePercentage}%</span>
            </div>
          )}
        </>
      ) : (
        <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          Chưa có đủ dữ liệu tương tác theo khung giờ
        </div>
      )}
    </div>
  );
};
