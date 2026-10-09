import React from 'react';
import { Calendar } from 'lucide-react';

interface AgeRangesCardProps {
  ageRanges?: Array<{
    range: string;
    percentage: number;
  }>;
}

export const AgeRangesCard: React.FC<AgeRangesCardProps> = ({
  ageRanges,
}) => {
  const list = ageRanges || [];
  const hasData = list.some((item) => item.percentage > 0);

  return (
    <div className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            Nhóm độ tuổi chủ yếu
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Phân khúc khán giả theo độ tuổi
          </p>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-3 pt-1">
          {list.map((item) => (
            <div key={item.range} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {item.range}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {item.percentage}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          Chưa có đủ dữ liệu độ tuổi của người theo dõi
        </div>
      )}
    </div>
  );
};
