import React, { useEffect, useState } from 'react';
import { Flag, Loader2, X } from 'lucide-react';
import { Post } from '../../types';

/** Các lý do báo cáo gửi tới quản trị viên nhóm (khác "Báo cáo bài viết" gửi tới quản trị hệ thống). */
export const GROUP_REPORT_REASONS = [
  'Spam hoặc quảng cáo',
  'Quấy rối hoặc bắt nạt',
  'Ngôn từ gây thù ghét',
  'Nội dung nhạy cảm hoặc bạo lực',
  'Thông tin sai lệch',
  'Vi phạm nội quy của nhóm',
  'Lý do khác',
] as const;

interface Props {
  post: Post | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (reason: string, detail: string) => void;
}

/** Hộp thoại "Báo cáo cho quản trị viên nhóm" (giống Facebook): chọn lý do và mô tả thêm nếu muốn. */
export const GroupReportPostModal: React.FC<Props> = ({ post, loading = false, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    setReason('');
    setDetail('');
  }, [post?.id]);

  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [post, loading, onClose]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-labelledby="group-report-title">
      <div className="flex max-h-[92vh] w-full max-w-[500px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#242526]">
        <div className="relative border-b border-gray-200 px-5 py-4 text-center dark:border-[#393a3b]">
          <h2 id="group-report-title" className="text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb]">Báo cáo cho quản trị viên nhóm</h2>
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

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <p className="text-sm text-gray-600 dark:text-[#b0b3b8]">
            Chỉ quản trị viên và người kiểm duyệt của nhóm nhìn thấy báo cáo này. Người đăng bài sẽ không biết bạn đã báo cáo.
          </p>
          <fieldset className="space-y-1">
            <legend className="mb-2 text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">Vấn đề của bài viết là gì?</legend>
            {GROUP_REPORT_REASONS.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  reason === option
                    ? 'bg-blue-50 text-[#1877f2] dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-800 hover:bg-gray-100 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c]'
                }`}
              >
                <input
                  type="radio"
                  name="group-report-reason"
                  checked={reason === option}
                  onChange={() => setReason(option)}
                  className="h-4 w-4 cursor-pointer accent-[#1877f2]"
                />
                {option}
              </label>
            ))}
          </fieldset>
          <label className="block text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
            Mô tả thêm <span className="font-normal text-gray-500">(không bắt buộc)</span>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Giúp quản trị viên hiểu rõ hơn vấn đề..."
              className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white p-3 text-sm font-normal text-gray-900 outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] dark:border-[#4e4f50] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4 dark:border-[#393a3b]">
          <button type="button" onClick={onClose} disabled={loading} className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-60 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c] cursor-pointer">
            Hủy
          </button>
          <button
            type="button"
            disabled={!reason || loading}
            onClick={() => onSubmit(reason, detail.trim())}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1877f2] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
            Gửi báo cáo
          </button>
        </div>
      </div>
    </div>
  );
};
