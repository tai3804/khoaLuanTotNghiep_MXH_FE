import React, { useEffect, useState } from 'react';
import { Check, Clock3, X } from 'lucide-react';
import { CreatePostBox } from '../post/CreatePostBox';
import { PostCard } from '../post/post-card';
import { GroupData } from './GroupBanner';
import { postService } from '../../services/api';
import { Post } from '../../types';

interface GroupDiscussionTabProps {
  group: GroupData;
}

export const GroupDiscussionTab: React.FC<GroupDiscussionTabProps> = ({ group }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const canReviewPosts = Boolean(group.isAdmin || group.isModerator);
  const loadPosts = async () => {
    setLoading(true);
    if (!group.id) { setPosts([]); setLoading(false); return; }
    try {
      const [published, pending] = await Promise.all([
        postService.getGroupPosts(group.id),
        canReviewPosts ? postService.getPendingGroupPosts(group.id) : Promise.resolve([]),
      ]);
      setPosts(published);
      setPendingPosts(pending);
    } finally { setLoading(false); }
  };
  useEffect(() => { loadPosts().catch(() => { setPosts([]); setPendingPosts([]); }); }, [group.id, canReviewPosts]);
  const reviewPost = async (post: Post, approved: boolean) => {
    try {
      setReviewingId(post.id);
      const reviewed = await postService.reviewGroupPost(post.id, approved);
      setPendingPosts((items) => items.filter((item) => item.id !== post.id));
      if (approved) setPosts((items) => [reviewed, ...items]);
    } finally { setReviewingId(null); }
  };
  return (
    <div className="flex w-full gap-4">
      <div className="flex-1 max-w-[680px]">
        {group.isMember && (
          <div className="mb-4">
            <CreatePostBox onPostCreated={(post) => {
              if (post.status === 'PENDING_APPROVAL') {
                setSubmissionMessage('Bài viết đã được gửi và đang chờ quản trị viên/kiểm duyệt viên phê duyệt.');
              } else {
                setPosts((current) => [post, ...current]);
              }
            }} groupId={group.id} />
          </div>
        )}
        {submissionMessage && <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-100"><Clock3 className="h-4 w-4 shrink-0" />{submissionMessage}</div>}
        {canReviewPosts && pendingPosts.length > 0 && (
          <section className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-700/40 dark:bg-amber-900/10">
            <div className="mb-3 flex items-center gap-2"><Clock3 className="h-5 w-5 text-amber-600" /><h2 className="font-bold text-gray-900 dark:text-[#e4e6eb]">Bài viết chờ duyệt ({pendingPosts.length})</h2></div>
            <div className="space-y-3">{pendingPosts.map((post) => <div key={post.id} className="rounded-xl bg-white p-3 shadow-sm dark:bg-[#242526]">
              <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-100">{post.content || 'Bài viết có tệp đính kèm'}</p>
              <p className="mt-2 text-xs text-gray-500">Đăng bởi {post.authorName}</p>
              <div className="mt-3 flex gap-2"><button disabled={reviewingId === post.id} onClick={() => reviewPost(post, true)} className="inline-flex items-center gap-1 rounded-lg bg-[#1877f2] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><Check className="h-4 w-4" />Duyệt</button><button disabled={reviewingId === post.id} onClick={() => reviewPost(post, false)} className="inline-flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-gray-100"><X className="h-4 w-4" />Từ chối</button></div>
            </div>)}</div>
          </section>
        )}
        {loading ? <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow text-center text-sm text-gray-500">Đang tải bài viết...</div> : posts.length === 0 ? <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl shadow text-center mt-4"><p className="text-gray-500 dark:text-[#b0b3b8]">Chưa có bài viết nào trong nhóm này.</p></div> : posts.map((post) => <PostCard key={post.id} post={post} onDeletePost={(id) => setPosts((current) => current.filter((item) => item.id !== id))} />)}
      </div>
      <div className="hidden lg:block w-[300px]">
        <div className="bg-white dark:bg-[#242526] p-4 rounded-2xl shadow sticky top-20">
          <h3 className="font-bold text-gray-900 dark:text-[#e4e6eb] mb-2">Giới thiệu</h3>
          <p className="text-sm text-gray-600 dark:text-[#b0b3b8]">{group.description || 'Cùng chia sẻ, trao đổi và kết nối trong cộng đồng này.'}</p>
          {group.rules && <><h4 className="font-bold text-gray-900 dark:text-[#e4e6eb] mt-4 mb-2">Nội quy nhóm</h4><p className="whitespace-pre-line text-sm text-gray-600 dark:text-[#b0b3b8]">{group.rules}</p></>}
          {group.postApprovalRequired && <p className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">Bài viết trong nhóm cần được quản trị viên duyệt trước khi hiển thị.</p>}
        </div>
      </div>
    </div>
  );
};
