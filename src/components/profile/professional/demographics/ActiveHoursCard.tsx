import React from 'react';
import { Clock } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface ActiveHoursCardProps {
  hourlyActivity?: Array<{
    hour: string;
    activePercentage: number;
  }>;
}

export const ActiveHoursCard: React.FC<ActiveHoursCardProps> = ({
  hourlyActivity,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const list = hourlyActivity || [];
  const maxActivity = list.length > 0 ? Math.max(...list.map((h) => h.activePercentage), 0) : 0;
  const hasData = maxActivity > 0;

  // Find dynamic peak hour from real data
  const peakHourItem = hasData
    ? [...list].sort((a, b) => b.activePercentage - a.activePercentage)[0]
    : null;

  return (
    <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              {isEn ? 'Follower Active Hours' : 'Thời gian người theo dõi hoạt động'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              {isEn ? 'Peak activity distribution throughout the day' : 'Khung giờ tương tác cao nhất trong ngày'}
            </p>
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          <div className="pt-4 flex items-end justify-between gap-2 h-36 border-b border-gray-100 dark:border-[#393a3b] pb-2">
            {list.map((item) => {
              const height = Math.max(8, (item.activePercentage / Math.max(1, maxActivity)) * 100);
              const isPeak = item.activePercentage === maxActivity;

              return (
                <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 bg-gray-900 text-white text-[11px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      {item.activePercentage}% {isEn ? 'active' : 'hoạt động'}
                    </div>

                    <div
                      style={{ height: `${height}%` }}
                      className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                        isPeak
                          ? 'bg-[#1877f2] dark:bg-[#4599ff] group-hover:brightness-110'
                          : 'bg-gray-200 dark:bg-[#3a3b3c] group-hover:bg-gray-300 dark:group-hover:bg-[#4e4f50]'
                      }`}
                    />
                  </div>
                  <span className={`text-[11px] ${isPeak ? 'text-[#1877f2] dark:text-[#4599ff] font-bold' : 'text-gray-400 dark:text-[#8a8d91] font-medium'}`}>
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>

          {peakHourItem && (
            <div className="text-xs text-gray-700 dark:text-[#b0b3b8] bg-gray-50 dark:bg-[#1e1f20] p-3 rounded-xl border border-gray-200/80 dark:border-[#393a3b] flex items-center justify-between">
              <span>
                {isEn ? 'Peak active hour: ' : 'Khung giờ hoạt động cao nhất: '}
                <strong className="text-gray-900 dark:text-[#e4e6eb]">{peakHourItem.hour}</strong>
              </span>
              <span className="font-semibold text-[#1877f2] dark:text-[#4599ff]">
                {peakHourItem.activePercentage}% {isEn ? 'active' : 'tương tác'}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="py-8 text-center text-xs text-gray-400 dark:text-[#8a8d91] bg-gray-50 dark:bg-[#1e1f20] rounded-xl border border-dashed border-gray-200 dark:border-[#393a3b]">
          {isEn ? 'No hourly activity data available yet' : 'Chưa có đủ dữ liệu tương tác theo khung giờ'}
        </div>
      )}
    </div>
  );
};
