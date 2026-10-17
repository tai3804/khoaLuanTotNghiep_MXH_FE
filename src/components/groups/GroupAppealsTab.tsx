import { useCallback, useEffect, useState } from 'react';
import { Check, Loader2, RotateCcw, X } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { postService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';

const APPEAL_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Đang chờ xử lý',
  ACCEPTED: 'Đã chấp nhận',
  REJECTED: 'Đã bác bỏ',
};

export const GroupAppealsTab = ({ group }: { group: GroupResponse }) => {
  const toast = useToast();
  const canReview = Boolean(group.isAdmin || group.isModerator);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      setItems(canReview ? await postService.getGroupAppeals(group.id) : await postService.getMyGroupAppeals(group.id));
    } catch (err) {
      setItems([]);
      setLoadError(getApiErrorMessage(err, 'Không thể tải danh sách kháng nghị.'));
    } finally {
      setLoading(false);
    }
  }, [group.id, canReview]);

  useEffect(() => { void load(); }, [load]);

  const submit = async () => {
    if (!selected || !message.trim() || busy) return;
    try {
      setBusy(true);
      await postService.appealGroupPost(selected.postId, message.trim());
      toast.showSuccess('Đã gửi kháng nghị, vui lòng chờ quản trị viên xem xét.');
      setSelected(null);
      setMessage('');
      await load();
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể gửi kháng nghị, vui lòng thử lại.'));
    } finally {
      setBusy(false);
    }
  };

  const review = async (id: string, approved: boolean) => {
    if (busy) return;
    try {
      setBusy(true);
      await postService.reviewGroupAppeal(id, approved);
      toast.showSuccess(approved ? 'Đã chấp nhận kháng nghị và khôi phục bài viết.' : 'Đã bác bỏ kháng nghị.');
      await load();
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể xử lý kháng nghị, vui lòng thử lại.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-[760px]">
      <div className="mb-4 rounded-2xl bg-white p-5 shadow dark:bg-[#242526]">
        <h2 className="text-xl font-extrabold">{canReview ? 'Kháng nghị chờ xử lý' : 'Kháng nghị bài viết trong nhóm'}</h2>
      </div>

      {loading ? (
        <Loader2 className="mx-auto mt-10 animate-spin text-[#1877f2]" />
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow dark:border-red-900/50 dark:bg-[#242526]">
          <p className="text-sm text-red-600 dark:text-red-300">{loadError}</p>
          <button type="button" onClick={() => void load()} className="mt-3 rounded-xl bg-[#1877f2] px-4 py-2 text-sm font-bold text-white cursor-pointer">Thử lại</button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow dark:bg-[#242526]">
          {canReview ? 'Không có kháng nghị đang chờ.' : 'Bạn chưa có bài viết bị gỡ trong nhóm.'}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.postId} className="rounded-2xl bg-white p-5 shadow dark:bg-[#242526]">
              <b>{canReview ? 'Bài viết cần xem xét' : 'Bài viết đã bị gỡ'}</b>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm">{item.content || 'Bài viết không có nội dung chữ.'}</p>
              <p className="mt-3 text-sm text-red-500">Lý do gỡ: {item.reason || 'Không nêu lý do'}</p>
              {canReview ? (
                <>
                  <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm dark:bg-blue-900/20">
                    <b>Lý do kháng nghị:</b>
                    <p className="mt-1 whitespace-pre-wrap break-words">{item.appealMessage}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" disabled={busy} onClick={() => void review(item.postId, true)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60 cursor-pointer"><Check size={16} />Chấp nhận & khôi phục</button>
                    <button type="button" disabled={busy} onClick={() => void review(item.postId, false)} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-60 cursor-pointer"><X size={16} />Bác bỏ</button>
                  </div>
                </>
              ) : item.appealStatus ? (
                <p className="mt-3 text-sm font-bold text-amber-600">{APPEAL_STATUS_LABEL[item.appealStatus] || item.appealStatus}</p>
              ) : (
                <button type="button" onClick={() => { setSelected(item); setMessage(''); }} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1877f2] px-3 py-2 text-sm font-bold text-white cursor-pointer"><RotateCcw size={16} />Kháng nghị</button>
              )}
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 dark:bg-[#242526]">
            <h3 className="font-extrabold">Gửi kháng nghị trong nhóm</h3>
            <textarea
              value={message}
              maxLength={1000}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nêu lý do kháng nghị..."
              className="mt-3 w-full rounded-xl border p-3 dark:border-[#4e4f50] dark:bg-[#3a3b3c] focus:outline-none focus:border-[#1877f2]"
              rows={4}
            />
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" disabled={busy} onClick={() => setSelected(null)} className="px-3 py-2 font-bold cursor-pointer">Hủy</button>
              <button type="button" disabled={!message.trim() || busy} onClick={() => void submit()} className="rounded-lg bg-[#1877f2] px-3 py-2 font-bold text-white disabled:opacity-60 cursor-pointer">
                {busy ? 'Đang gửi...' : 'Gửi kháng nghị'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
