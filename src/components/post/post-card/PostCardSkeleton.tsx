import React from 'react';
import { Skeleton } from '../../common/Skeleton';

interface PostCardSkeletonProps {
  /** Có khối ảnh/video hay chỉ chữ; xen kẽ hai kiểu cho giống bảng tin thật. */
  withMedia?: boolean;
}

/** Khung chờ có đúng bố cục của một thẻ bài viết: đầu bài, vài dòng chữ, ảnh, thanh tương tác. */
export const PostCardSkeleton: React.FC<PostCardSkeletonProps> = ({ withMedia = true }) => (
  <div
    aria-hidden="true"
    className="bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#393a3b] shadow-sm mb-4 overflow-hidden"
  >
    <div className="flex items-center gap-3 p-4 pb-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="32%" height={12} />
        <Skeleton variant="text" width="20%" height={10} />
      </div>
    </div>
    <div className="px-4 pb-3 space-y-2">
      <Skeleton variant="text" width="96%" height={12} />
      <Skeleton variant="text" width="88%" height={12} />
      <Skeleton variant="text" width="54%" height={12} />
    </div>
    {withMedia && <Skeleton className="w-full !rounded-none aspect-[4/3]" />}
    <div className="flex items-center justify-between px-4 py-3">
      <Skeleton variant="text" width={72} height={12} />
      <Skeleton variant="text" width={96} height={12} />
    </div>
    <div className="grid grid-cols-3 gap-2 px-3 pb-3">
      <Skeleton height={32} />
      <Skeleton height={32} />
      <Skeleton height={32} />
    </div>
  </div>
);
