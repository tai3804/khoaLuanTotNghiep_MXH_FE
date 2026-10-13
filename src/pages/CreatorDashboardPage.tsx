import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Users,
  Eye,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  OverviewKpiCards,
  PerformanceChart,
  TopPostsList,
  useProfessionalDashboardData,
} from '../components/profile/professional/dashboard';
import { AudienceDemographicsTab } from '../components/profile/professional/demographics/AudienceDemographicsTab';
import { ProfileVisitorsList } from '../components/profile/professional/visitors/ProfileVisitorsList';
import { ScheduledPostsList } from '../components/profile/professional/scheduler/ScheduledPostsList';
import { ProfessionalBadge } from '../components/profile/professional/ProfessionalBadge';

export const CreatorDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'overview' | 'demographics' | 'visitors' | 'scheduler'>('overview');

  const {
    period,
    setPeriod,
    analytics,
    loading,
    error,
    refresh,
  } = useProfessionalDashboardData({ isOpen: true });

  const fullName = user?.fullName || (isEn ? 'Creator' : 'Nhà sáng tạo');
  const creatorCategory = (user as any)?.creatorCategory || 'Người sáng tạo nội dung số';
  const profileViewCount = (user as any)?.profileViewCount || 0;
  const followerCount = (user as any)?.followerCount || 0;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors pb-16">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] shadow-xs px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="p-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
              title={isEn ? 'Back' : 'Quay lại'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">
                  {isEn ? 'Professional Dashboard' : 'Bảng điều khiển chuyên nghiệp'}
                </h1>
                <ProfessionalBadge category={creatorCategory} />
              </div>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                {fullName} • {isEn ? 'Creator Studio & Realtime Insights' : 'Trung tâm sáng tạo & Thống kê thời gian thực'}
              </p>
            </div>
          </div>

          {/* Right Action: Refresh & Period Selector */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex items-center bg-gray-100 dark:bg-[#3a3b3c] p-1 rounded-xl">
              {(['7d', '28d', '60d'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    period === p
                      ? 'bg-white dark:bg-[#242526] text-[#1877f2] dark:text-[#4599ff] shadow-xs'
                      : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {p === '7d' ? (isEn ? '7 days' : '7 ngày') : p === '28d' ? (isEn ? '28 days' : '28 ngày') : (isEn ? '60 days' : '60 ngày')}
                </button>
              ))}
            </div>

            <button
              onClick={refresh}
              disabled={loading}
              className="p-2 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer disabled:opacity-50"
              title={isEn ? 'Refresh data' : 'Làm mới dữ liệu'}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-5 mb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: isEn ? 'Performance Overview' : 'Tổng quan hiệu suất', icon: BarChart3 },
            { id: 'demographics', label: isEn ? 'Audience Insights' : 'Phân tích đối tượng', icon: Users },
            { id: 'visitors', label: isEn ? 'Visitor History' : 'Lịch sử khách thăm', icon: Eye },
            { id: 'scheduler', label: isEn ? 'Post Scheduler' : 'Lên lịch xuất bản', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-3.5 text-xs sm:text-sm font-semibold rounded-xl transition whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Body Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Tab 1: Overview & Performance */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <OverviewKpiCards
              analytics={analytics}
              profileViewCount={profileViewCount}
              followerCount={followerCount}
            />

            {/* Performance Interactive Chart */}
            <PerformanceChart
              data={analytics?.dailyMetrics || []}
              period={period}
            />

            {/* Top Performing Posts */}
            <div className="w-full">
              <TopPostsList posts={analytics?.topPosts || []} />
            </div>
          </div>
        )}

        {/* Tab 2: Demographics */}
        {activeTab === 'demographics' && (
          <AudienceDemographicsTab />
        )}

        {/* Tab 3: Visitors */}
        {activeTab === 'visitors' && (
          <ProfileVisitorsList />
        )}

        {/* Tab 4: Scheduler */}
        {activeTab === 'scheduler' && (
          <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-xs border border-gray-200 dark:border-[#393a3b]">
            <ScheduledPostsList />
          </div>
        )}
      </div>
    </div>
  );
};
