import React, { useEffect, useState } from 'react';
import { Users, Sparkles, Loader2, Globe2 } from 'lucide-react';
import { AudienceDemographics } from '../../../../types';
import { userService } from '../../../../services/userService';
import { GenderBreakdownCard } from './GenderBreakdownCard';
import { AgeRangesCard } from './AgeRangesCard';
import { TopCitiesCard } from './TopCitiesCard';
import { ActiveHoursCard } from './ActiveHoursCard';

export const AudienceDemographicsTab: React.FC = () => {
  const [data, setData] = useState<AudienceDemographics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getAudienceInsights()
      .then((res) => {
        if (res) setData(res);
      })
      .catch((err) => {
        console.error('Failed to fetch audience demographics:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Đang phân tích dữ liệu nhân khẩu học người theo dõi...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-indigo-950/30 p-4 rounded-2xl border border-purple-500/20 flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 shadow-md shadow-purple-500/20">
          <Globe2 className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            Thông tin nhân khẩu học người theo dõi
            <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 rounded-full">
              TikTok & Meta Creator Studio
            </span>
          </h4>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Nắm bắt chân dung độc giả, độ tuổi, phân bổ địa lý và thói quen sinh hoạt để định hình chiến lược sản xuất nội dung đạt hiệu ứng cao nhất.
          </p>
        </div>
      </div>

      {/* Grid of Demographics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenderBreakdownCard genderBreakdown={data?.genderBreakdown} />
        <AgeRangesCard ageRanges={data?.ageRanges} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopCitiesCard topCities={data?.topCities} />
        <ActiveHoursCard hourlyActivity={data?.hourlyActivity} />
      </div>
    </div>
  );
};
