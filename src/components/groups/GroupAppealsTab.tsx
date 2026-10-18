import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Gavel, Loader2, MessageSquareWarning, RotateCcw, ShieldAlert, X } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { postService } from '../../services/api';
import { fetchAuthorProfile } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { Skeleton } from '../common/Skeleton';
import { TimeAgo } from '../common/TimeAgo';
import { UserAvatar } from '../common/UserAvatar';
import { EmptyState, ErrorState, TabCard } from './groupTabUi';

const APPEAL_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Đang chờ xử lý', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  ACCEPTED: { label: 'Đã chấp nhận', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  REJECTED: { label: 'Đã bị bác bỏ', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

interface AppealItem {
  postId: string;
  authorId?: string;
  content?: string;
  reason?: string;
  appealMessage?: string;
  appealStatus?: string;
  reviewNote?: string;
  updatedAt?: string;
  createdAt?: string;
  authorName?: string;
  authorAvatar?: string;
}

/**
 * Kháng nghị bài bị gỡ khỏi nhóm.
 * - Thành viên: thấy bài của mình bị gỡ (kèm lý do) và gửi kháng nghị.
 * - Quản trị/kiểm duyệt viên: hàng đợi kháng nghị chờ xử lý, có thể kèm ghi chú khi chấp nhận/bác bỏ.
 */
