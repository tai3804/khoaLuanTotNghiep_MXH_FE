import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Clock3, Trash2, Users, Lock, Eye, Clock, UserPlus, Shield, Globe, FileText, Loader2, MessageSquarePlus } from 'lucide-react';
import { CreatePostBox } from '../post/CreatePostBox';
import { PostCard } from '../post/post-card';
import { GroupResponse } from '../../services/groupService';
import { GroupRemovePostModal } from './GroupRemovePostModal';
import { postService } from '../../services/api';
import { Post } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { Skeleton } from '../common/Skeleton';
import { TimeAgo } from '../common/TimeAgo';

interface GroupDiscussionTabProps {
  group: GroupResponse;
  joining?: boolean;
  onToggleJoin?: () => void;
}

const PAGE_SIZE = 10;

export const GroupDiscussionTab: React.FC<GroupDiscussionTabProps> = ({ group, joining = false, onToggleJoin }) => {
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [myPending, setMyPending] = useState<Post[]>([]);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [postToRemove, setPostToRemove] = useState<Post | null>(null);
  const loadSeq = useRef(0);

  const isPrivateLocked = group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin;
  const canModerate = Boolean(group.isAdmin || group.isModerator);
  const canPost = Boolean(group.isMember || group.isAdmin);
  const isBanned = group.joinStatus === 'BANNED';

  const loadMyPending = useCallback(async () => {
    if (!canPost || !group.postApprovalRequired) {
      setMyPending([]);
      return;
    }
    setMyPending(await postService.getMyPendingGroupPosts(group.id));
  }, [group.id, canPost, group.postApprovalRequired]);

  const loadPosts = useCallback(async () => {
    const seq = ++loadSeq.current;
    if (!group.id || isPrivateLocked) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      const result = await postService.getGroupPostsPage(group.id, 1, PAGE_SIZE);
      if (seq !== loadSeq.current) return;
      setPosts(result.posts);
      setPage(1);
      setLast(result.last);
    } catch (err) {
      if (seq !== loadSeq.current) return;
      setPosts([]);
      setLoadError(getApiErrorMessage(err, 'Không thể tải bài viết của nhóm.'));
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  }, [group.id, isPrivateLocked]);

  const loadMore = async () => {
    if (loadingMore || last) return;
    const seq = loadSeq.current;
    setLoadingMore(true);
    try {
      const result = await postService.getGroupPostsPage(group.id, page + 1, PAGE_SIZE);
      if (seq !== loadSeq.current) return;
      setPosts((current) => {
        const known = new Set(current.map((p) => p.id));
        return [...current, ...result.posts.filter((p) => !known.has(p.id))];
      });
      setPage((p) => p + 1);
      setLast(result.last);
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể tải thêm bài viết.'));
    } finally {
      setLoadingMore(false);
    }
  };

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

  const handleDeletePost = (id: string) => {
    setPosts((current) => current.filter((item) => item.id !== id));
  };

  const removePost = async (reason: string) => {
    if (!postToRemove) return;
    const target = postToRemove;
    try {
      setRemovingId(target.id);
      await postService.removeGroupPost(target.id, reason || undefined);
      setPosts((items) => items.filter((item) => item.id !== target.id));
      setPostToRemove(null);
      toast.showSuccess('Đã gỡ bài viết khỏi nhóm.');
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể gỡ bài viết, vui lòng thử lại.'));
    } finally {
      setRemovingId(null);
    }
  };

  const joinButtonLabel = group.privacy === 'PUBLIC' ? 'Tham gia nhóm' : 'Gửi yêu cầu tham gia';

  return (
    <div className="flex flex-col lg:flex-row w-full gap-5">
      {/* Cột chính */}
      <div className="flex-1 min-w-0 max-w-[680px]">
        {isPrivateLocked ? (
          <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Đây là nhóm riêng tư</h2>
              <p className="text-sm text-gray-500 dark:text-[#b0b3b8] leading-relaxed">
                Hãy tham gia nhóm này để xem các bài viết, hình ảnh, video và tham gia thảo luận cùng các thành viên khác.
              </p>
            </div>

            {isBanned ? (
              <p className="text-sm font-semibold text-red-600">Bạn đã bị cấm khỏi nhóm này.</p>
            ) : (
              onToggleJoin && (
                <div className="pt-2">
                  {group.joinStatus === 'PENDING' ? (
                    <button
                      type="button"
                      disabled={joining}
                      onClick={onToggleJoin}
                      className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-6 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
                      title="Bấm để hủy yêu cầu tham gia nhóm"
                    >
                      {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                      Đã gửi yêu cầu · Bấm để hủy
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={joining}
                      onClick={onToggleJoin}
                      className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-6 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-60"
                    >
                      {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      {joinButtonLabel}
                    </button>
                  )}
                </div>
              )
            )}

            <div className="border-t border-gray-100 dark:border-[#393a3b] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#3a3b3c]/40">
                <div className="p-2 rounded-lg bg-white dark:bg-[#242526] text-amber-500 shadow-sm shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb]">Riêng tư</h4>
                  <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 leading-normal">
                    Chỉ thành viên mới nhìn thấy những người trong nhóm và những gì họ đăng.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#3a3b3c]/40">
                <div className="p-2 rounded-lg bg-white dark:bg-[#242526] text-[#1877f2] shadow-sm shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb]">Hiển thị</h4>
                  <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 leading-normal">
                    Bất kỳ ai cũng có thể tìm thấy nhóm này.
                  </p>
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
              <div className="bg-white dark:bg-[#242526] p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] mb-4 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
                  {isBanned ? 'Bạn không thể đăng bài trong nhóm này' : 'Tham gia nhóm để đăng bài viết'}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
                  {isBanned
                    ? 'Bạn đã bị quản trị viên cấm khỏi nhóm nên chỉ có thể xem nội dung công khai.'
                    : 'Bạn cần tham gia cộng đồng này để cùng chia sẻ bài viết, bình luận và thảo luận cùng các thành viên khác.'}
                </p>
                {onToggleJoin && !isBanned && (
                  <button
                    type="button"
                    disabled={joining}
                    onClick={onToggleJoin}
                    className="mt-3 bg-[#1877f2] hover:bg-[#166fe5] text-white px-5 py-2 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
                  >
                    {joining && <Loader2 className="w-4 h-4 animate-spin" />}
                    {group.joinStatus === 'PENDING' ? 'Hủy yêu cầu tham gia' : joinButtonLabel}
                  </button>
                )}
              </div>
            )}

            {/* Bài của chính mình đang chờ duyệt */}
            {myPending.length > 0 && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/50 dark:bg-amber-900/20">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-100">
                  <Clock3 className="h-4 w-4 shrink-0" />
                  Bạn có {myPending.length} bài viết đang chờ quản trị viên duyệt
                </div>
                <ul className="mt-3 space-y-2">
                  {myPending.map((post) => (
                    <li key={post.id} className="rounded-xl bg-white/80 p-3 text-sm text-gray-700 dark:bg-[#242526]/70 dark:text-[#e4e6eb]">
                      <p className="line-clamp-2 whitespace-pre-wrap break-words">{post.content || 'Bài viết không có nội dung chữ.'}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Gửi <TimeAgo iso={post.createdAtRaw} fallback={post.createdAt} />
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Luồng bài viết */}
            {loading ? (
              <div className="space-y-4" aria-busy="true">
                {[0, 1].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#242526] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-[#393a3b] space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circular" width="40px" height="40px" />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="text" width="40%" height="0.9rem" />
                        <Skeleton variant="text" width="25%" height="0.7rem" />
                      </div>
                    </div>
                    <Skeleton variant="text" width="100%" height="3rem" />
                  </div>
                ))}
              </div>
            ) : loadError ? (
              <div role="alert" className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow-sm border border-red-200 dark:border-red-900/50 text-center">
                <p className="text-sm text-red-600 dark:text-red-300">{loadError}</p>
                <button
                  type="button"
                  onClick={() => void loadPosts()}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#393a3b] text-center">
                <MessageSquarePlus className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="font-semibold text-gray-800 dark:text-[#e4e6eb]">Chưa có bài viết nào trong nhóm này</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">
                  {canPost ? 'Hãy là người đầu tiên chia sẻ điều gì đó với mọi người.' : 'Tham gia nhóm để bắt đầu thảo luận.'}
                </p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <div key={post.id} className="mb-4">
                    {canModerate && !post.isOptimistic && (
                      <div className="flex items-center justify-between gap-2 rounded-t-2xl border border-b-0 border-red-100 bg-red-50 px-4 py-2 dark:border-red-900/40 dark:bg-red-900/20">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-700 dark:text-red-200">
                          <Shield className="h-3.5 w-3.5" />
                          Công cụ điều hành nhóm
                        </span>
                        <button
                          type="button"
                          disabled={removingId === post.id}
                          onClick={() => setPostToRemove(post)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Gỡ bài
                        </button>
                      </div>
                    )}
                    <PostCard post={post} onDeletePost={handleDeletePost} />
                  </div>
                ))}
                {!last && (
                  <div className="flex justify-center pb-4">
                    <button
                      type="button"
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="px-6 py-2.5 rounded-xl bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] text-sm font-bold text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-50 dark:hover:bg-[#4e4f50] transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                      Xem thêm bài viết
                    </button>
                  </div>
                )}
              </>
            )}
            <GroupRemovePostModal
              post={postToRemove}
              loading={removingId === postToRemove?.id}
              onClose={() => setPostToRemove(null)}
              onConfirm={(reason) => void removePost(reason)}
            />
          </>
        )}
      </div>

      {/* Cột giới thiệu */}
      <div className="w-full lg:w-[320px] shrink-0">
        <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] space-y-4 lg:sticky lg:top-20">
          <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">Giới thiệu về nhóm này</h3>

          <p className="text-sm text-gray-600 dark:text-[#b0b3b8] leading-relaxed whitespace-pre-line break-words">
            {group.description || 'Cùng chia sẻ, trao đổi và kết nối trong cộng đồng này.'}
          </p>

          <div className="border-t border-gray-100 dark:border-[#393a3b] pt-3 space-y-3">
            <div className="flex items-start gap-3">
              {group.privacy === 'PUBLIC' ? (
                <Globe className="w-5 h-5 text-gray-600 dark:text-[#b0b3b8] shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb]">
                  {group.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 leading-normal">
                  {group.privacy === 'PUBLIC'
                    ? 'Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng.'
                    : 'Chỉ thành viên mới nhìn thấy những người trong nhóm và những gì họ đăng.'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-600 dark:text-[#b0b3b8] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb]">Hiển thị</h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 leading-normal">Ai cũng có thể tìm thấy nhóm này.</p>
              </div>
            </div>

            {group.postApprovalRequired && (
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb]">Kiểm duyệt bài viết</h4>
                  <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 leading-normal">
                    Bài viết trong nhóm cần được quản trị viên duyệt trước khi hiển thị.
                  </p>
                </div>
              </div>
            )}
          </div>

          {group.rules && (
            <div className="border-t border-gray-100 dark:border-[#393a3b] pt-3">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-gray-900 dark:text-[#e4e6eb]">
                <FileText className="w-4 h-4 text-[#1877f2]" />
                <span>Nội quy của nhóm</span>
              </div>
              <p className="whitespace-pre-line break-words text-xs text-gray-600 dark:text-[#b0b3b8] leading-relaxed bg-gray-50 dark:bg-[#3a3b3c]/50 p-3 rounded-xl">
                {group.rules}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
