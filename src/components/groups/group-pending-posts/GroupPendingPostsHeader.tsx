import React from 'react';
import { Clock3 } from 'lucide-react';

interface GroupPendingPostsHeaderProps {
  count: number;
}

export const GroupPendingPostsHeader: React.FC<GroupPendingPostsHeaderProps> = ({ count }) => {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-700/40 dark:bg-amber-900/10 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-800/30 text-amber-600 dark:text-amber-400">
          <Clock3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-extrabold text-gray-900 dark:text-[#e4e6eb] text-base sm:text-lg">
            Bài viết chờ duyệt
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            Các bài viết cần quản trị viên hoặc người kiểm duyệt phê duyệt trước khi hiển thị cho mọi người.
          </p>
        </div>
      </div>
      {count > 0 && (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900 dark:bg-amber-800 dark:text-amber-200">
          {count} bài chờ
        </span>
      )}
    </div>
  );
};
