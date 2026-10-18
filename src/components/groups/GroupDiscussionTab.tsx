import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Clock, Clock3, Loader2, Lock, MessageSquarePlus, Search, Trash2, UserPlus, Users, X } from 'lucide-react';
import { CreatePostBox } from '../post/CreatePostBox';
import { PostCard } from '../post/post-card';
import { PostCardSkeleton } from '../post/post-card/PostCardSkeleton';
import { groupService, GroupResponse, GroupStaffMember } from '../../services/groupService';
import { GroupRemovePostModal } from './GroupRemovePostModal';
import { GroupReportPostModal } from './GroupReportPostModal';
import { GroupAboutCard, GroupActivityCard, GroupRulesCard, GroupStaffCard } from './GroupAboutCards';
import { postService } from '../../services/api';
import type { GroupPostSort } from '../../services/postService';
import { Post } from '../../types';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { GroupPageContext, GroupPageContextValue } from '../../context/GroupPageContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { TimeAgo } from '../common/TimeAgo';

interface GroupDiscussionTabProps {
  group: GroupResponse;
  staff: GroupStaffMember[];
  joining?: boolean;
  onJoin?: () => void;
  onCancelRequest?: () => void;
  onNavigateProfile?: (userId: string) => void;
  onSeeAbout?: () => void;
  onSeeMembers?: () => void;
}

const PAGE_SIZE = 10;
const SORT_STORAGE_KEY = 'group_post_sort';

const SORT_OPTIONS: { value: GroupPostSort; label: string; hint: string }[] = [
  { value: 'activity', label: 'Hoạt động gần đây', hint: 'Bài có bình luận hoặc hoạt động mới nhất lên đầu' },
  { value: 'newest', label: 'Bài viết mới', hint: 'Bài đăng gần đây nhất lên đầu' },
];

const readStoredSort = (): GroupPostSort => {
  try {
    return localStorage.getItem(SORT_STORAGE_KEY) === 'newest' ? 'newest' : 'activity';
  } catch {
    return 'activity';
  }
};

