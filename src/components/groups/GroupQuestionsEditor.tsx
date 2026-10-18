import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export const MAX_QUESTIONS = 3;
export const MAX_QUESTION_LENGTH = 200;

interface GroupQuestionsEditorProps {
  questions: string[];
  onChange: (questions: string[]) => void;
  disabled?: boolean;
}

/** Soạn tối đa 3 câu hỏi dành cho người xin vào nhóm riêng tư. */
export const GroupQuestionsEditor: React.FC<GroupQuestionsEditorProps> = ({ questions, onChange, disabled = false }) => (
  <div className="space-y-2.5">
    {questions.map((question, index) => (
      <div key={index} className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={question}
            disabled={disabled}
            maxLength={MAX_QUESTION_LENGTH}
            onChange={(e) => onChange(questions.map((q, i) => (i === index ? e.target.value : q)))}
            placeholder={`Câu hỏi ${index + 1}, ví dụ: Bạn biết tới nhóm qua đâu?`}
            aria-label={`Câu hỏi tham gia ${index + 1}`}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-900 disabled:opacity-60 focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:border-[#393a3b] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]"
          />
          <p className={`mt-0.5 text-right text-[11px] ${question.length >= MAX_QUESTION_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
            {question.length}/{MAX_QUESTION_LENGTH}
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(questions.filter((_, i) => i !== index))}
          aria-label={`Xóa câu hỏi ${index + 1}`}
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    ))}
    {questions.length < MAX_QUESTIONS && (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange([...questions, ''])}
        className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3.5 py-2 text-sm font-bold text-gray-800 hover:bg-gray-200 disabled:opacity-50 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Thêm câu hỏi
      </button>
    )}
  </div>
);
