import React from 'react';
import { BarChart3, Clock, RotateCcw } from 'lucide-react';
import { PollHeaderProps } from './types';

export const PollHeader: React.FC<PollHeaderProps> = ({
  question,
  totalVotes,
  multipleChoice,
  isClosed,
  closedAt,
  canChangeVote,
  onChangeVoteClick,
}) => {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
          <BarChart3 className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {question}
          </h4>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">
            <span>{totalVotes || 0} lượt bình chọn</span>
            {multipleChoice && <span>• Chọn nhiều phương án</span>}
            {isClosed ? (
              <span className="text-red-500 font-medium">• Đã kết thúc</span>
            ) : closedAt ? (
              <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3" />
                Hết hạn {new Date(closedAt).toLocaleDateString('vi-VN')}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">• Đang diễn ra</span>
            )}
          </div>
        </div>
      </div>

      {canChangeVote && (
        <button
          type="button"
          onClick={onChangeVoteClick}
          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          title="Đổi phương án bình chọn"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Đổi</span>
        </button>
      )}
    </div>
  );
};
