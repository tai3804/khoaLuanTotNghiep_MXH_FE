import React, { useEffect, useState, useCallback } from 'react';
import { GroupResponse } from '../../services/groupService';
import { postService } from '../../services/api';
import { fetchAuthorProfile } from '../../services/userService';
import { Post } from '../../types';
import { GroupRemovePostModal } from './GroupRemovePostModal';
import { GroupPendingPostsHeader, GroupPendingPostCard } from './group-pending-posts';
import { useToast } from '../../context/ToastContext';
import { Clock3, Loader2 } from 'lucide-react';

export const GroupPendingPostsTab: React.FC<{ group: GroupResponse }> = ({ group }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [removingPost, setRemovingPost] = useState<Post | null>(null);
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const pending = await postService.getPendingGroupPosts(group.id);
      const enriched = await Promise.all(
        pending.map(async (post) => {
          const author = await fetchAuthorProfile(post.userId).catch(() => null);
          return author
            ? { ...post, authorName: author.name || post.authorName, authorAvatar: author.avatar || post.authorAvatar }
            : post;
        })
      );
      setPosts(enriched);
    } catch (err) {
      console.error('Failed to load pending group posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [group.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const removeFromQueue = (id: string) => {
    setPosts((items) => items.filter((item) => item.id !== id));
  };

  const handleReview = async (post: Post, approved: boolean) => {
    try {
      setProcessingId(post.id);
      await postService.reviewGroupPost(post.id, approved);
      removeFromQueue(post.id);
      toast.showSuccess(approved ? 'Đã duyệt bài viết vào nhóm thành công!' : 'Đã từ chối bài viết.');
    } catch (err: any) {
      toast.showError(err?.message || 'Không thể xử lý duyệt bài viết.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmRemove = async (reason: string) => {
    if (!removingPost) return;
    try {
      setProcessingId(removingPost.id);
      await postService.removeGroupPost(removingPost.id, reason || undefined);
      removeFromQueue(removingPost.id);
      toast.showSuccess('Đã gỡ bài viết khỏi nhóm.');
      setRemovingPost(null);
    } catch (err: any) {
      toast.showError(err?.message || 'Không thể gỡ bài viết.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header Banner */}
      <GroupPendingPostsHeader count={posts.length} />

      {/* Main Content Area */}
      {loading ? (
        <div className="rounded-2xl bg-white dark:bg-[#242526] p-12 text-center text-sm text-gray-500 dark:text-[#b0b3b8] shadow-sm border border-gray-100 dark:border-[#393a3b] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1877f2] mb-2" />
          <p>Đang tải danh sách bài viết chờ duyệt...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#242526] p-12 text-center shadow-sm border border-gray-100 dark:border-[#393a3b] flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
          <Clock3 className="w-12 h-12 mb-2 opacity-30" />
          <p className="text-sm font-medium text-gray-600 dark:text-[#b0b3b8]">
            Không có bài viết nào đang chờ duyệt.
          </p>
          <span className="text-xs text-gray-400 mt-0.5">
            Các bài viết mới cần phê duyệt sẽ xuất hiện tại đây.
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <GroupPendingPostCard
              key={post.id}
              post={post}
              isProcessing={processingId === post.id}
              onReview={handleReview}
              onRequestRemove={(p) => setRemovingPost(p)}
            />
          ))}
        </div>
      )}

      {/* Remove Post with Reason Modal */}
      {removingPost && (
        <GroupRemovePostModal
          post={removingPost}
          loading={processingId === removingPost.id}
          onClose={() => setRemovingPost(null)}
          onConfirm={handleConfirmRemove}
        />
      )}
    </div>
  );
};

export default GroupPendingPostsTab;
