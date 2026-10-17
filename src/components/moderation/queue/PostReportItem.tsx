import React from 'react';
import {
  AlertTriangle,
  Sparkles,
  Trash2,
  EyeOff,
  Check,
  Gavel,
  FileWarning,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { ModerationReport, ModerationAction } from '../../../services/moderationService';
import { Post } from '../../../types';
import {
  reasonConfig,
  aiCategoryLabels,
} from '../moderationConstants';

export interface PostReportItemProps {
  report: ModerationReport;
  post: Post | null | undefined;
  isLoadingPost: boolean;
  isProcessing: boolean;
  onSelect: (report: ModerationReport) => void;
  onProcess: (report: ModerationReport, action: ModerationAction, note?: string) => void;
}

export const PostReportItem: React.FC<PostReportItemProps> = ({
  report,
  post,
  isLoadingPost,
  isProcessing,
  onSelect,
  onProcess,
}) => {
  const rConf = reasonConfig[report.reason] || reasonConfig.OTHER;
  const isAi = report.source === 'AI' || report.status === 'REVIEWING';
  const percent = report.aiScore != null ? Math.round(report.aiScore * 100) : null;
  const aiCategory = report.aiCategory
    ? aiCategoryLabels[report.aiCategory.toUpperCase()] || report.aiCategory
    : null;

  return (
    <div className="group relative rounded-2xl border border-gray-200/80 dark:border-[#333538] bg-white dark:bg-[#242526] p-3.5 sm:p-4 shadow-2xs hover:border-gray-300 dark:hover:border-[#43464a] transition-all">
      {/* Header: Author on Left, Single Primary Violation Badge on Right */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 dark:border-[#2e3033] pb-2.5">
        {/* Left: Author Info & Time */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isLoadingPost ? (
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-[#343538] animate-pulse shrink-0" />
          ) : post?.authorAvatar ? (
            <img
              src={post.authorAvatar}
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700 shrink-0"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shrink-0">
              {post?.authorName?.[0] || 'U'}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#e4e6eb] truncate max-w-[180px] sm:max-w-[240px]">
                {isLoadingPost ? 'Đang tải...' : post?.authorName || 'Người dùng'}
              </span>

              {post?.isArchived && (
                <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  Đang ẩn
                </span>
              )}
            </div>

            <div className="text-[11px] text-gray-400 dark:text-[#9a9da3]">
              {new Date(report.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              • {new Date(report.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
        </div>

        {/* Right: Exactly ONE Clean Badge */}
        <div className="shrink-0">
          {isAi ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:text-purple-300">
              <Sparkles className="h-3 w-3 text-purple-500 shrink-0" />
              <span>AI: {aiCategory || rConf.label}</span>
              {percent !== null && (
                <span className="rounded bg-purple-200/70 dark:bg-purple-900/70 px-1 py-0.2 text-[10px] font-black">
                  {percent}%
                </span>
              )}
            </span>
          ) : (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${rConf.border} ${rConf.bgLight} ${rConf.bgDark} ${rConf.color}`}
            >
              <AlertTriangle className="h-3 w-3 shrink-0" />
              <span>{rConf.label}</span>
            </span>
          )}
        </div>
      </div>

      {/* Body: Direct Post Content */}
      <div className="py-2.5 space-y-2">
        {isLoadingPost ? (
          <div className="flex items-center gap-2 py-1 text-xs text-gray-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            <span>Đang tải nội dung bài viết...</span>
          </div>
        ) : post ? (
          <>
            <p className="text-xs sm:text-sm leading-relaxed text-gray-900 dark:text-[#e4e6eb] font-normal whitespace-pre-wrap break-words line-clamp-3">
              {post.content || <span className="italic text-gray-400 text-xs">Bài viết không có nội dung chữ.</span>}
            </p>

            {/* Media thumbnail preview if any */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {post.mediaUrls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group/img relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 shrink-0"
                  >
                    <img
                      src={url}
                      alt="media"
                      className="h-full w-full rounded-lg object-cover transition group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover/img:opacity-100">
                      <ExternalLink className="h-3.5 w-3.5 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 rounded-xl bg-gray-50/80 dark:bg-[#1a1b1d] px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-[#2f3033]">
            <FileWarning className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>Bài viết không còn khả dụng hoặc đã bị gỡ</span>
          </div>
        )}

        {/* User custom description note if non-AI */}
        {!isAi && report.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Ghi chú từ người báo cáo: "{report.description}"
          </p>
        )}
      </div>

      {/* Footer: Compact Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-[#2e3033] pt-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => onProcess(report, 'DELETE_POST', 'Gỡ bỏ bài viết vi phạm tiêu chuẩn cộng đồng')}
            disabled={isProcessing}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-200/70 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-95 disabled:opacity-50 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/50 cursor-pointer"
            title="Gỡ vĩnh viễn bài viết"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Gỡ bài</span>
          </button>

          <button
            type="button"
            onClick={() => onProcess(report, 'HIDE_POST', post?.isArchived ? 'Bỏ ẩn bài viết' : 'Ẩn bài viết khỏi bảng tin')}
            disabled={isProcessing}
            className="inline-flex items-center gap-1 rounded-lg border border-amber-200/70 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-95 disabled:opacity-50 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/50 cursor-pointer"
            title={post?.isArchived ? 'Bỏ ẩn bài viết' : 'Ẩn bài viết'}
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span>{post?.isArchived ? 'Bỏ ẩn' : 'Ẩn bài'}</span>
          </button>

          <button
            type="button"
            onClick={() => onProcess(report, 'DISMISS', 'Nội dung hợp lệ, bỏ qua báo cáo')}
            disabled={isProcessing}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200/70 bg-gray-50 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 active:scale-95 disabled:opacity-50 dark:border-[#3a3b3e] dark:bg-[#2b2c2f] dark:text-gray-300 dark:hover:bg-[#343538] cursor-pointer"
            title="Bỏ qua báo cáo"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Bỏ qua</span>
          </button>
        </div>

        {/* Right Action: Clean 'Chi tiết' button */}
        <button
          type="button"
          onClick={() => onSelect(report)}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200/70 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 active:scale-95 disabled:opacity-50 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-900/50 cursor-pointer"
        >
          <Gavel className="h-3.5 w-3.5" />
          <span>Chi tiết</span>
        </button>
      </div>
    </div>
  );
};
