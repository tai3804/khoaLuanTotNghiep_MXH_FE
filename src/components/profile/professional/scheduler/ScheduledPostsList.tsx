import React, { useEffect, useState } from 'react';
import { CalendarClock, Sparkles, Loader2, Plus } from 'lucide-react';
import { Post } from '../../../../types';
import { postService } from '../../../../services/postService';
import { ScheduledPostItem } from './ScheduledPostItem';

interface ScheduledPostsListProps {
  onOpenCreatePost?: () => void;
}

export const ScheduledPostsList: React.FC<ScheduledPostsListProps> = ({
  onOpenCreatePost,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      const res = await postService.getScheduledPosts();
      setPosts(res.content || []);
    } catch (err) {
      console.error('Failed to load scheduled posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const handlePublishNow = async (postId: string) => {
    try {
      await postService.publishPostNow(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Failed to publish scheduled post now:', err);
      alert('Không thể xuất bản bài viết ngay, vui lòng thử lại.');
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await postService.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete scheduled post:', err);
      alert('Không thể hủy bài viết lên lịch.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-blue-950/30 p-4 rounded-2xl border border-emerald-500/20 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 shadow-md shadow-emerald-500/20">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              Lập kế hoạch & Hẹn giờ đăng bài (Content Planner)
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                Meta Planner
              </span>
            </h4>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Chuẩn bị bài viết từ trước và hệ thống sẽ tự động xuất bản đúng khung giờ vàng giúp bạn tiết kiệm thời gian và duy trì tương tác ổn định.
            </p>
          </div>
        </div>

        {onOpenCreatePost && (
          <button
            onClick={onOpenCreatePost}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0 shadow-xs shadow-emerald-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lên lịch mới</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Đang tải danh sách bài viết đã lên lịch...
          </p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700/60 my-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mb-3 ring-8 ring-emerald-500/10">
            <CalendarClock className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Chưa có bài viết nào được lên lịch
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-4">
            Hãy soạn bài viết và chọn ngày giờ xuất bản trong công cụ tạo bài để lên kế hoạch xuất bản trước.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {posts.map((post) => (
            <ScheduledPostItem
              key={post.id}
              post={post}
              onPublishNow={handlePublishNow}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
