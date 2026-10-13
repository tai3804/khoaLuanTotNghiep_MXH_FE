import React from 'react';
import { Calendar } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface AgeRangesCardProps {
  ageRanges?: Array<{
    range: string;
    percentage: number;
  }>;
}

export const AgeRangesCard: React.FC<AgeRangesCardProps> = ({
  ageRanges,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const list = ageRanges || [];
  const hasData = list.some((item) => item.percentage > 0);

  return (
    <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
            {isEn ? 'Dominant Age Groups' : 'Nhóm độ tuổi chủ yếu'}
          </h4>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            {isEn ? 'Audience segmentation by age group' : 'Phân khúc khán giả theo độ tuổi'}
          </p>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-3.5 pt-1">
          {list.map((item) => (
            <div key={item.range} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-700 dark:text-[#e4e6eb]">
                  {item.range} {isEn ? 'years old' : 'tuổi'}
                </span>
                <span className="font-bold text-gray-900 dark:text-[#e4e6eb]">
                  {item.percentage}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-[#3a3b3c] rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                  className="h-full bg-[#1877f2] dark:bg-[#4599ff] rounded-full transition-all duration-500"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-400 dark:text-[#8a8d91] bg-gray-50 dark:bg-[#1e1f20] rounded-xl border border-dashed border-gray-200 dark:border-[#393a3b]">
          {isEn ? 'No age group data available yet' : 'Chưa có đủ dữ liệu độ tuổi của người theo dõi'}
        </div>
      )}
    </div>
  );
};
