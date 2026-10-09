import React, { useEffect, useState } from 'react';
import {
  X,
  BarChart3,
  Eye,
  Users,
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  TrendingUp,
  Percent,
  Clock,
  Loader2,
} from 'lucide-react';
import { PostInsights } from '../../../types';
import { postService } from '../../../services/postService';
import { InsightKpiCard } from './InsightKpiCard';
import { TrafficSourcesBreakdown } from './TrafficSourcesBreakdown';
import { HourlyActivityChart } from './HourlyActivityChart';

interface PostInsightsModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PostInsightsModal: React.FC<PostInsightsModalProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  const [insights, setInsights] = useState<PostInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && postId) {
      setLoading(true);
      postService
        .getPostInsights(postId)
        .then((data) => setInsights(data))
        .catch((err) => {
          console.error('Failed to fetch post insights:', err);
          setInsights(null);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, postId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Thông tin chi tiết về bài viết
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
                  Facebook Insights
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hiệu suất tiếp cận, số lượt xem và tương tác của người xem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Đang tổng hợp số liệu phân tích bài viết...
              </p>
            </div>
          ) : !insights ? (
            <div className="py-16 text-center text-gray-500 dark:text-gray-400 text-sm">
              Không thể tải thông tin chi tiết bài viết này.
            </div>
          ) : (
            <>
              {/* Snippet Card */}
              {insights.contentSnippet && (
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="line-clamp-2 italic">
                    "{insights.contentSnippet}"
                  </div>
                </div>
              )}

              {/* Main KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InsightKpiCard
                  label="Lượt xem"
                  value={insights.views}
                  icon={Eye}
                  colorTheme="blue"
                  subtext="Tổng số lần hiển thị"
                />
                <InsightKpiCard
                  label="Lượt tiếp cận"
                  value={insights.reach}
                  icon={Users}
                  colorTheme="purple"
                  subtext="Tài khoản duy nhất"
                />
                <InsightKpiCard
                  label="Tỷ lệ tương tác"
                  value={`${insights.engagementRate}%`}
                  icon={Percent}
                  colorTheme="emerald"
                  subtext="Tương tác / Lượt xem"
                />
                <InsightKpiCard
                  label="Lưu bài viết"
                  value={insights.saves}
                  icon={Bookmark}
                  colorTheme="amber"
                  subtext="Được người dùng lưu"
                />
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-gray-800 text-rose-500 shadow-2xs">
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Lượt thích</span>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {insights.likes}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-gray-800 text-blue-500 shadow-2xs">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Bình luận</span>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {insights.comments}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-gray-800 text-emerald-500 shadow-2xs">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">Chia sẻ</span>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {insights.shares}
                    </p>
                  </div>
                </div>
              </div>

              {/* Traffic Sources Breakdown */}
              <TrafficSourcesBreakdown sources={insights.trafficSources} />

              {/* Hourly Chart */}
              <HourlyActivityChart data={insights.hourlyViews} />

              {/* Creator Tip */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h5 className="font-bold text-amber-900 dark:text-amber-300">
                    Mẹo tối ưu hóa tương tác bài viết
                  </h5>
                  <p className="text-amber-800 dark:text-amber-400/90 leading-relaxed">
                    Bài viết đạt lưu lượng tương tác cao nhất từ Bảng tin người theo dõi. Đặt câu hỏi mở ở cuối bài hoặc gắn hashtag thịnh hành sẽ kích thích bình luận tăng thêm 35%.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
