import React, { useState } from 'react';
import { Calendar, Clock, Send, Trash2, Loader2, Image, FileText } from 'lucide-react';
import { Post } from '../../../../types';

interface ScheduledPostItemProps {
  post: Post;
  onPublishNow: (postId: string) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
}

export const ScheduledPostItem: React.FC<ScheduledPostItemProps> = ({
  post,
  onPublishNow,
  onDelete,
}) => {
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatScheduledTime = (timeStr?: string) => {
    if (!timeStr) return 'Đang lên lịch';
    try {
      const date = new Date(timeStr);
      return date.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return timeStr;
    }
  };

  const calculateCountdown = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const target = new Date(timeStr).getTime();
      const now = Date.now();
      const diffMinutes = Math.floor((target - now) / 60000);
      if (diffMinutes <= 0) return 'Sắp được đăng';
      if (diffMinutes < 60) return `Còn ${diffMinutes} phút nữa`;
      const diffHours = Math.floor(diffMinutes / 60);
      const remainingMins = diffMinutes % 60;
      if (diffHours < 24) return `Còn ${diffHours}h ${remainingMins}p`;
      const diffDays = Math.floor(diffHours / 24);
      return `Còn ${diffDays} ngày nữa`;
    } catch {
      return '';
    }
  };

  const handlePublishNow = async () => {
    if (publishing) return;
    try {
      setPublishing(true);
      await onPublishNow(post.id);
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    if (!window.confirm('Bạn có chắc muốn hủy lịch đăng và xóa bài viết này không?')) return;
    try {
      setDeleting(true);
      await onDelete(post.id);
    } finally {
      setDeleting(false);
    }
  };

  const hasMedia = (post.mediaUrls && post.mediaUrls.length > 0) || (post.mediaList && post.mediaList.length > 0);
  const thumbnail = post.mediaUrls?.[0] || post.mediaList?.[0]?.fileUrl;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700/60 transition-all shadow-2xs">
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {hasMedia && thumbnail ? (
          <img
            src={thumbnail}
            alt="Thumbnail"
            className="w-16 h-16 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
            {post.content || 'Bài viết không có văn bản'}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-500/20">
              <Calendar className="w-3 h-3" />
              {formatScheduledTime(post.scheduledPublishAt)}
            </span>
            <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              {calculateCountdown(post.scheduledPublishAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={handlePublishNow}
          disabled={publishing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-xs shadow-blue-500/20"
          title="Xuất bản bài viết lên trang cá nhân ngay lập tức"
        >
          {publishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Đăng ngay</span>
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors disabled:opacity-50"
          title="Hủy lịch đăng"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
