import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PollResultBarProps } from './types';

export const PollResultBar: React.FC<PollResultBarProps> = ({ option }) => {
  const isVotedByMe = Boolean(option.votedByCurrentUser);
  const percentage = option.votePercentage || 0;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all p-3 ${
        isVotedByMe
          ? 'border-blue-500/60 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
          : 'border-gray-200 dark:border-[#383a3d] bg-white dark:bg-[#28292b]'
      }`}
    >
      {/* Visual Progress Fill */}
      <div
        className={`absolute left-0 top-0 bottom-0 transition-all duration-500 rounded-xl ${
          isVotedByMe
            ? 'bg-blue-500/15 dark:bg-blue-500/25'
            : 'bg-gray-200/50 dark:bg-gray-700/30'
        }`}
        style={{ width: `${percentage}%` }}
      />

      <div className="relative flex items-center justify-between z-10 text-xs">
        <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-200 pr-2">
          {isVotedByMe && (
            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <span className={isVotedByMe ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}>
            {option.text}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-gray-600 dark:text-gray-300">
          <span className="font-bold">{percentage}%</span>
          <span className="text-[11px] text-gray-400">({option.voteCount})</span>
        </div>
      </div>
    </div>
  );
};