export const GroupAppealsTab = ({ group }: { group: GroupResponse }) => {
  const toast = useToast();
  const canReview = Boolean(group.isAdmin || group.isModerator);
  const [items, setItems] = useState<AppealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState<AppealItem | null>(null);
  const [message, setMessage] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const current = ++seq.current;
    setLoading(true);
    setLoadError('');
    try {
      const raw: AppealItem[] = canReview ? await postService.getGroupAppeals(group.id) : await postService.getMyGroupAppeals(group.id);
      const list = await Promise.all(raw.map(async (item) => {
        if (!canReview || !item.authorId) return item;
        const author = await fetchAuthorProfile(String(item.authorId)).catch(() => null);
        return author ? { ...item, authorName: author.name, authorAvatar: author.avatar } : item;
      }));
      if (current === seq.current) setItems(list);
    } catch (err) {
      if (current !== seq.current) return;
      setItems([]);
      setLoadError(getApiErrorMessage(err, 'Không thể tải danh sách kháng nghị.'));
    } finally {
      if (current === seq.current) setLoading(false);
    }
  }, [group.id, canReview]);

  useEffect(() => { void load(); }, [load]);

  const submit = async () => {
    if (!selected || !message.trim() || busyId) return;
    setBusyId(selected.postId);
    try {
      await postService.appealGroupPost(selected.postId, message.trim());
      toast.showSuccess('Đã gửi kháng nghị, vui lòng chờ quản trị viên xem xét.');
      setSelected(null);
      setMessage('');
      await load();
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể gửi kháng nghị, vui lòng thử lại.'));
    } finally {
      setBusyId(null);
    }
  };

  const review = async (item: AppealItem, approved: boolean) => {
    if (busyId) return;
    setBusyId(item.postId);
    try {
      await postService.reviewGroupAppeal(item.postId, approved, notes[item.postId]?.trim() || undefined);
      toast.showSuccess(approved ? 'Đã chấp nhận kháng nghị và khôi phục bài viết.' : 'Đã bác bỏ kháng nghị.');
      setItems((list) => list.filter((i) => i.postId !== item.postId));
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể xử lý kháng nghị, vui lòng thử lại.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-4">
      <TabCard className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30">
            {canReview ? <Gavel className="h-5 w-5" /> : <MessageSquareWarning className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
              {canReview ? 'Kháng nghị chờ xử lý' : 'Bài viết bị gỡ khỏi nhóm'}
              {canReview && !loading && !loadError && items.length > 0 ? ` · ${items.length}` : ''}
            </h2>
            <p className="text-sm text-gray-500 dark:text-[#b0b3b8]">
              {canReview
                ? 'Xem lại các bài bị gỡ mà tác giả cho rằng không vi phạm nội quy.'
                : 'Nếu cho rằng bài viết của bạn không vi phạm nội quy, hãy gửi kháng nghị để quản trị viên xem lại.'}
            </p>
          </div>
        </div>
      </TabCard>

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1].map((i) => (
            <TabCard key={i} className="space-y-3 p-4">
              <Skeleton variant="text" width="30%" height="0.9rem" />
              <Skeleton variant="text" width="100%" height="2.5rem" />
              <Skeleton variant="text" width="60%" height="0.8rem" />
            </TabCard>
          ))}
        </div>
      ) : loadError ? (
        <TabCard><ErrorState message={loadError} onRetry={() => void load()} /></TabCard>
      ) : items.length === 0 ? (
        <TabCard>
          <EmptyState
            icon={<ShieldAlert className="h-7 w-7" />}
            title={canReview ? 'Không có kháng nghị nào đang chờ' : 'Bạn chưa có bài viết nào bị gỡ'}
            hint={canReview ? 'Khi tác giả kháng nghị việc gỡ bài, yêu cầu sẽ hiện ở đây.' : 'Những bài bị quản trị viên gỡ khỏi nhóm sẽ hiện ở đây kèm lý do.'}
          />
        </TabCard>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const busy = busyId === item.postId;
            const status = item.appealStatus ? APPEAL_STATUS[item.appealStatus] : undefined;
            return (
              <article key={item.postId} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-[#393a3b] dark:bg-[#242526]" data-appeal-post={item.postId}>
                {canReview && (
                  <div className="mb-3 flex items-center gap-3">
                    <UserAvatar src={item.authorAvatar} alt={item.authorName} size="md" className="h-10 w-10 rounded-full" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">{item.authorName || 'Thành viên'}</p>
                      {item.updatedAt && <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">Kháng nghị <TimeAgo iso={item.updatedAt} /></p>}
                    </div>
                  </div>
                )}
                {!canReview && (
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase text-gray-500 dark:text-[#b0b3b8]">Bài viết đã bị gỡ</span>
                    {status && <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status.className}`}>{status.label}</span>}
                  </div>
                )}

                <p className="whitespace-pre-wrap break-words rounded-xl bg-gray-100 p-3 text-sm text-gray-800 dark:bg-[#3a3b3c] dark:text-[#e4e6eb]">
                  {item.content || 'Bài viết không có nội dung chữ.'}
                </p>
                <p className="mt-3 text-sm text-red-600 dark:text-red-400"><b>Lý do gỡ:</b> {item.reason || 'Không nêu lý do'}</p>

                {canReview ? (
                  <>
                    <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm dark:bg-blue-900/20">
                      <p className="text-xs font-bold text-[#1877f2]">Lý do kháng nghị</p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-gray-900 dark:text-[#e4e6eb]">{item.appealMessage}</p>
                    </div>
                    <textarea
                      value={notes[item.postId] ?? ''}
                      onChange={(e) => setNotes((n) => ({ ...n, [item.postId]: e.target.value }))}
                      maxLength={500}
                      rows={2}
                      placeholder="Ghi chú gửi cho tác giả (không bắt buộc)"
                      className="mt-3 w-full resize-none rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] dark:border-[#4e4f50] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void review(item, true)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Chấp nhận và khôi phục
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void review(item, false)}
                        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-300 disabled:opacity-60 dark:bg-[#4e4f50] dark:text-[#e4e6eb] dark:hover:bg-[#5a5b5c] cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                        Bác bỏ
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {item.appealMessage && (
                      <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm dark:bg-blue-900/20">
                        <p className="text-xs font-bold text-[#1877f2]">Kháng nghị của bạn</p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-gray-900 dark:text-[#e4e6eb]">{item.appealMessage}</p>
                      </div>
                    )}
                    {item.reviewNote && <p className="mt-2 text-sm text-gray-700 dark:text-[#d0d2d6]"><b>Phản hồi của quản trị viên:</b> {item.reviewNote}</p>}
                    {!item.appealStatus && (
                      <button
                        type="button"
                        onClick={() => { setSelected(item); setMessage(''); }}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1877f2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#166fe5] cursor-pointer"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Gửi kháng nghị
                      </button>
                    )}
                  </>
                )}
              </article>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="appeal-title" onClick={() => { if (!busyId) setSelected(null); }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#242526]" onClick={(e) => e.stopPropagation()}>
            <h3 id="appeal-title" className="text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb]">Gửi kháng nghị</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Giải thích vì sao bài viết của bạn không vi phạm nội quy nhóm.</p>
            <textarea
              value={message}
              maxLength={1000}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nêu lý do kháng nghị..."
              autoFocus
              className="mt-3 w-full resize-none rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] dark:border-[#4e4f50] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]"
              rows={4}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{message.length}/1000</p>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" disabled={Boolean(busyId)} onClick={() => setSelected(null)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c] cursor-pointer">Hủy</button>
              <button
                type="button"
                disabled={!message.trim() || Boolean(busyId)}
                onClick={() => void submit()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1877f2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#166fe5] disabled:opacity-60 cursor-pointer"
              >
                {busyId && <Loader2 className="h-4 w-4 animate-spin" />}
                Gửi kháng nghị
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupAppealsTab;
