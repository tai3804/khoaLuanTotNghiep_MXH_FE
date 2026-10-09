import React from 'react';
import { Users2 } from 'lucide-react';

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
  const male = genderBreakdown?.malePercentage ?? 0;
  const female = genderBreakdown?.femalePercentage ?? 0;
  const other = genderBreakdown?.otherPercentage ?? 0;
  const hasData = male > 0 || female > 0 || other > 0;

  return (
    <div className="bg-white dark:bg-gray-800/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Cơ cấu giới tính
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Phân bổ người tiếp cận hồ sơ
            </p>
          </div>
        </div>
      </div>

      {hasData ? (
        <>
          {/* Visual Stacked Bar */}
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700/60 rounded-full overflow-hidden flex shadow-inner">
            {male > 0 && (
              <div
                style={{ width: `${male}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`Nam: ${male}%`}
              />
            )}
            {female > 0 && (
              <div
                style={{ width: `${female}%` }}
                className="bg-pink-500 transition-all duration-500"
                title={`Nữ: ${female}%`}
              />
            )}
            {other > 0 && (
              <div
                style={{ width: `${other}%` }}
                className="bg-purple-500 transition-all duration-500"
                title={`Khác: ${other}%`}
              />
            )}
          </div>

          {/* Legend & Stats */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/20">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Nam</span>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {male}%
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-100/60 dark:border-pink-900/20">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Nữ</span>
              <p className="text-sm font-bold text-pink-600 dark:text-pink-400">
                {female}%
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100/60 dark:border-purple-900/20">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Khác</span>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                {other}%
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="py-6 text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          Chưa có đủ dữ liệu nhân khẩu học người theo dõi
        </div>
      )}
    </div>
  );
};
