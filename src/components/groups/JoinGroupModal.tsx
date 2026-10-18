import React, { useEffect, useState } from 'react';
import { FileText, Loader2, X } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';

interface JoinGroupModalProps {
  group: GroupResponse | null;
  loading?: boolean;
  onClose: () => void;
  /** Gửi yêu cầu kèm câu trả lời theo thứ tự câu hỏi của nhóm. */
  onSubmit: (answers: string[]) => void;
}

/** Hộp thoại xin vào nhóm riêng tư: trả lời câu hỏi của quản trị viên và đồng ý nội quy (như Facebook). */
export const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ group, loading = false, onClose, onSubmit }) => {
  const [answers, setAnswers] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    setAnswers((group?.membershipQuestions ?? []).map(() => ''));
    setAgreed(false);
  }, [group?.id]);

  useEffect(() => {
    if (!group) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [group, loading, onClose]);

  if (!group) return null;

  const questions = group.membershipQuestions;
  const hasRules = Boolean(group.rules?.trim());
  const allAnswered = answers.length === questions.length && answers.every((a) => a.trim().length > 0);
  const canSubmit = allAnswered && (!hasRules || agreed) && !loading;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-labelledby="join-group-title">
      <div className="flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#242526]">
        <div className="relative border-b border-gray-200 px-5 py-4 text-center dark:border-[#393a3b]">
          <h2 id="join-group-title" className="text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb]">
            Tham gia {group.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Đóng"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:text-[#b0b3b8] dark:hover:bg-[#4e4f50] cursor-pointer disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <p className="text-sm text-gray-600 dark:text-[#b0b3b8]">
            Quản trị viên của nhóm duyệt từng yêu cầu. Hãy trả lời các câu hỏi bên dưới để họ hiểu rõ hơn về bạn.
          </p>

          {questions.map((question, index) => (
            <label key={index} className="block">
              <span className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">{index + 1}. {question}</span>
              <textarea
                value={answers[index] ?? ''}
                onChange={(e) => setAnswers((prev) => prev.map((a, i) => (i === index ? e.target.value : a)))}
                rows={2}
                maxLength={300}
                placeholder="Viết câu trả lời của bạn..."
                className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] dark:border-[#4e4f50] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]"
              />
            </label>
          ))}

          {hasRules && (
            <div className="rounded-xl bg-gray-100 p-4 dark:bg-[#3a3b3c]">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
                <FileText className="h-4 w-4 text-[#1877f2]" />
                Nội quy của nhóm
              </div>
              <p className="max-h-40 overflow-y-auto whitespace-pre-line break-words text-sm leading-relaxed text-gray-700 dark:text-[#d0d2d6]">
                {group.rules}
              </p>
              <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer accent-[#1877f2]"
                />
                Tôi đồng ý tuân thủ nội quy của nhóm
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-[#393a3b]">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-60 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c] cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onSubmit(answers.map((a) => a.trim()))}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1877f2] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
};
