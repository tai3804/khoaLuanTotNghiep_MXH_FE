import React from 'react';
import { MapPin } from 'lucide-react';

interface TopCitiesCardProps {
  topCities?: Array<{
    city: string;
    percentage: number;
  }>;
}

export const TopCitiesCard: React.FC<TopCitiesCardProps> = ({
  topCities,
}) => {
  const list = topCities || [];
  const hasData = list.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            Vị trí hàng đầu
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Các tỉnh thành tập trung nhiều người theo dõi nhất
          </p>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-2.5 pt-1">
          {list.map((item, idx) => (
            <div
              key={item.city}
              className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-gray-50/70 dark:bg-gray-800/50 hover:bg-gray-100/70 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {item.city}
                </span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          Chưa có dữ liệu vị trí người theo dõi
        </div>
      )}
    </div>
  );
};