export const GroupDiscussionTab: React.FC<GroupDiscussionTabProps> = ({
  group,
  staff,
  joining = false,
  onJoin,
  onCancelRequest,
  onNavigateProfile,
  onSeeAbout,
  onSeeMembers,
}) => {
  const toast = useToast();
  const { user } = useAuth();
  const myId = String(user?.id ?? '').toLowerCase();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [sort, setSort] = useState<GroupPostSort>(readStoredSort);
  const [sortOpen, setSortOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [myPending, setMyPending] = useState<Post[]>([]);
  const [removingPendingId, setRemovingPendingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [postToRemove, setPostToRemove] = useState<Post | null>(null);
  const [postToReport, setPostToReport] = useState<Post | null>(null);
  const [reporting, setReporting] = useState(false);
  const loadSeq = useRef(0);
  const pageRef = useRef(1);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const isPrivateLocked = group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin;
  const canModerate = Boolean(group.isAdmin || group.isModerator);
  const canPost = Boolean(group.isMember || group.isAdmin);
  const isBanned = group.joinStatus === 'BANNED';
  const isPending = group.joinStatus === 'PENDING';
  const isInvited = group.joinStatus === 'INVITED';
  const joinButtonLabel = isInvited ? 'Chấp nhận lời mời' : group.privacy === 'PUBLIC' ? 'Tham gia nhóm' : 'Gửi yêu cầu tham gia';

  const staffRoles = useMemo(() => new Map(staff.map((s) => [s.id.toLowerCase(), s.role])), [staff]);

  // Gõ xong khoảng 0,4 giây mới tìm để không gọi máy chủ sau mỗi phím
  useEffect(() => {
    const timer = window.setTimeout(() => setKeyword(searchInput.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadMyPending = useCallback(async () => {
    if (!canPost || !group.postApprovalRequired) {
      setMyPending([]);
      return;
    }
    setMyPending(await postService.getMyPendingGroupPosts(group.id));
  }, [group.id, canPost, group.postApprovalRequired]);

  const loadPosts = useCallback(async (silent = false) => {
    const seq = ++loadSeq.current;
    if (!group.id || isPrivateLocked) {
      setPosts([]);
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      const result = await postService.getGroupPostsPage(group.id, 1, PAGE_SIZE, sort, keyword);
      if (seq !== loadSeq.current) return;
      setPosts(result.posts);
      setPage(1);
      pageRef.current = 1;
      setLast(result.last);
    } catch (err) {
      if (seq !== loadSeq.current) return;
      if (silent) return;
      setPosts([]);
      setLoadError(getApiErrorMessage(err, 'Không thể tải bài viết của nhóm.'));
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  }, [group.id, isPrivateLocked, sort, keyword]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current) return;
    const seq = loadSeq.current;
    const nextPage = pageRef.current + 1;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const result = await postService.getGroupPostsPage(group.id, nextPage, PAGE_SIZE, sort, keyword);
      if (seq !== loadSeq.current) return;
      setPosts((current) => {
        const known = new Set(current.map((p) => p.id));
        return [...current, ...result.posts.filter((p) => !known.has(p.id))];
      });
      pageRef.current = nextPage;
      setPage(nextPage);
      setLast(result.last);
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể tải thêm bài viết.'));
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [group.id, sort, keyword, toast]);

  useEffect(() => {
    void loadMyPending();
  }, [loadMyPending]);

  useEffect(() => {
    void loadPosts();

    const handleFeedPostCreated = (e: any) => {
      const newPost = e.detail;
      if (newPost && String(newPost.groupId) === String(group.id)) {
        setPosts((current) => [newPost, ...current.filter((p) => p.id !== newPost.id)]);
      }
    };

    const handleOptimisticSettled = (e: any) => {
      const { tempId, realPost } = e.detail || {};
      if (!tempId || !realPost) return;
      if (String(realPost.groupId) === String(group.id)) {
        if (realPost.status === 'PENDING_APPROVAL') {
          // Bài chờ duyệt chưa hiện ở luồng bài viết: bỏ bản tạm và hiện ở thẻ "bài chờ duyệt của bạn"
          setPosts((current) => current.filter((p) => p.id !== tempId));
          void loadMyPending();
          return;
        }
        setPosts((current) => {
          if (current.some((p) => p.id === realPost.id)) {
            return current.filter((p) => p.id !== tempId);
          }
          return current.map((p) => (p.id === tempId ? realPost : p));
        });
      } else {
        setPosts((current) => current.filter((p) => p.id !== tempId));
      }
    };

    const handleOptimisticFailed = (e: any) => {
      const { tempId } = e.detail || {};
      if (!tempId) return;
      setPosts((current) => current.filter((p) => p.id !== tempId));
    };

    window.addEventListener('feed_post_created', handleFeedPostCreated);
    window.addEventListener('optimistic_post_settled', handleOptimisticSettled);
    window.addEventListener('optimistic_post_failed', handleOptimisticFailed);
    return () => {
      window.removeEventListener('feed_post_created', handleFeedPostCreated);
      window.removeEventListener('optimistic_post_settled', handleOptimisticSettled);
      window.removeEventListener('optimistic_post_failed', handleOptimisticFailed);
    };
  }, [group.id, loadPosts, loadMyPending]);

  // Cuộn gần cuối danh sách thì tự tải trang kế tiếp (như Facebook)
  useEffect(() => {
    if (last || loading || loadError) return;
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) void loadMore(); },
      { rootMargin: '700px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [last, loading, loadError, page, posts.length, loadMore]);

  useEffect(() => {
    if (!sortOpen) return;
    const close = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSortOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [sortOpen]);

  const changeSort = (value: GroupPostSort) => {
    setSortOpen(false);
    if (value === sort) return;
    try { localStorage.setItem(SORT_STORAGE_KEY, value); } catch { /* không lưu được thì thôi */ }
    setSort(value);
  };

  const handleDeletePost = (id: string) => {
    setPosts((current) => current.filter((item) => item.id !== id));
  };

  const removeMyPending = async (post: Post) => {
    setRemovingPendingId(post.id);
    try {
      await postService.deletePost(post.id);
      setMyPending((items) => items.filter((p) => p.id !== post.id));
      toast.showSuccess('Đã hủy bài viết đang chờ duyệt.');
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể hủy bài viết, vui lòng thử lại.'));
    } finally {
      setRemovingPendingId(null);
    }
  };

  const pinPost = useCallback(async (post: Post, pinned: boolean) => {
    try {
      await postService.pinGroupPost(post.id, pinned);
      toast.showSuccess(pinned ? 'Đã ghim bài viết lên đầu nhóm.' : 'Đã bỏ ghim bài viết.');
      await loadPosts(true);
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể ghim bài viết, vui lòng thử lại.'));
      throw err;
    }
  }, [loadPosts, toast]);

  const submitReport = async (reason: string, detail: string) => {
    if (!postToReport) return;
    setReporting(true);
    try {
      await postService.reportGroupPost(postToReport.id, reason, detail);
      setPostToReport(null);
      toast.showSuccess('Đã gửi báo cáo tới quản trị viên nhóm. Cảm ơn bạn đã giúp giữ nhóm văn minh.');
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể gửi báo cáo, vui lòng thử lại.'));
    } finally {
      setReporting(false);
    }
  };

  const removePost = async (reason: string, banAuthor: boolean) => {
    if (!postToRemove) return;
    const target = postToRemove;
    try {
      setRemovingId(target.id);
      await postService.removeGroupPost(target.id, reason || undefined);
      setPosts((items) => items.filter((item) => item.id !== target.id));
      setPostToRemove(null);
      if (banAuthor) {
        try {
          await groupService.removeMember(group.id, target.userId, true, true);
          setPosts((items) => items.filter((item) => item.userId !== target.userId));
          toast.showSuccess(`Đã gỡ bài viết và cấm ${target.authorName || 'thành viên'} khỏi nhóm.`);
        } catch (err) {
          toast.showError(`Đã gỡ bài viết nhưng chưa cấm được thành viên: ${getApiErrorMessage(err, 'vui lòng thử lại.')}`);
        }
      } else {
        toast.showSuccess('Đã gỡ bài viết khỏi nhóm.');
      }
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể gỡ bài viết, vui lòng thử lại.'));
    } finally {
      setRemovingId(null);
    }
  };

  // Không cấm được chủ nhóm, chính mình, hoặc quản trị viên khác (trừ khi mình là quản trị viên)
  const canBanTarget = Boolean(
    postToRemove
    && postToRemove.userId !== group.ownerId
    && postToRemove.userId.toLowerCase() !== myId
    && (staffRoles.get(postToRemove.userId.toLowerCase()) !== 'ADMIN' || group.isAdmin),
  );

  const pageContext = useMemo<GroupPageContextValue>(() => ({
    group,
    staff,
    roleOf: (userId) => (userId ? staffRoles.get(userId.toLowerCase()) ?? null : null),
    canModerate,
    onPinPost: pinPost,
    onRemovePost: setPostToRemove,
    onReportPost: setPostToReport,
  }), [group, staff, staffRoles, canModerate, pinPost]);

  const renderJoinCta = (large = false) => {
    if (!onJoin || isBanned) return null;
    if (isPending) {
      return (
        <button
          type="button"
          disabled={joining}
          onClick={onCancelRequest}
          className={`inline-flex items-center gap-2 rounded-lg bg-gray-200 font-semibold text-gray-900 transition hover:bg-gray-300 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer ${large ? 'px-6 py-2.5 text-sm' : 'px-5 py-2 text-sm'}`}
        >
          {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
          Đã gửi yêu cầu · Hủy yêu cầu
        </button>
      );
    }
    return (
      <button
        type="button"
        disabled={joining}
        onClick={onJoin}
        className={`inline-flex items-center gap-2 rounded-lg bg-[#1877f2] font-semibold text-white shadow-sm transition hover:bg-[#166fe5] disabled:opacity-60 cursor-pointer ${large ? 'px-6 py-2.5 text-sm' : 'px-5 py-2 text-sm'}`}
      >
        {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        {joinButtonLabel}
      </button>
    );
  };

  const currentSort = SORT_OPTIONS.find((o) => o.value === sort) ?? SORT_OPTIONS[0];

  return (
    <GroupPageContext.Provider value={pageContext}>
      <div className="flex w-full gap-4 lg:items-start">
        {/* Cột chính */}
        <div className="mx-auto min-w-0 w-full max-w-[680px] flex-1 lg:mx-0">
          {isPrivateLocked ? (
            <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-[#393a3b] dark:bg-[#242526]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-[#3a3b3c] dark:text-[#b0b3b8]">
                <Lock className="h-8 w-8" />
              </div>
              <div className="mx-auto max-w-md space-y-2">
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Đây là nhóm riêng tư</h2>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-[#b0b3b8]">
                  Hãy tham gia nhóm để xem bài viết, hình ảnh, video và trò chuyện cùng các thành viên. Quản trị viên sẽ duyệt yêu cầu của bạn.
                </p>
              </div>
              {isBanned ? (
                <p className="text-sm font-semibold text-red-600">Bạn đã bị cấm khỏi nhóm này.</p>
              ) : (
                renderJoinCta(true)
              )}
              <div className="mx-auto grid max-w-lg grid-cols-1 gap-3 border-t border-gray-100 pt-5 text-left sm:grid-cols-2 dark:border-[#393a3b]">
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-[#3a3b3c]/40">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb]">Riêng tư</h4>
                    <p className="mt-0.5 text-xs leading-normal text-gray-500 dark:text-[#b0b3b8]">
                      Chỉ thành viên mới nhìn thấy mọi người trong nhóm và những gì họ đăng.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-3 dark:bg-[#3a3b3c]/40">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-[#1877f2]" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb]">{group.memberCount.toLocaleString('vi-VN')} thành viên</h4>
                    <p className="mt-0.5 text-xs leading-normal text-gray-500 dark:text-[#b0b3b8]">Ai cũng có thể tìm thấy nhóm này.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {canPost ? (
                <div className="mb-4">
                  <CreatePostBox
                    onPostCreated={(post) => {
                      if (post.status === 'PENDING_APPROVAL') {
                        void loadMyPending();
                      } else {
                        setPosts((current) => [post, ...current.filter((p) => p.id !== post.id)]);
                      }
                    }}
                    groupId={group.id}
                  />
                </div>
              ) : (
                <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm sm:p-5 dark:border-[#393a3b] dark:bg-[#242526]">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-[#1877f2] dark:bg-blue-900/30">
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
                    {isBanned ? 'Bạn không thể đăng bài trong nhóm này' : 'Tham gia nhóm để đăng bài và bình luận'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-[#b0b3b8]">
                    {isBanned
                      ? 'Bạn đã bị quản trị viên cấm khỏi nhóm nên chỉ có thể xem nội dung công khai.'
                      : 'Chia sẻ bài viết, bình luận và thảo luận cùng các thành viên khác.'}
                  </p>
                  {!isBanned && <div className="mt-3">{renderJoinCta()}</div>}
                </div>
              )}

              {/* Bài của chính mình đang chờ duyệt */}
              {myPending.length > 0 && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-900/20">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-100">
                    <Clock3 className="h-4 w-4 shrink-0" />
                    Bạn có {myPending.length} bài viết đang chờ quản trị viên duyệt
                  </div>
                  <ul className="mt-3 space-y-2">
                    {myPending.map((post) => (
                      <li key={post.id} className="flex items-start justify-between gap-3 rounded-lg bg-white/80 p-3 text-sm text-gray-700 dark:bg-[#242526]/70 dark:text-[#e4e6eb]">
                        <div className="min-w-0">
                          <p className="line-clamp-2 whitespace-pre-wrap break-words">{post.content || 'Bài viết không có nội dung chữ.'}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            Gửi <TimeAgo iso={post.createdAtRaw} fallback={post.createdAt} />
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={removingPendingId === post.id}
                          onClick={() => void removeMyPending(post)}
                          className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-900/20 cursor-pointer"
                        >
                          {removingPendingId === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          Hủy bài
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Thanh sắp xếp + tìm kiếm trong nhóm */}
              {!loadError && (posts.length > 0 || loading || keyword || searchOpen) && (
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">Bài viết</h2>
                  <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Tìm bài viết trong nhóm"
                    aria-pressed={searchOpen}
                    onClick={() => {
                      if (searchOpen) { setSearchInput(''); setKeyword(''); }
                      setSearchOpen((o) => !o);
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-full cursor-pointer ${searchOpen ? 'bg-blue-50 text-[#1877f2] dark:bg-blue-900/30' : 'text-gray-600 hover:bg-gray-200 dark:text-[#b0b3b8] dark:hover:bg-[#3a3b3c]'}`}
                  >
                    <Search className="h-5 w-5" />
                  </button>
                  <div className="relative" ref={sortRef}>
                    <button
                      type="button"
                      aria-haspopup="menu"
                      aria-expanded={sortOpen}
                      onClick={() => setSortOpen((o) => !o)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c] cursor-pointer"
                    >
                      <span className="text-gray-500 dark:text-[#b0b3b8]">Sắp xếp:</span> {currentSort.label}
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {sortOpen && (
                      <div role="menu" className="absolute right-0 z-30 mt-1 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl dark:border-[#4e4f50] dark:bg-[#3a3b3c]">
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={sort === option.value}
                            onClick={() => changeSort(option.value)}
                            className="flex w-full items-start gap-3 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#4e4f50] cursor-pointer"
                          >
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-[#1877f2]">
                              {sort === option.value && <Check className="h-4 w-4" />}
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-gray-900 dark:text-[#e4e6eb]">{option.label}</span>
                              <span className="block text-xs text-gray-500 dark:text-[#b0b3b8]">{option.hint}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              )}

              {searchOpen && (
                <div className="relative mb-3">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    autoFocus
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Tìm bài viết trong nhóm này..."
                    aria-label="Tìm bài viết trong nhóm"
                    maxLength={100}
                    className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] dark:border-[#393a3b] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      aria-label="Xóa từ khóa"
                      onClick={() => { setSearchInput(''); setKeyword(''); }}
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#4e4f50] cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
              {keyword && !loading && !loadError && (
                <p className="mb-3 text-sm text-gray-500 dark:text-[#b0b3b8]">Kết quả cho “{keyword}”</p>
              )}

              {/* Luồng bài viết */}
              {loading ? (
                <div aria-busy="true">
                  <PostCardSkeleton withMedia={false} />
                  <PostCardSkeleton />
                </div>
              ) : loadError ? (
                <div role="alert" className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-[#242526]">
                  <p className="text-sm text-red-600 dark:text-red-300">{loadError}</p>
                  <button
                    type="button"
                    onClick={() => void loadPosts()}
                    className="mt-3 rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white hover:bg-[#166fe5] cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm dark:border-[#393a3b] dark:bg-[#242526]">
                  <MessageSquarePlus className="mx-auto mb-2 h-10 w-10 text-gray-300 dark:text-gray-600" />
                  <p className="font-semibold text-gray-800 dark:text-[#e4e6eb]">
                    {keyword ? 'Không tìm thấy bài viết nào phù hợp' : 'Chưa có bài viết nào trong nhóm này'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">
                    {keyword
                      ? 'Hãy thử từ khóa khác (không cần gõ dấu cũng được).'
                      : canPost ? 'Hãy là người đầu tiên chia sẻ điều gì đó với mọi người.' : 'Tham gia nhóm để bắt đầu thảo luận.'}
                  </p>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} onDeletePost={handleDeletePost} onViewProfile={onNavigateProfile} />
                  ))}
                  <div ref={sentinelRef} aria-hidden="true" className="h-px" />
                  {loadingMore && (
                    <div className="flex justify-center py-4" aria-live="polite">
                      <Loader2 className="h-6 w-6 animate-spin text-[#1877f2]" />
                    </div>
                  )}
                  {!last && !loadingMore && (
                    <div className="flex justify-center pb-4">
                      <button
                        type="button"
                        onClick={() => void loadMore()}
                        className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-50 dark:border-[#4e4f50] dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer"
                      >
                        Xem thêm bài viết
                      </button>
                    </div>
                  )}
                  {last && posts.length >= PAGE_SIZE && (
                    <p className="py-4 text-center text-sm text-gray-500 dark:text-[#b0b3b8]">Bạn đã xem hết bài viết của nhóm.</p>
                  )}
                </>
              )}
              <GroupReportPostModal
                post={postToReport}
                loading={reporting}
                onClose={() => setPostToReport(null)}
                onSubmit={(reason, detail) => void submitReport(reason, detail)}
              />
              <GroupRemovePostModal
                post={postToRemove}
                loading={removingId === postToRemove?.id}
                canBanAuthor={canBanTarget}
                onClose={() => setPostToRemove(null)}
                onConfirm={(reason, banAuthor) => void removePost(reason, banAuthor)}
              />
            </>
          )}
        </div>

        {/* Cột bên phải: giới thiệu, nội quy, quản trị viên (ẩn trên màn hình nhỏ vì đã có tab Giới thiệu) */}
        <aside className="hidden w-[360px] shrink-0 space-y-4 lg:block lg:sticky lg:top-[124px] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto no-scrollbar">
          <GroupAboutCard group={group} />
          {!isPrivateLocked && <GroupActivityCard group={group} />}
          <GroupRulesCard rules={group.rules} />
          <GroupStaffCard staff={staff} onNavigateProfile={onNavigateProfile} onSeeAll={onSeeMembers ?? onSeeAbout} />
        </aside>
      </div>
    </GroupPageContext.Provider>
  );
};
