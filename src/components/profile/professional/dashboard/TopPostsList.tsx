import React from 'react';
import { Award, ArrowRight } from 'lucide-react';
import { TopPostRow } from './TopPostRow';
import { TopPostMetric } from '../types';

interface TopPostsListProps {
  posts: TopPostMetric[];
  onViewInsights?: (postId: string) => void;
}

export const TopPostsList: React.FC<TopPostsListProps> = ({ posts = [], onViewInsights }) => {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#242526] border border-gray-100 dark:border-neutral-800 shadow-xs space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">
              Nội dung hiệu quả nhất
            </h4>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              Xếp hạng theo lượt xem (views) và mức độ gắn kết của người xem
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      {posts.length === 0 ? (
        <div className="py-8 text-center text-xs text-gray-400 dark:text-neutral-500">
          Chưa có bài viết nào được ghi nhận lượt xem.
        </div>
      ) : (
        <div className="space-y-2.5">
          {posts.map((post, idx) => (
            <TopPostRow
              key={post.id}
              post={post}
              rank={idx + 1}
              onViewInsights={onViewInsights}
            />
          ))}
        </div>
      )}
    </div>
  );
};
