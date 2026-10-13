import React from 'react';
import { Users2 } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

interface GenderBreakdownCardProps {
  genderBreakdown?: {
    malePercentage: number;
    femalePercentage: number;
    otherPercentage: number;
  };
}

export const GenderBreakdownCard: React.FC<GenderBreakdownCardProps> = ({
  genderBreakdown,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const male = genderBreakdown?.malePercentage ?? 0;
  const female = genderBreakdown?.femalePercentage ?? 0;
  const other = genderBreakdown?.otherPercentage ?? 0;
  const hasData = male > 0 || female > 0 || other > 0;

  return (
    <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]">
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
              {isEn ? 'Gender Distribution' : 'Cơ cấu giới tính'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              {isEn ? 'Audience profile breakdown by gender' : 'Phân bổ người tiếp cận hồ sơ'}
            </p>
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          {/* Visual Stacked Bar */}
          <div className="w-full h-3 bg-gray-100 dark:bg-[#3a3b3c] rounded-full overflow-hidden flex shadow-inner">
            {male > 0 && (
              <div
                style={{ width: `${male}%` }}
                className="bg-[#1877f2] transition-all duration-500"
                title={`${isEn ? 'Male' : 'Nam'}: ${male}%`}
              />
            )}
            {female > 0 && (
              <div
                style={{ width: `${female}%` }}
                className="bg-[#6366f1] transition-all duration-500"
                title={`${isEn ? 'Female' : 'Nữ'}: ${female}%`}
              />
            )}
            {other > 0 && (
              <div
                style={{ width: `${other}%` }}
                className="bg-[#94a3b8] transition-all duration-500"
                title={`${isEn ? 'Other' : 'Khác'}: ${other}%`}
              />
            )}
          </div>

          {/* Legend & Stats */}
          <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1e1f20] border border-gray-200/80 dark:border-[#393a3b]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#1877f2]" />
                <span className="text-xs text-gray-500 dark:text-[#b0b3b8] font-medium">
                  {isEn ? 'Male' : 'Nam'}
                </span>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                {male}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1e1f20] border border-gray-200/80 dark:border-[#393a3b]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#6366f1]" />
                <span className="text-xs text-gray-500 dark:text-[#b0b3b8] font-medium">
                  {isEn ? 'Female' : 'Nữ'}
                </span>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                {female}%
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#1e1f20] border border-gray-200/80 dark:border-[#393a3b]">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#94a3b8]" />
                <span className="text-xs text-gray-500 dark:text-[#b0b3b8] font-medium">
                  {isEn ? 'Other' : 'Khác'}
                </span>
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">
                {other}%
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-xs text-gray-400 dark:text-[#8a8d91] bg-gray-50 dark:bg-[#1e1f20] rounded-xl border border-dashed border-gray-200 dark:border-[#393a3b]">
          {isEn ? 'No audience demographics data available yet' : 'Chưa có đủ dữ liệu nhân khẩu học người theo dõi'}
        </div>
      )}
    </div>
  );
};
