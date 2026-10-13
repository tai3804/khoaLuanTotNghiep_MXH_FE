import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, X, Loader2, AlertCircle } from 'lucide-react';

interface SupportInboxAppealModalProps {
  reportId: string | null;
  onClose: () => void;
  onSubmit: (reportId: string, message: string) => Promise<void>;
}

export const SupportInboxAppealModal: React.FC<SupportInboxAppealModalProps> = ({
  reportId,
  onClose,
  onSubmit,
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reportId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(reportId, message.trim());
      setMessage('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#393a3b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1877f2] dark:text-[#4599ff] flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-[#e4e6eb] text-base">
                Yêu cầu xem xét lại (Appeal)
              </h3>
              <p className="text-[11px] text-gray-400">Mã báo cáo: {reportId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational tip */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#1877f2] mt-0.5" />
          <p className="leading-relaxed">
            Nếu bạn cho rằng quyết định xử lý đối với báo cáo này chưa thỏa đáng hoặc cần cung cấp thêm bằng chứng, vui lòng nêu rõ lý do dưới đây. Ban quản trị sẽ tiến hành đánh giá lại độc lập.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
              Lý do bạn yêu cầu xem xét lại <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Giải thích chi tiết lý do hoặc bằng chứng bổ sung của bạn…"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#18191a] text-xs text-gray-900 dark:text-[#e4e6eb] focus:outline-hidden focus:ring-2 focus:ring-[#1877f2]/30 focus:border-[#1877f2] transition-all resize-none placeholder-gray-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#393a3b]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#1877f2] hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                'Gửi yêu cầu'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
