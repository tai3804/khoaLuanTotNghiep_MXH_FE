import React from 'react';
import { Archive, Loader2, Info } from 'lucide-react';
import { Post } from '../../../types';
import { ArchivedPostCard } from './ArchivedPostCard';
import { useLanguage } from '../../../context/LanguageContext';

interface ArchivedPostsListProps {
  posts: Post[];
  loading: boolean;
  restoringId: string | null;
  deletingId: string | null;
  onRestore: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export const ArchivedPostsList: React.FC<ArchivedPostsListProps> = ({
  posts,
  loading,
  restoringId,
  deletingId,
  onRestore,
  onDelete,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  if (loading) {
    return (
      <div className="flex-1 h-full min-h-[460px] flex flex-col items-center justify-center text-center text-gray-500 dark:text-[#b0b3b8]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1877f2] mb-3" />
        <p className="text-xs sm:text-sm font-medium">
          {isEn ? 'Loading archived posts...' : 'Đang tải bài viết trong kho lưu trữ...'}
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex-1 h-full min-h-[460px] flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-400 dark:text-[#b0b3b8] mb-5 shadow-sm border border-gray-200/60 dark:border-gray-700/60">
          <Archive className="w-10 h-10" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-[#e4e6eb] mb-2 tracking-tight">
          {isEn ? 'No archived posts yet' : 'Chưa có bài viết nào trong kho lưu trữ'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-[#b0b3b8] max-w-md leading-relaxed">
          {isEn
            ? 'When you archive posts from your profile timeline, they will appear here and remain completely private.'
            : 'Khi bạn lưu trữ bài viết từ dòng thời gian, bài viết sẽ được chuyển vào đây và chỉ có bạn mới có thể xem được.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-160px)]">
      {/* Informative banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/80 dark:bg-[#1877f2]/10 border border-blue-200/60 dark:border-[#1877f2]/20 text-xs text-blue-800 dark:text-blue-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#1877f2]" />
        <span>
          {isEn
            ? 'Archived posts are hidden from your profile timeline and friends. You can restore them anytime.'
            : 'Các bài viết trong kho lưu trữ sẽ ẩn khỏi dòng thời gian và bạn bè. Bạn có thể khôi phục về trang cá nhân bất cứ lúc nào.'}
        </span>
      </div>

      {/* Post cards */}
      <div className="space-y-3.5">
        {posts.map((post) => (
          <ArchivedPostCard
            key={post.id}
            post={post}
            onRestore={onRestore}
            onDelete={onDelete}
            isRestoring={restoringId === post.id}
            isDeleting={deletingId === post.id}
          />
        ))}
      </div>
    </div>
  );
};
