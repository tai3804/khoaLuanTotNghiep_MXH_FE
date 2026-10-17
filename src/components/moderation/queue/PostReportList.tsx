import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ModerationReport, ModerationAction } from '../../../services/moderationService';
import { Post } from '../../../types';
import { PostReportItem } from './PostReportItem';

export interface PostReportListProps {
  reports: ModerationReport[];
  postsMap: Record<string, Post | null>;
  loadingPostsMap: Record<string, boolean>;
  processingId: string | null;
  onSelect: (report: ModerationReport) => void;
  onProcess: (report: ModerationReport, action: ModerationAction, note?: string) => void;
  empty: string;
}

export const PostReportList: React.FC<PostReportListProps> = ({
  reports,
  postsMap,
  loadingPostsMap,
  processingId,
  onSelect,
  onProcess,
  empty,
}) => {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200/80 bg-white/70 py-16 text-center shadow-xs backdrop-blur-md dark:border-[#2f3032] dark:bg-[#1a1b1d]/80">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-inner dark:bg-emerald-950/40">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Không có bài viết nào</h3>
        <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">{empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {reports.map((report) => (
        <PostReportItem
          key={report.reportId}
          report={report}
          post={postsMap[report.targetId]}
          isLoadingPost={Boolean(loadingPostsMap[report.targetId])}
          isProcessing={processingId === report.reportId}
          onSelect={onSelect}
          onProcess={onProcess}
        />
      ))}
    </div>
  );
};
