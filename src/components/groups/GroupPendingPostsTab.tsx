import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CheckCheck, ClipboardCheck, Clock3, Globe, Loader2, X } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { postService } from '../../services/api';
import { fetchAuthorProfile } from '../../services/userService';
import { Post } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { TimeAgo } from '../common/TimeAgo';
import { Skeleton } from '../common/Skeleton';
import { ConfirmModal } from '../common/ConfirmModal';
import { PostMediaGallery } from '../post/post-card/PostMediaGallery';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { EmptyState, ErrorState, TabCard } from './groupTabUi';

/** Hàng đợi duyệt bài: quản trị/kiểm duyệt viên xem trước từng bài rồi Duyệt hoặc Từ chối (giống "Bài viết đang chờ" của Facebook). */
export const GroupPendingPostsTab = ({ group }: { group: GroupResponse }) => {
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [approveAllOpen, setApproveAllOpen] = useState(false);
  const [approvingAll, setApprovingAll] = useState(false);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const current = ++seq.current;
    setLoading(true);
    setError('');
    try {
      const pending = await postService.getPendingGroupPosts(group.id);
      const withAuthors = await Promise.all(pending.map(async (post) => {
        const author = await fetchAuthorProfile(post.userId).catch(() => null);
        return author ? { ...post, authorName: author.name || post.authorName, authorAvatar: author.avatar || post.authorAvatar } : post;
      }));
      if (current === seq.current) setPosts(withAuthors);
    } catch (err) {
      if (current !== seq.current) return;
      setPosts([]);
      setError(getApiErrorMessage(err, 'Không thể tải danh sách bài viết chờ duyệt.'));
    } finally {
      if (current === seq.current) setLoading(false);
    }
  }, [group.id]);

  useEffect(() => { void load(); }, [load]);

  const removeFromQueue = (id: string) => setPosts((items) => items.filter((item) => item.id !== id));

  const review = async (post: Post, approved: boolean) => {
    if (processingId) return;
    setProcessingId(post.id);
    try {
      await postService.reviewGroupPost(post.id, approved);
      removeFromQueue(post.id);
      toast.showSuccess(approved ? 'Đã duyệt bài viết.' : 'Đã từ chối bài viết.');
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể xử lý bài viết, vui lòng thử lại.'));
    } finally {
      setProcessingId(null);
    }
  };

  const approveAll = async () => {
    setApprovingAll(true);
    let done = 0;
    for (const post of [...posts]) {
      try {
        await postService.reviewGroupPost(post.id, true);
        removeFromQueue(post.id);
        done += 1;
      } catch {
        break;
      }
    }
    setApprovingAll(false);
    setApproveAllOpen(false);
    if (done > 0) toast.showSuccess(`Đã duyệt ${done} bài viết.`);
    else toast.showError('Không thể duyệt bài viết, vui lòng thử lại.');
  };

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-4">
      <TabCard className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30"><Clock3 className="h-5 w-5" /></div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                Bài viết đang chờ{!loading && !error && posts.length > 0 ? ` · ${posts.length}` : ''}
              </h2>
              <p className="text-sm text-gray-500 dark:text-[#b0b3b8]">Bài chỉ hiển thị với mọi người sau khi được duyệt.</p>
            </div>
          </div>
          {posts.length > 1 && (
            <button
              type="button"
              onClick={() => setApproveAllOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1877f2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#166fe5] cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              Duyệt tất cả
            </button>
          )}
        </div>
      </TabCard>

      {loading ? (
        <div className="space-y-4" aria-busy="true">
          {[0, 1].map((i) => (
            <TabCard key={i} className="space-y-3 p-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width="44px" height="44px" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="35%" height="0.9rem" />
                  <Skeleton variant="text" width="20%" height="0.7rem" />
                </div>
              </div>
              <Skeleton variant="text" width="100%" height="3rem" />
            </TabCard>
          ))}
        </div>
      ) : error ? (
        <TabCard><ErrorState message={error} onRetry={() => void load()} /></TabCard>
      ) : posts.length === 0 ? (
        <TabCard>
          <EmptyState
            icon={<ClipboardCheck className="h-7 w-7" />}
            title="Không có bài viết nào đang chờ duyệt"
            hint="Khi thành viên đăng bài, bài sẽ hiện ở đây để bạn duyệt."
          />
        </TabCard>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const busy = processingId === post.id;
            return (
              <article key={post.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#393a3b] dark:bg-[#242526]" data-pending-post={post.id}>
                <div className="p-4 pb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar src={post.authorAvatar} alt={post.authorName} size="md" className="h-11 w-11 rounded-full" />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold text-gray-900 dark:text-[#e4e6eb]">{post.authorName || 'Thành viên'}</p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#b0b3b8]">
                        <TimeAgo iso={post.createdAtRaw} fallback={post.createdAt} />
                        <span>·</span>
                        <Globe className="h-3 w-3" />
                      </div>
                    </div>
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                      <Clock3 className="h-3 w-3" />
                      Chờ duyệt
                    </span>
                  </div>
                  {post.content && (
                    <p className="mt-3 line-clamp-[12] whitespace-pre-wrap break-words text-[15px] leading-relaxed text-gray-900 dark:text-[#e4e6eb]">{post.content}</p>
                  )}
                </div>

                {((post.mediaUrls && post.mediaUrls.length > 0) || (post.mediaList && post.mediaList.length > 0)) && (
                  <PostMediaGallery urls={post.mediaUrls ?? []} mediaList={post.mediaList} />
                )}

                <div className="flex gap-2 border-t border-gray-100 p-3 dark:border-[#393a3b]">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void review(post, true)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1877f2] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#166fe5] disabled:opacity-60 cursor-pointer"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Duyệt
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void review(post, false)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-300 disabled:opacity-60 dark:bg-[#4e4f50] dark:text-[#e4e6eb] dark:hover:bg-[#5a5b5c] cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Từ chối
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={approveAllOpen}
        title="Duyệt tất cả bài viết?"
        message={`${posts.length} bài viết đang chờ sẽ được hiển thị trong nhóm ngay lập tức.`}
        confirmText="Duyệt tất cả"
        type="info"
        loading={approvingAll}
        onConfirm={() => void approveAll()}
        onClose={() => { if (!approvingAll) setApproveAllOpen(false); }}
      />
    </div>
  );
};
