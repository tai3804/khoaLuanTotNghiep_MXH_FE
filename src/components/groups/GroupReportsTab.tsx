import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Flag, Loader2, ShieldCheck, Trash2 } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { postService } from '../../services/api';
import type { GroupReportedPost } from '../../services/postService';
import { groupService } from '../../services/groupService';
import { PostCard } from '../post/post-card';
import { Skeleton } from '../common/Skeleton';
import { TimeAgo } from '../common/TimeAgo';
import { GroupRemovePostModal } from './GroupRemovePostModal';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';

interface Props {
  group: GroupResponse;
  onNavigateProfile?: (userId: string) => void;
}

/** Hàng đợi "Nội dung bị báo cáo" của quản trị viên: giữ lại hoặc gỡ từng bài viết bị thành viên báo cáo. */
export const GroupReportsTab: React.FC<Props> = ({ group, onNavigateProfile }) => {
  const toast = useToast();
  const [items, setItems] = useState<GroupReportedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toRemove, setToRemove] = useState<GroupReportedPost | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await postService.getGroupReports(group.id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể tải danh sách bài viết bị báo cáo.'));
    } finally {
      setLoading(false);
    }
  }, [group.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const dismiss = async (item: GroupReportedPost) => {
    setBusyId(item.post.id);
    try {
      await postService.resolveGroupReports(group.id, item.post.id, 'dismiss');
      setItems((current) => current.filter((i) => i.post.id !== item.post.id));
      toast.showSuccess('Đã giữ lại bài viết và đóng các báo cáo.');
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể xử lý báo cáo, vui lòng thử lại.'));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (reason: string, banAuthor: boolean) => {
    if (!toRemove) return;
    const target = toRemove;
    setBusyId(target.post.id);
    try {
      await postService.resolveGroupReports(group.id, target.post.id, 'remove', reason || undefined);
      setItems((current) => current.filter((i) => i.post.id !== target.post.id));
      setToRemove(null);
      if (banAuthor) {
        try {
          await groupService.removeMember(group.id, target.post.userId, true, true);
          toast.showSuccess('Đã gỡ bài viết và cấm tác giả khỏi nhóm.');
        } catch (err) {
          toast.showError(`Đã gỡ bài viết nhưng chưa cấm được tác giả: ${getApiErrorMessage(err, 'vui lòng thử lại.')}`);
        }
      } else {
        toast.showSuccess('Đã gỡ bài viết khỏi nhóm.');
      }
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể gỡ bài viết, vui lòng thử lại.'));
    } finally {
      setBusyId(null);
    }
  };

  const canBanAuthor = (item: GroupReportedPost | null) =>
    Boolean(item && item.post.userId !== group.ownerId);

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-4">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-[#393a3b] dark:bg-[#242526]">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-900/30"><Flag size={24} /></div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Nội dung bị báo cáo</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-[#b0b3b8]">
              Bài viết mà thành viên đã báo cáo cho quản trị viên. Hãy giữ lại nếu bài hợp lệ hoặc gỡ nếu vi phạm nội quy.
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div aria-busy="true" className="space-y-4">
          <Skeleton width="100%" height="140px" />
          <Skeleton width="100%" height="220px" />
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-[#242526]">
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          <button type="button" onClick={() => void load()} className="mt-3 rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white hover:bg-[#166fe5] cursor-pointer">
            Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-[#393a3b] dark:bg-[#242526]">
          <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
          <p className="font-semibold text-gray-800 dark:text-[#e4e6eb]">Không có bài viết nào bị báo cáo</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Khi thành viên báo cáo một bài viết, bài đó sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        items.map((item) => (
          <article key={item.post.id} className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm dark:border-red-900/40 dark:bg-[#242526]">
            <div className="border-b border-red-100 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-900/20">
              <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-red-700 dark:text-red-200">
                <Flag className="h-4 w-4" />
                {item.reportCount} báo cáo
                {item.reasons.map((r) => (
                  <span key={r.reason} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-red-700 shadow-sm dark:bg-[#3a3b3c] dark:text-red-200">
                    {r.reason}{r.count > 1 ? ` · ${r.count}` : ''}
                  </span>
                ))}
              </div>
              <ul className="mt-2 space-y-1">
                {item.reports.slice(0, 4).map((r) => (
                  <li key={r.reporterId} className="text-xs text-gray-700 dark:text-[#d0d2d6]">
                    <button type="button" onClick={() => onNavigateProfile?.(r.reporterId)} className="font-semibold hover:underline cursor-pointer">{r.reporterName}</button>
                    {r.detail ? `: “${r.detail}”` : ''}
                    <span className="ml-1 text-gray-500">· <TimeAgo iso={r.createdAt} /></span>
                  </li>
                ))}
                {item.reports.length > 4 && <li className="text-xs text-gray-500">và {item.reports.length - 4} báo cáo khác</li>}
              </ul>
            </div>
            <div className="p-3 pb-0">
              <PostCard post={item.post} onViewProfile={onNavigateProfile} />
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 px-4 py-3 dark:border-[#393a3b]">
              <button
                type="button"
                disabled={busyId === item.post.id}
                onClick={() => void dismiss(item)}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer"
              >
                {busyId === item.post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Giữ bài viết
              </button>
              <button
                type="button"
                disabled={busyId === item.post.id}
                onClick={() => setToRemove(item)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Gỡ bài viết
              </button>
            </div>
          </article>
        ))
      )}

      <GroupRemovePostModal
        post={toRemove?.post ?? null}
        loading={Boolean(toRemove && busyId === toRemove.post.id)}
        canBanAuthor={canBanAuthor(toRemove)}
        onClose={() => setToRemove(null)}
        onConfirm={(reason, banAuthor) => void remove(reason, banAuthor)}
      />
    </div>
  );
};
