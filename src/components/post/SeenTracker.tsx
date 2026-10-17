import React from 'react';
import { useSeenOnView } from '../../utils/seenTracker';

/**
 * Bọc một bài trên bảng tin (trang chủ, Video): khi bài được xem đủ lâu thì ghi nhận "đã xem" để lần tải sau
 * máy chủ không đưa lại bài này (GET /posts?unseenOnly=true).
 */
export const SeenTracker: React.FC<{ postId: string; children: React.ReactNode }> = ({ postId, children }) => {
  const ref = useSeenOnView<HTMLDivElement>(postId);
  return <div ref={ref}>{children}</div>;
};
