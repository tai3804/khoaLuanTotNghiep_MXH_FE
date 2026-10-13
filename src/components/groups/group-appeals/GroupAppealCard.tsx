import React from 'react';
import { Check, X, RotateCcw, AlertCircle } from 'lucide-react';

interface AppealItem {
  postId: string;
  content?: string;
  reason?: string;
  appealMessage?: string;
  appealStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

interface GroupAppealCardProps {
  item: AppealItem;
  canReview: boolean;
  onReview: (postId: string, approved: boolean) => void;
  onOpenAppealModal: (item: AppealItem) => void;
}

export const GroupAppealCard: React.FC<GroupAppealCardProps> = ({
  item,
  canReview,
  onReview,
  onOpenAppealModal,
}) => {
  return (
    <article className="rounded-2xl bg-white dark:bg-[#242526] p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-[#393a3b] space-y-3">
      <div className="flex items-center justify-between">
        <b className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
          {canReview ? 'Bài viết cần xem xét kháng nghị' : 'Bài viết đã bị gỡ'}
        </b>
        {item.appealStatus && (
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              item.appealStatus === 'PENDING'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                : item.appealStatus === 'ACCEPTED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {item.appealStatus === 'PENDING'
              ? 'Đang chờ xử lý'
              : item.appealStatus === 'ACCEPTED'
              ? 'Đã chấp nhận'
              : 'Đã bác bỏ'}
          </span>
        )}
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-[#1a1b1d] p-3 text-sm text-gray-800 dark:text-[#e4e6eb] border border-gray-100 dark:border-[#393a3b]">
        <p className="whitespace-pre-wrap leading-relaxed">
          {item.content || 'Bài viết không có nội dung chữ.'}
        </p>
      </div>

      {item.reason && (
        <div className="flex items-start gap-2 text-xs sm:text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Lý do gỡ: <strong>{item.reason}</strong></span>
        </div>
      )}

      {canReview ? (
        <>
          {item.appealMessage && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 p-3 text-xs sm:text-sm">
              <b className="text-[#1877f2] dark:text-blue-300">Lý do kháng nghị từ tác giả:</b>
              <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {item.appealMessage}
              </p>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 pt-1">
            <button
              onClick={() => onReview(item.postId, true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              Chấp nhận & Khôi phục
            </button>
            <button
              onClick={() => onReview(item.postId, false)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm"
            >
              <X className="w-4 h-4" />
              Bác bỏ
            </button>
          </div>
        </>
      ) : (
        !item.appealStatus && (
          <div className="pt-1">
            <button
              onClick={() => onOpenAppealModal(item)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] px-3.5 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Gửi kháng nghị
            </button>
          </div>
        )
      )}
    </article>
  );
};
