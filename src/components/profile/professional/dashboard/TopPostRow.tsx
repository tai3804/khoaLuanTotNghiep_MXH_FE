import React from 'react';
import { Eye, Heart, MessageCircle, Share2, TrendingUp, FileText } from 'lucide-react';
import { TopPostMetric } from '../types';

interface TopPostRowProps {
  post: TopPostMetric;
  rank: number;
  onViewInsights?: (postId: string) => void;
}

export const TopPostRow: React.FC<TopPostRowProps> = ({ post, rank, onViewInsights }) => {
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-gray-50/70 dark:bg-neutral-800/40 hover:bg-gray-100/80 dark:hover:bg-neutral-800/80 transition border border-gray-100 dark:border-neutral-800/60 gap-3">
      {/* Left: Rank, Thumbnail & Content */}
      <div className="flex items-center gap-3.5 min-w-0">
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${
            rank === 1
              ? 'bg-amber-400 text-amber-950 shadow-xs'
              : rank === 2
              ? 'bg-gray-300 text-gray-800 shadow-xs'
              : rank === 3
              ? 'bg-amber-700/80 text-white shadow-xs'
              : 'text-gray-400 bg-gray-200/60 dark:bg-neutral-800'
          }`}
        >
          {rank}
        </span>

        {/* Thumbnail preview */}
        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-neutral-700 shrink-0 overflow-hidden flex items-center justify-center">
          {post.firstMediaUrl ? (
            <img
              src={post.firstMediaUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <FileText className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Post snippet */}
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate max-w-xs sm:max-w-md">
            {post.content || '(Bài viết dạng hình ảnh/video)'}
          </p>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400 dark:text-neutral-500">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold">
              <TrendingUp className="w-3 h-3" />
              {post.engagementRate}% tương tác
            </span>
          </div>
        </div>
      </div>

      {/* Right: Metrics stats */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 text-xs text-gray-600 dark:text-neutral-300 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200/60 dark:border-neutral-800">
        {/* Views */}
        <div className="flex items-center gap-1.5" title="Lượt xem bài viết">
          <Eye className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-bold text-gray-900 dark:text-[#e4e6eb]">
            {post.viewCount.toLocaleString('vi-VN')}
          </span>
        </div>

        {/* Likes */}
        <div className="flex items-center gap-1.5" title="Lượt thích">
          <Heart className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{post.likeCount.toLocaleString('vi-VN')}</span>
        </div>

        {/* Comments */}
        <div className="flex items-center gap-1.5" title="Lượt bình luận">
          <MessageCircle className="w-4 h-4 text-sky-500 shrink-0" />
          <span>{post.commentCount.toLocaleString('vi-VN')}</span>
        </div>

        {/* Shares */}
        <div className="flex items-center gap-1.5" title="Lượt chia sẻ">
          <Share2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{post.shareCount.toLocaleString('vi-VN')}</span>
        </div>

        {/* View Insights Action */}
        {onViewInsights && (
          <button
            onClick={() => onViewInsights(post.id)}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shrink-0"
            title="Xem chi tiết hiệu suất (Facebook Insights)"
          >
            Chi tiết
          </button>
        )}
      </div>
    </div>
  );
};
