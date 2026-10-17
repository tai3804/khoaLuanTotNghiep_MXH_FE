import React from 'react';
import { BarChart2, Plus, Trash2, X, CheckSquare, Square } from 'lucide-react';

export interface PollDraft {
  question: string;
  options: string[];
  multipleChoice: boolean;
}

interface CreatePollFormProps {
  pollDraft: PollDraft;
  onChange: (draft: PollDraft) => void;
  onRemove: () => void;
}

export const CreatePollForm: React.FC<CreatePollFormProps> = ({ pollDraft, onChange, onRemove }) => {
  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...pollDraft, question: e.target.value });
  };

  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...pollDraft.options];
    updatedOptions[index] = value;
    onChange({ ...pollDraft, options: updatedOptions });
  };

  const handleAddOption = () => {
    if (pollDraft.options.length < 10) {
      onChange({ ...pollDraft, options: [...pollDraft.options, ''] });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (pollDraft.options.length > 2) {
      const updatedOptions = pollDraft.options.filter((_, i) => i !== index);
      onChange({ ...pollDraft, options: updatedOptions });
    }
  };

  const toggleMultipleChoice = () => {
    onChange({ ...pollDraft, multipleChoice: !pollDraft.multipleChoice });
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-[#1a1b1c] rounded-2xl border border-blue-200 dark:border-blue-900/40 space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold text-xs">
          <BarChart2 className="w-4 h-4" />
          <span>Tạo cuộc bình chọn / thăm dò ý kiến</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 rounded-full transition cursor-pointer"
          title="Hủy bình chọn"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Poll Question */}
      <input
        type="text"
        value={pollDraft.question}
        onChange={handleQuestionChange}
        placeholder="Đặt câu hỏi thăm dò ý kiến..."
        className="w-full px-3 py-2 text-xs bg-white dark:bg-[#28292b] border border-gray-300 dark:border-[#3a3b3c] rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
      />

      {/* Poll Options List */}
      <div className="space-y-2">
        {pollDraft.options.map((opt, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-gray-400 w-4 text-center">{idx + 1}</span>
            <input
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              placeholder={`Lựa chọn ${idx + 1}`}
              className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-[#28292b] border border-gray-300 dark:border-[#3a3b3c] rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
            />
            {pollDraft.options.length > 2 && (
              <button
                type="button"
                onClick={() => handleRemoveOption(idx)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition cursor-pointer"
                title="Xóa lựa chọn"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add option button & Multiple choice checkbox */}
      <div className="flex items-center justify-between pt-1 text-xs">
        {pollDraft.options.length < 10 ? (
          <button
            type="button"
            onClick={handleAddOption}
            className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm lựa chọn</span>
          </button>
        ) : (
          <span className="text-[11px] text-gray-400">Tối đa 10 lựa chọn</span>
        )}

        <button
          type="button"
          onClick={toggleMultipleChoice}
          className="flex items-center space-x-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition cursor-pointer select-none"
        >
          {pollDraft.multipleChoice ? (
            <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Square className="w-4 h-4 text-gray-400" />
          )}
          <span>Cho phép chọn nhiều</span>
        </button>
      </div>
    </div>
  );
};
