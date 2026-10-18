import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Compass, Loader2, Newspaper } from 'lucide-react';
import { PostCard } from '../post/post-card';
import { PostCardSkeleton } from '../post/post-card/PostCardSkeleton';
import { postService, GroupPostSort } from '../../services/postService';
import { Post } from '../../types';
import { getApiErrorMessage } from '../../utils/apiError';
import { GroupsSuggestions } from './GroupsSuggestions';

interface GroupsFeedProps {
  /** Đổi giá trị này để tải lại bảng feed (vd. sau khi vào hoặc rời một nhóm). */
  refreshKey: string;
  /** Mình đã tham gia ít nhất một nhóm chưa (quyết định nội dung của trạng thái rỗng). */
  hasGroups: boolean;
  onExplore: () => void;
}

const PAGE_SIZE = 10;

const SORT_OPTIONS: { value: GroupPostSort; label: string; hint: string }[] = [
  { value: 'activity', label: 'Hoạt động gần đây', hint: 'Bài có bình luận mới lên trước' },
  { value: 'newest', label: 'Bài viết mới', hint: 'Bài mới đăng lên trước' },
];

/** Bảng feed của các nhóm mình tham gia (giống tab "Bảng feed của bạn" trong trang Nhóm của Facebook). */
export const GroupsFeed: React.FC<GroupsFeedProps> = ({ refreshKey, hasGroups, onExplore }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<GroupPostSort>('activity');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [moreError, setMoreError] = useState(false);
  const [last, setLast] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const pageRef = useRef(1);
  const requestSeq = useRef(0);
  const loadingMoreRef = useRef(false);
  const lastRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadFirst = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError('');
    setMoreError(false);
    try {
      const result = await postService.getGroupsFeedPage(1, PAGE_SIZE, sort);
      if (seq !== requestSeq.current) return;
      setPosts(result.posts);
      pageRef.current = 1;
      lastRef.current = result.last;
      setLast(result.last);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setPosts([]);
      setError(getApiErrorMessage(err, 'Không thể tải bảng feed nhóm. Vui lòng thử lại.'));
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    void loadFirst();
  }, [loadFirst, refreshKey]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || lastRef.current) return;
    const seq = requestSeq.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setMoreError(false);
    try {
      const nextPage = pageRef.current + 1;
      const result = await postService.getGroupsFeedPage(nextPage, PAGE_SIZE, sort);
      if (seq !== requestSeq.current) return;
      setPosts((current) => {
        const known = new Set(current.map((p) => p.id));
        return [...current, ...result.posts.filter((p) => !known.has(p.id))];
      });
      pageRef.current = nextPage;
      lastRef.current = result.last;
      setLast(result.last);
    } catch {
      if (seq === requestSeq.current) setMoreError(true);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [sort]);

  // Cuộn gần cuối danh sách thì tự tải trang tiếp theo (như bảng tin Facebook)
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || loading || last || moreError) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: '700px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loading, last, moreError, loadMore, posts.length]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleDeletePost = (id: string) => setPosts((current) => current.filter((p) => p.id !== id));
  const currentSort = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  return (
    <div className="flex w-full justify-center gap-6">
      <div className="w-full max-w-[680px] min-w-0">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Bảng feed của bạn</h2>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] px-3 py-1.5 text-sm font-semibold text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-50 dark:hover:bg-[#4e4f50] cursor-pointer"
            >
              <span className="hidden sm:inline text-gray-500 dark:text-[#b0b3b8] font-medium">Sắp xếp:</span>
              {currentSort.label}
              <ChevronDown className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div role="menu" className="absolute right-0 mt-1 w-64 z-20 rounded-xl border border-gray-200 dark:border-[#4e4f50] bg-white dark:bg-[#3a3b3c] shadow-lg p-1.5">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={sort === option.value}
                    onClick={() => { setSort(option.value); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#4e4f50] cursor-pointer"
                  >
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">{option.label}</span>
                      <span className="block text-xs text-gray-500 dark:text-[#b0b3b8]">{option.hint}</span>
                    </span>
                    {sort === option.value && <Check className="w-4 h-4 text-[#1877f2]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div aria-busy="true">
            <PostCardSkeleton withMedia />
            <PostCardSkeleton withMedia={false} />
            <PostCardSkeleton withMedia />
          </div>
        ) : error ? (
          <div role="alert" className="bg-white dark:bg-[#242526] p-8 rounded-xl border border-red-200 dark:border-red-900/50 text-center">
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            <button
              type="button"
              onClick={() => void loadFirst()}
              className="mt-3 px-4 py-2 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-[#242526] px-6 py-12 rounded-xl border border-gray-200 dark:border-[#393a3b] shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] flex items-center justify-center mx-auto mb-3">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb]">
              {hasGroups ? 'Chưa có bài viết nào trong các nhóm của bạn' : 'Bảng feed nhóm của bạn đang trống'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto">
              {hasGroups
                ? 'Khi thành viên đăng bài, bài viết mới sẽ xuất hiện ở đây. Bạn có thể là người đầu tiên chia sẻ trong nhóm của mình.'
                : 'Tham gia các nhóm bạn quan tâm để xem bài viết, ảnh và video của họ ngay tại đây.'}
            </p>
            <button
              type="button"
              onClick={onExplore}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              Khám phá nhóm
            </button>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onDeletePost={handleDeletePost} />
            ))}
            {!last && (
              <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-4">
                {loadingMore && <Loader2 className="w-6 h-6 animate-spin text-[#1877f2]" aria-label="Đang tải thêm" />}
                {moreError && <p className="text-sm text-red-500">Không tải được thêm bài viết.</p>}
                {!loadingMore && (
                  <button
                    type="button"
                    onClick={() => void loadMore()}
                    className="px-5 py-2 rounded-xl bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] text-sm font-bold text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-50 dark:hover:bg-[#4e4f50] cursor-pointer"
                  >
                    {moreError ? 'Thử lại' : 'Xem thêm bài viết'}
                  </button>
                )}
              </div>
            )}
            {last && posts.length > 0 && (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-[#b0b3b8]">Bạn đã xem hết bài viết trong các nhóm của mình.</p>
            )}
          </>
        )}
      </div>

      <div className="hidden xl:block w-[320px] shrink-0">
        <div className="sticky top-[4.5rem]">
          <GroupsSuggestions refreshKey={refreshKey} onSeeAll={onExplore} />
        </div>
      </div>
    </div>
  );
};
