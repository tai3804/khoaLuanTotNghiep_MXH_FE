import { useEffect, useState } from 'react';
import { Check, Clock3, Globe2, Image as ImageIcon, Lock, MessageCircle, ThumbsUp, Trash2, X } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { postService } from '../../services/api';
import { fetchAuthorProfile } from '../../services/userService';
import { Post } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

export const GroupPendingPostsTab = ({ group }: { group: GroupResponse }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const pending = await postService.getPendingGroupPosts(group.id);
      setPosts(await Promise.all(pending.map(async (post) => {
        const author = await fetchAuthorProfile(post.userId).catch(() => null);
        return author ? { ...post, authorName: author.name || post.authorName, authorAvatar: author.avatar || post.authorAvatar } : post;
      })));
    } catch { setPosts([]); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [group.id]);
  const removeFromQueue = (id: string) => setPosts((items) => items.filter((item) => item.id !== id));
  const review = async (post: Post, approved: boolean) => { try { setProcessingId(post.id); await postService.reviewGroupPost(post.id, approved); removeFromQueue(post.id); } finally { setProcessingId(null); } };
  const remove = async (post: Post) => {
    if (!window.confirm('Gỡ bài viết này khỏi nhóm? Chủ bài sẽ được thông báo và có thể kháng nghị.')) return;
    const reason = window.prompt('Lý do gỡ bài (có thể để trống):') || undefined;
    try { setProcessingId(post.id); await postService.removeGroupPost(post.id, reason); removeFromQueue(post.id); } finally { setProcessingId(null); }
  };

  return <div className="w-full max-w-[760px]">
    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-700/40 dark:bg-amber-900/10"><div className="flex items-center gap-2"><Clock3 className="h-5 w-5 text-amber-600" /><h2 className="font-extrabold text-gray-900 dark:text-[#e4e6eb]">Bài viết chờ duyệt</h2></div></div>
    {loading ? <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow dark:bg-[#242526]">Đang tải hàng chờ...</div> : posts.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500 shadow dark:bg-[#242526]">Không có bài viết nào đang chờ duyệt.</div> : <div className="space-y-4">{posts.map((post) => <article key={post.id} className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow dark:border-amber-800/40 dark:bg-[#242526]">
      <div className="p-4"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><UserAvatar src={post.authorAvatar} alt={post.authorName} size="md" /><div className="min-w-0"><p className="truncate text-sm font-bold text-gray-900 dark:text-white">{post.authorName || 'Thành viên'}</p><div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500"><span>{post.createdAt || 'Vừa xong'}</span><span>·</span>{post.privacy === 'PRIVATE' ? <Lock className="h-3.5 w-3.5" /> : <Globe2 className="h-3.5 w-3.5" />}</div></div></div><div className="flex shrink-0 gap-3 text-xs text-gray-500"><span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />{post.likesCount || 0}</span><span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{post.commentsCount || 0}</span></div></div><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800 dark:text-gray-100">{post.content || 'Bài viết không có nội dung chữ.'}</p></div>
      {post.mediaList?.length ? <div className={`grid gap-1 border-y border-gray-100 dark:border-[#393a3b] ${post.mediaList.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>{post.mediaList.map((media, index) => media.mediaType === 'VIDEO' ? <video key={`${media.fileUrl}-${index}`} controls className="max-h-[360px] w-full bg-black object-contain"><source src={media.fileUrl} /></video> : <a key={`${media.fileUrl}-${index}`} href={media.fileUrl} target="_blank" rel="noreferrer"><img src={media.fileUrl} alt={`Tệp đính kèm ${index + 1}`} className="max-h-[360px] w-full object-cover" /></a>)}</div> : post.mediaUrls?.length ? <div className="border-y border-gray-100 dark:border-[#393a3b]"><img src={post.mediaUrls[0]} alt="Tệp đính kèm" className="max-h-[360px] w-full object-cover" /></div> : null}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4"><span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300"><ImageIcon className="h-4 w-4" />Chờ duyệt trước khi hiển thị</span><div className="flex gap-2"><button disabled={processingId === post.id} onClick={() => void review(post, true)} className="inline-flex items-center gap-1 rounded-lg bg-[#1877f2] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><Check className="h-4 w-4" />Duyệt</button><button disabled={processingId === post.id} onClick={() => void review(post, false)} className="inline-flex items-center gap-1 rounded-lg bg-gray-200 px-3 py-2 text-xs font-bold text-gray-700 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-gray-100"><X className="h-4 w-4" />Từ chối</button><button disabled={processingId === post.id} onClick={() => void remove(post)} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"><Trash2 className="h-4 w-4" />Gỡ bài</button></div></div>
    </article>)}</div>}
  </div>;
};
