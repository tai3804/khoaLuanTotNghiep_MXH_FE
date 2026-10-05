import { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Post } from '../../types';

interface Props {
  post: Post | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const GroupRemovePostModal = ({ post, loading = false, onClose, onConfirm }: Props) => {
  const [reason, setReason] = useState('');
  useEffect(() => { setReason(''); }, [post?.id]);
  if (!post) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4" role="dialog" aria-modal="true">
    <div className="w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#242526]">
      <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="rounded-full bg-red-100 p-2.5 text-red-600 dark:bg-red-900/30"><AlertTriangle size={22} /></div><div><h2 className="text-lg font-extrabold">Gỡ bài viết khỏi nhóm</h2><p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Chủ bài sẽ nhận thông báo và có thể gửi kháng nghị.</p></div></div><button type="button" disabled={loading} onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"><X size={20} /></button></div>
      <div className="mt-5 rounded-xl bg-gray-100 p-4 text-sm text-gray-700 dark:bg-[#3a3b3c] dark:text-[#e4e6eb]"><p className="mb-1 text-xs font-bold text-gray-500 dark:text-[#b0b3b8]">BÀI VIẾT CỦA {post.authorName || 'THÀNH VIÊN'}</p><p className="line-clamp-3 whitespace-pre-wrap">{post.content || 'Bài viết không có nội dung chữ.'}</p></div>
      <label className="mt-5 block text-sm font-bold">Lý do gỡ bài <span className="font-normal text-gray-500">(không bắt buộc)</span><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} placeholder="Ví dụ: Nội dung không phù hợp với nội quy nhóm..." className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] dark:border-[#65676b] dark:bg-[#3a3b3c]" /></label>
      <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={loading} onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-bold hover:bg-gray-100 disabled:opacity-60 dark:hover:bg-[#3a3b3c]">Hủy</button><button type="button" disabled={loading} onClick={() => onConfirm(reason.trim())} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"><Trash2 size={16} />{loading ? 'Đang gỡ...' : 'Gỡ bài viết'}</button></div>
    </div>
  </div>;
};
