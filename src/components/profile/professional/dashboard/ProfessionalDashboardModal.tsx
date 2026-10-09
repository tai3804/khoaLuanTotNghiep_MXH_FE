import React, { useState } from 'react';
import { LayoutDashboard, Users, Globe2, CalendarClock } from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { OverviewKpiCards } from './OverviewKpiCards';
import { PerformanceChart } from './PerformanceChart';
import { TopPostsList } from './TopPostsList';
import { CreatorTipsCard } from './CreatorTipsCard';
import { useProfessionalDashboardData } from './useProfessionalDashboardData';
import { ProfileVisitorsList } from '../visitors/ProfileVisitorsList';
import { AudienceDemographicsTab } from '../demographics/AudienceDemographicsTab';
import { ScheduledPostsList } from '../scheduler/ScheduledPostsList';
import { PostInsightsModal } from '../../../post/post-insights/PostInsightsModal';

interface ProfessionalDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  fullName: string;
  avatarUrl: string;
  creatorCategory?: string;
  profileViewCount?: number;
  followerCount?: number;
}

type TabType = 'overview' | 'visitors' | 'demographics' | 'planner';

export const ProfessionalDashboardModal: React.FC<ProfessionalDashboardModalProps> = ({
  isOpen,
  onClose,
  fullName,
  avatarUrl,
  creatorCategory,
  profileViewCount = 0,
  followerCount = 0,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPostInsightId, setSelectedPostInsightId] = useState<string | null>(null);

  const { period, setPeriod, analytics, loading, error, refresh } =
    useProfessionalDashboardData({ isOpen });

  if (!isOpen) return null;

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'visitors', label: 'Lượt xem hồ sơ', icon: Users },
    { id: 'demographics', label: 'Nhân khẩu học', icon: Globe2 },
    { id: 'planner', label: 'Lên lịch bài viết', icon: CalendarClock },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-3xl shadow-2xl max-w-5xl w-full h-[92vh] max-h-[900px] flex flex-col overflow-hidden border border-gray-200 dark:border-neutral-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <DashboardHeader
            fullName={fullName}
            avatarUrl={avatarUrl}
            creatorCategory={creatorCategory}
            period={period}
            onPeriodChange={setPeriod}
            onRefresh={refresh}
            onClose={onClose}
            loading={loading}
          />

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 pb-2 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-neutral-800 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/30'
                      : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {activeTab === 'overview' && (
              <>
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold border border-red-200 dark:border-red-900/40">
                    {error}
                  </div>
                )}

                {/* 1. Overview KPI Cards */}
                <OverviewKpiCards
                  analytics={analytics}
                  profileViewCount={profileViewCount}
                  followerCount={followerCount}
                />

                {/* 2. Visual Performance Trends Chart */}
                <PerformanceChart
                  data={analytics?.dailyMetrics || []}
                  period={period}
                />

                {/* 3. Top Content Performance Ranking */}
                <TopPostsList
                  posts={analytics?.topPosts || []}
                  onViewInsights={(postId) => setSelectedPostInsightId(postId)}
                />

                {/* 4. Creator Optimization Tips */}
                <CreatorTipsCard />
              </>
            )}

            {activeTab === 'visitors' && (
              <ProfileVisitorsList onClose={onClose} />
            )}

            {activeTab === 'demographics' && (
              <AudienceDemographicsTab />
            )}

            {activeTab === 'planner' && (
              <ScheduledPostsList />
            )}
          </div>
        </div>
      </div>

      {/* Post Insights Sub-Modal */}
      {selectedPostInsightId && (
        <PostInsightsModal
          postId={selectedPostInsightId}
          isOpen={Boolean(selectedPostInsightId)}
          onClose={() => setSelectedPostInsightId(null)}
        />
      )}
    </>
  );
};
