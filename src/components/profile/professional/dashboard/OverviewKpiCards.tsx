import React from 'react';
import { Eye, Users2, HeartHandshake, UserCheck2, Percent } from 'lucide-react';
import { KpiCardItem } from './KpiCardItem';
import { CreatorAnalytics } from '../types';

interface OverviewKpiCardsProps {
  analytics?: CreatorAnalytics | null;
  profileViewCount?: number;
  followerCount?: number;
}

export const OverviewKpiCards: React.FC<OverviewKpiCardsProps> = ({
  analytics,
  profileViewCount = 0,
  followerCount = 0,
}) => {
  const totalViews = analytics?.totalViews ?? 0;
  const totalReach = analytics?.totalReach ?? Math.round(totalViews * 0.85);
  const totalEngagements = analytics?.totalEngagements ?? 0;
  const avgEngagementRate = analytics?.avgEngagementRate ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. Lượt xem bài viết */}
      <KpiCardItem
        title="Lượt xem bài viết"
        value={totalViews}
        subtitle="Tổng số lần hiển thị nội dung"
        icon={<Eye className="w-5 h-5" />}
        growthPercent={14.8}
        gradientClass="from-blue-500/20 to-cyan-500/20"
        iconColorClass="text-blue-600 dark:text-blue-400 bg-blue-500/10"
        tooltip="Số lần người dùng nhìn thấy bài viết của bạn"
      />

      {/* 2. Lượt tiếp cận */}
      <KpiCardItem
        title="Lượt tiếp cận"
        value={totalReach}
        subtitle="Số tài khoản độc nhất"
        icon={<Users2 className="w-5 h-5" />}
        growthPercent={8.5}
        gradientClass="from-indigo-500/20 to-purple-500/20"
        iconColorClass="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
        tooltip="Số tài khoản riêng biệt đã nhìn thấy nội dung của bạn"
      />

      {/* 3. Lượt tương tác */}
      <KpiCardItem
        title="Lượt tương tác"
        value={totalEngagements}
        subtitle="Thích, bình luận & chia sẻ"
        icon={<HeartHandshake className="w-5 h-5" />}
        growthPercent={22.4}
        gradientClass="from-rose-500/20 to-pink-500/20"
        iconColorClass="text-rose-600 dark:text-rose-400 bg-rose-500/10"
        tooltip="Tổng cảm xúc, bình luận và chia sẻ trên tất cả bài viết"
      />

      {/* 4. Lượt xem trang cá nhân */}
      <KpiCardItem
        title="Lượt xem hồ sơ"
        value={profileViewCount}
        subtitle="Lượt ghé thăm trang cá nhân"
        icon={<UserCheck2 className="w-5 h-5" />}
        growthPercent={5.2}
        gradientClass="from-amber-500/20 to-orange-500/20"
        iconColorClass="text-amber-600 dark:text-amber-400 bg-amber-500/10"
        tooltip="Số lượt người khác bấm vào trang cá nhân của bạn"
      />

      {/* 5. Tỷ lệ tương tác */}
      <KpiCardItem
        title="Tỷ lệ tương tác"
        value={`${avgEngagementRate}%`}
        subtitle="Dựa trên lượt xem"
        icon={<Percent className="w-5 h-5" />}
        growthPercent={3.1}
        gradientClass="from-emerald-500/20 to-teal-500/20"
        iconColorClass="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
        tooltip="Tỷ lệ tương tác trung bình = (Tương tác / Lượt xem) * 100"
      />
    </div>
  );
};
