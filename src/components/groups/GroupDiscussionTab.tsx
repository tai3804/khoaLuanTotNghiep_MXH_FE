import React, { useEffect, useState, useCallback } from 'react';
import { Clock3, Trash2, Users, Lock, Eye, Clock, UserPlus, Shield, Globe, FileText } from 'lucide-react';
import { CreatePostBox } from '../post/CreatePostBox';
import { PostCard } from '../post/post-card';
import { GroupData } from './GroupBanner';
import { GroupRemovePostModal } from './GroupRemovePostModal';
import { postService } from '../../services/api';
import { Post } from '../../types';

interface GroupDiscussionTabProps {
  group: GroupData;
  onToggleJoin?: () => void;
}

export const GroupDiscussionTab: React.FC<GroupDiscussionTabProps> = ({ group, onToggleJoin }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [postToRemove, setPostToRemove] = useState<Post | null>(null);

  const isPrivateLocked = group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin;
  const canModerate = Boolean(group.isAdmin || group.isModerator);

  const loadPosts = useCallback(async () => {
    if (!group.id || isPrivateLocked) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setPosts(await postService.getGroupPosts(group.id));
    } catch (err) {
      console.warn('Could not load group posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [group.id, isPrivateLocked]);

  useEffect(() => {
    loadPosts();

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
  }, [group.id, loadPosts]);

  const handleDeletePost = (id: string) => {
    setPosts((current) => current.filter((item) => item.id !== id));
  };

  const removePost = async (reason: string) => {
    if (!postToRemove) return;
    try {
      setRemovingId(postToRemove.id);
      await postService.removeGroupPost(postToRemove.id, reason || undefined);
      setPosts((items) => items.filter((item) => item.id !== postToRemove.id));
      setPostToRemove(null);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-5">
      {/* Left / Main Column */}
      <div className="flex-1 max-w-[680px]">
        {isPrivateLocked ? (
          /* Facebook-like Private Group Locked Screen */
          <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
                Đây là nhóm Riêng tư
              </h2>
              <p className="text-sm text-gray-500 dark:text-[#b0b3b8] leading-relaxed">
                Hãy tham gia nhóm này để xem các bài viết, hình ảnh, video và tham gia thảo luận cùng các thành viên khác.
              </p>
            </div>

            {onToggleJoin && (
              <div className="pt-2">
                {group.joinStatus === 'PENDING' ? (
                  <button
                    onClick={onToggleJoin}
                    className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-6 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition cursor-pointer"
                    title="Bấm để hủy yêu cầu tham gia nhóm"
                  >
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Đã gửi yêu cầu tham gia (Bấm để hủy)
                  </button>
                ) : (
                  <button
                    onClick={onToggleJoin}
                    className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-6 py-2.5 rounded-xl font-bold text-sm inline-flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    Tham gia nhóm
                  </button>
                )}
              </div>
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
            {submissionMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-100">
                <Clock3 className="h-4 w-4 shrink-0" />
                {submissionMessage}
              </div>
            )}

            {/* Create Post or Non-member Join Callout */}
            {group.isMember || group.isAdmin ? (
              <div className="mb-4">
                <CreatePostBox
                  onPostCreated={(post) => {
                    if (post.status === 'PENDING_APPROVAL') {
                      setSubmissionMessage('Bài viết đã được gửi và đang chờ quản trị viên/kiểm duyệt viên phê duyệt.');
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
                  Tham gia nhóm để đăng bài viết
                </p>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
                  Bạn cần tham gia cộng đồng này để cùng chia sẻ bài viết, bình luận và thảo luận cùng các thành viên khác.
                </p>
              </div>
            )}

            {/* Posts Stream */}
            {loading ? (
              <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#393a3b] text-center text-sm text-gray-500 dark:text-[#b0b3b8]">
                Đang tải bài viết...
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-[#393a3b] text-center mt-4">
                <p className="text-gray-500 dark:text-[#b0b3b8]">Chưa có bài viết nào trong nhóm này.</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="relative mb-4">
                  {canModerate && !post.isOptimistic && (
                    <div className="absolute right-3 top-3 z-10">
                      <button
                        disabled={removingId === post.id}
                        onClick={() => setPostToRemove(post)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-red-700 disabled:opacity-60 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Gỡ bài
                      </button>
                    </div>
                  )}
                  <PostCard post={post} onDeletePost={handleDeletePost} />
                </div>
              ))
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

      {/* Right / About Sidebar */}
      <div className="w-full lg:w-[320px] shrink-0">
        <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] space-y-4 sticky top-20">
          <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
            Giới thiệu về nhóm này
          </h3>

          <p className="text-sm text-gray-600 dark:text-[#b0b3b8] leading-relaxed">
            {group.description || 'Cùng chia sẻ, trao đổi và kết nối trong cộng đồng này.'}
          </p>

          <div className="border-t border-gray-100 dark:border-[#393a3b] pt-3 space-y-3">
            {/* Privacy row */}
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

            {/* Visibility row */}
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-gray-600 dark:text-[#b0b3b8] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-[#e4e6eb]">Hiển thị</h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 leading-normal">
                  Ai cũng có thể tìm thấy nhóm này.
                </p>
              </div>
            </div>

            {/* Post Moderation rule */}
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

          {/* Rules section */}
          {group.rules && (
            <div className="border-t border-gray-100 dark:border-[#393a3b] pt-3">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs text-gray-900 dark:text-[#e4e6eb]">
                <FileText className="w-4 h-4 text-[#1877f2]" />
                <span>Nội quy của nhóm</span>
              </div>
              <p className="whitespace-pre-line text-xs text-gray-600 dark:text-[#b0b3b8] leading-relaxed bg-gray-50 dark:bg-[#3a3b3c]/50 p-3 rounded-xl">
                {group.rules}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
