import React, { useEffect, useState } from 'react';
import { Users2, Loader2 } from 'lucide-react';
import { AudienceDemographics } from '../../../../types';
import { userService } from '../../../../services/userService';
import { useLanguage } from '../../../../context/LanguageContext';
import { GenderBreakdownCard } from './GenderBreakdownCard';
import { AgeRangesCard } from './AgeRangesCard';
import { TopCitiesCard } from './TopCitiesCard';
import { ActiveHoursCard } from './ActiveHoursCard';

export const AudienceDemographicsTab: React.FC = () => {
  const { language } = useLanguage();
  const isEn = language === 'en';
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
        <Loader2 className="w-8 h-8 text-[#1877f2] animate-spin" />
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
          {isEn ? 'Analyzing audience demographics data...' : 'Đang phân tích dữ liệu nhân khẩu học người theo dõi...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] shrink-0">
          <Users2 className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-gray-900 dark:text-[#e4e6eb] text-sm flex items-center gap-2">
            {isEn ? 'Audience Demographics & Insights' : 'Thông tin nhân khẩu học người theo dõi'}
            <span className="text-[11px] bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8] font-semibold px-2.5 py-0.5 rounded-lg border border-gray-200/60 dark:border-[#393a3b]">
              {isEn ? 'Audience Analytics' : 'Phân tích đối tượng'}
            </span>
          </h4>
          <p className="text-gray-600 dark:text-[#b0b3b8] leading-relaxed">
            {isEn
              ? 'Understand your audience profiles, age breakdown, locations, and active hours to build high-impact content strategies.'
              : 'Nắm bắt chân dung độc giả, độ tuổi, phân bổ địa lý và thói quen sinh hoạt để định hình chiến lược sản xuất nội dung đạt hiệu ứng cao nhất.'}
          </p>
        </div>
      </div>

      {/* Grid of Demographics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GenderBreakdownCard genderBreakdown={data?.genderBreakdown} />
        <AgeRangesCard ageRanges={data?.ageRanges} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopCitiesCard topCities={data?.topCities} />
        <ActiveHoursCard hourlyActivity={data?.hourlyActivity} />
      </div>
    </div>
  );
};
