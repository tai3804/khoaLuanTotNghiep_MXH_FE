import React from 'react';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface TopCitiesCardProps {
  topCities?: Array<{
    city: string;
    percentage: number;
  }>;
}

export const TopCitiesCard: React.FC<TopCitiesCardProps> = ({
  topCities,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const list = topCities || [];
  const hasData = list.length > 0;

  return (
    <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]">
          <MapPin className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
            {isEn ? 'Top Audience Locations' : 'Vị trí hàng đầu'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            {isEn ? 'Top regions where your followers reside' : 'Các tỉnh thành tập trung nhiều người theo dõi nhất'}
          </p>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-2.5 pt-1">
          {list.map((item, idx) => (
            <div
              key={item.city}
              className="flex items-center justify-between text-xs p-3 rounded-xl bg-gray-50 dark:bg-[#1e1f20] border border-gray-200/80 dark:border-[#393a3b] hover:bg-gray-100 dark:hover:bg-[#2a2b2c] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] font-bold text-[11px] flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="font-semibold text-gray-800 dark:text-[#e4e6eb]">
                  {item.city}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-[#e4e6eb]">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-400 dark:text-[#8a8d91] bg-gray-50 dark:bg-[#1e1f20] rounded-xl border border-dashed border-gray-200 dark:border-[#393a3b]">
          {isEn ? 'No location data available yet' : 'Chưa có dữ liệu vị trí người theo dõi'}
        </div>
      )}
    </div>
  );
};
