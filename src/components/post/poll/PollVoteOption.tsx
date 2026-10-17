import React from 'react';
import { Circle, CheckSquare, Square } from 'lucide-react';
import { PollVoteOptionProps } from './types';

export const PollVoteOption: React.FC<PollVoteOptionProps> = ({
  option,
  isSelected,
  multipleChoice,
  disabled,
  onToggle,
}) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(option.id)}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
        isSelected
          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-medium'
          : 'border-gray-200 dark:border-[#383a3d] bg-white dark:bg-[#28292b] text-gray-800 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {multipleChoice ? (
        isSelected ? (
          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        ) : (
          <Square className="w-4 h-4 text-gray-400 shrink-0" />
        )
      ) : isSelected ? (
        <div className="w-4 h-4 rounded-full border-2 border-blue-600 dark:border-blue-400 flex items-center justify-center shrink-0">
          <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
        </div>
      ) : (
        <Circle className="w-4 h-4 text-gray-400 shrink-0" />
      )}

      <span className="flex-1">{option.text}</span>
    </button>
  );
};
