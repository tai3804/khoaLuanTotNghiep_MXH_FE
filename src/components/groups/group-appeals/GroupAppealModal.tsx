import React, { useState } from 'react';
import { X, RotateCcw, Loader2 } from 'lucide-react';

interface GroupAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => Promise<void>;
}

export const GroupAppealModal: React.FC<GroupAppealModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || submitting) return;
    try {
      setSubmitting(true);
      await onSubmit(message.trim());
      setMessage('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#242526] p-6 shadow-2xl border border-gray-100 dark:border-[#393a3b] space-y-4"
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#393a3b] pb-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#1877f2]" />
            <h3 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">
              Gửi kháng nghị trong nhóm
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            Vui lòng giải thích lý do tại sao bài viết của bạn nên được giữ lại hoặc khôi phục.
          </p>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Nêu rõ lý do và bối cảnh kháng nghị..."
            className="w-full resize-none rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#1a1b1d] p-3 text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
          />

          <div className="flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!message.trim() || submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] px-4 py-2 text-xs font-bold text-white transition disabled:opacity-60 cursor-pointer shadow-sm"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{submitting ? 'Đang gửi...' : 'Gửi kháng nghị'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
