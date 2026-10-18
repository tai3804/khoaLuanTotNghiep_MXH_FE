import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { Post } from '../../types';

interface Props {
  post: Post | null;
  loading?: boolean;
  onClose: () => void;
  /** banAuthor: gỡ bài đồng thời cấm tác giả khỏi nhóm (kèm xóa mọi bài của họ trong nhóm). */
  onConfirm: (reason: string, banAuthor: boolean) => void;
  /** Mình có quyền cấm tác giả không (người kiểm duyệt không được cấm quản trị viên). */
  canBanAuthor?: boolean;
}

/** Hộp thoại gỡ bài khỏi nhóm (giống "Xóa bài viết" của quản trị viên nhóm trên Facebook). */
export const GroupRemovePostModal = ({ post, loading = false, onClose, onConfirm, canBanAuthor = true }: Props) => {
  const [reason, setReason] = useState('');
  const [banAuthor, setBanAuthor] = useState(false);

  useEffect(() => {
    setReason('');
    setBanAuthor(false);
  }, [post?.id]);

  useEffect(() => {
    if (!post) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [post, loading, onClose]);

  if (!post) return null;
  const authorName = post.authorName || 'thành viên';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-labelledby="remove-post-title">
      <div className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#242526]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2.5 text-red-600 dark:bg-red-900/30"><AlertTriangle size={22} /></div>
            <div>
              <h2 id="remove-post-title" className="text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb]">Xóa bài viết khỏi nhóm</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">{authorName} sẽ nhận thông báo kèm lý do và có thể gửi kháng nghị.</p>
            </div>
          </div>
          <button type="button" disabled={loading} onClick={onClose} aria-label="Đóng" className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-gray-100 p-4 text-sm text-gray-700 dark:bg-[#3a3b3c] dark:text-[#e4e6eb]">
          <p className="mb-1 text-xs font-bold uppercase text-gray-500 dark:text-[#b0b3b8]">Bài viết của {authorName}</p>
          <p className="line-clamp-3 whitespace-pre-wrap break-words">{post.content || 'Bài viết không có nội dung chữ.'}</p>
        </div>

        <label className="mt-5 block text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
          Lý do gỡ bài <span className="font-normal text-gray-500">(không bắt buộc)</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Ví dụ: Nội dung không phù hợp với nội quy nhóm..."
            className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] dark:border-[#65676b] dark:bg-[#3a3b3c]"
          />
        </label>

        {canBanAuthor && (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-gray-200 p-3 text-sm dark:border-[#4e4f50]">
            <input
              type="checkbox"
              checked={banAuthor}
              onChange={(e) => setBanAuthor(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-red-600"
            />
            <span>
              <span className="font-bold text-gray-900 dark:text-[#e4e6eb]">Cấm {authorName} khỏi nhóm</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-[#b0b3b8]">
                Họ không thể vào lại nhóm và mọi bài viết của họ trong nhóm cũng bị gỡ.
              </span>
            </span>
          </label>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={loading} onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-60 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c] cursor-pointer">
            Hủy
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm(reason.trim(), banAuthor)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {loading ? 'Đang gỡ...' : banAuthor ? 'Gỡ bài và cấm' : 'Gỡ bài viết'}
          </button>
        </div>
      </div>
    </div>
  );
};
