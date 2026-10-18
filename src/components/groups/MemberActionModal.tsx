import React, { useEffect, useState } from 'react';
import { AlertTriangle, Crown, Loader2, Undo2, UserMinus, UserX } from 'lucide-react';

export type MemberAction = 'remove' | 'ban' | 'unban' | 'transfer';

interface MemberActionModalProps {
  action: MemberAction | null;
  memberName: string;
  loading?: boolean;
  onClose: () => void;
  /** deleteContent chỉ có ý nghĩa với remove/ban. */
  onConfirm: (deleteContent: boolean) => void;
}

const COPY: Record<MemberAction, { title: string; confirm: string; danger: boolean; icon: React.ReactNode; message: (name: string) => string }> = {
  remove: {
    title: 'Xóa khỏi nhóm?',
    confirm: 'Xóa khỏi nhóm',
    danger: true,
    icon: <UserMinus className="h-6 w-6" />,
    message: (name) => `${name} sẽ bị xóa khỏi nhóm nhưng vẫn có thể xin tham gia lại sau.`,
  },
  ban: {
    title: 'Cấm khỏi nhóm?',
    confirm: 'Cấm khỏi nhóm',
    danger: true,
    icon: <UserX className="h-6 w-6" />,
    message: (name) => `${name} sẽ bị cấm, không thể tìm thấy hay tham gia lại nhóm cho đến khi bạn gỡ cấm.`,
  },
  unban: {
    title: 'Gỡ cấm thành viên?',
    confirm: 'Gỡ cấm',
    danger: false,
    icon: <Undo2 className="h-6 w-6" />,
    message: (name) => `${name} sẽ có thể xin tham gia lại nhóm.`,
  },
  transfer: {
    title: 'Chuyển quyền chủ nhóm?',
    confirm: 'Chuyển quyền',
    danger: false,
    icon: <Crown className="h-6 w-6" />,
    message: (name) => `${name} sẽ trở thành chủ nhóm mới và bạn chỉ còn là quản trị viên. Chỉ chủ nhóm mới có thể chuyển quyền lại.`,
  },
};

/** Hộp thoại xác nhận thao tác với thành viên; xóa/cấm có thêm tùy chọn "xóa luôn bài viết của họ". */
export const MemberActionModal: React.FC<MemberActionModalProps> = ({ action, memberName, loading = false, onClose, onConfirm }) => {
  const [deleteContent, setDeleteContent] = useState(false);

  useEffect(() => { setDeleteContent(false); }, [action, memberName]);

  useEffect(() => {
    if (!action) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !loading) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [action, loading, onClose]);

  if (!action) return null;
  const copy = COPY[action];
  const askContent = action === 'remove' || action === 'ban';

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-action-title"
      onClick={() => { if (!loading) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#242526]" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${copy.danger ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-blue-100 text-[#1877f2] dark:bg-blue-900/30'}`}>
            {copy.danger ? <AlertTriangle className="h-6 w-6" /> : copy.icon}
          </div>
          <h3 id="member-action-title" className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb]">{copy.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-[#b0b3b8]">{copy.message(memberName)}</p>
        </div>

        {askContent && (
          <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-gray-200 p-3 text-sm dark:border-[#4e4f50]">
            <input
              type="checkbox"
              checked={deleteContent}
              onChange={(e) => setDeleteContent(e.target.checked)}
              disabled={loading}
              className="mt-0.5 h-4 w-4 cursor-pointer accent-red-600"
            />
            <span className="font-semibold text-gray-900 dark:text-[#e4e6eb]">
              Xóa luôn các bài viết của họ trong nhóm
              <span className="mt-0.5 block text-xs font-normal text-gray-500 dark:text-[#b0b3b8]">Các bài này sẽ bị gỡ khỏi nhóm.</span>
            </span>
          </label>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-200 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onConfirm(askContent && deleteContent)}
            disabled={loading}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 cursor-pointer ${copy.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1877f2] hover:bg-[#166fe5]'}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
