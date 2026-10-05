import { useEffect, useState } from 'react';
import { Check, FileWarning, Loader2, MessageSquare, ThumbsUp, X } from 'lucide-react';
import { Header } from '../components/layout/header-bar';
import type { ChatUser } from '../components/chat/chat-box';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { useToast } from '../context/ToastContext';

interface Props { activeNavTab: string; setActiveNavTab: (tab: string) => void; onNavigateSettings: () => void; onNavigateProfile: (uid?: string) => void; onNavigateAuth: () => void; activeChatUser: ChatUser | null; setActiveChatUser: (user: ChatUser | null) => void; }
type Author = { name: string; avatarUrl?: string };

const nameOf = (profile: any, id: string) => {
  const parts = [profile?.lastName, profile?.middleName, profile?.firstName].filter(Boolean);
  return profile?.fullName || parts.join(' ').trim() || profile?.username || `Người dùng ${id.slice(0, 8)}`;
};
const actionLabel = (action?: string) => action === 'HIDE_POST' ? 'Bài viết đã bị ẩn' : 'Bài viết đã bị gỡ';

export const ModeratorAppealsPage: React.FC<Props> = (props) => {
  const [appeals, setAppeals] = useState<any[]>([]); const [authors, setAuthors] = useState<Record<string, Author>>({});
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState<string | null>(null); const toast = useToast();
  const load = async () => {
    try {
      setLoading(true); const next = await postService.getModerationAppeals(); const list = Array.isArray(next) ? next : []; setAppeals(list);
      const ids = [...new Set(list.map((a) => a.authorId).filter(Boolean))] as string[];
      const profiles = await Promise.all(ids.map(async (id) => { try { const p = await userService.getUserProfile(id); return [id, { name: nameOf(p, id), avatarUrl: p?.avatarUrl }] as const; } catch { return [id, { name: `Người dùng ${id.slice(0, 8)}` }] as const; } }));
      setAuthors(Object.fromEntries(profiles));
    } catch { toast.showError('Không tải được hàng chờ kháng nghị.'); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const review = async (postId: string, approved: boolean) => { try { setBusy(postId); await postService.reviewModerationAppeal(postId, approved); toast.showSuccess(approved ? 'Đã chấp nhận và khôi phục bài viết.' : 'Đã bác bỏ kháng nghị.'); await load(); } catch { toast.showError('Không thể xử lý kháng nghị.'); } finally { setBusy(null); } };
  return <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]"><Header activeTab={props.activeNavTab} onTabChange={props.setActiveNavTab} onNavigateSettings={props.onNavigateSettings} onNavigateProfile={props.onNavigateProfile} onNavigateAuth={props.onNavigateAuth} onSelectChatUser={props.setActiveChatUser} /><main className="mx-auto max-w-5xl px-4 pb-12 pt-20 text-gray-900 dark:text-[#e4e6eb]"><p className="text-xs font-bold uppercase text-[#1877f2]">Moderation</p><h1 className="mt-1 text-3xl font-extrabold">Hàng chờ kháng nghị</h1><p className="mt-1 text-sm text-gray-500">Xem bài viết gốc, lý do kháng nghị và đưa ra quyết định.</p>{loading ? <Loader2 className="mx-auto mt-16 animate-spin text-[#1877f2]" /> : appeals.length === 0 ? <div className="mt-7 rounded-2xl bg-white p-12 text-center shadow dark:bg-[#242526]"><FileWarning className="mx-auto mb-3 text-emerald-500" /><b>Không có kháng nghị đang chờ.</b></div> : <div className="mt-7 space-y-4">{appeals.map((appeal) => { const author = authors[appeal.authorId] || { name: 'Đang tải tác giả...' }; return <article key={appeal.postId} className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm dark:border-blue-900/70 dark:bg-[#1a1b1d]"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 text-xs dark:border-[#323336]"><span className="rounded-lg bg-amber-100 px-2.5 py-1 font-black text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">{actionLabel(appeal.action)}</span><span className="text-gray-400">Mã bài: <code>{appeal.postId}</code></span></div><p className="mt-3 text-sm text-rose-500"><b>Lý do xử lý:</b> {appeal.reason || 'Nội dung đã bị kiểm duyệt'}</p><div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-[#323336] dark:bg-[#222325]"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5">{author.avatarUrl ? <img src={author.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{author.name[0] || 'U'}</div>}<div><p className="text-sm font-extrabold">{author.name}</p><p className="text-[11px] text-gray-400">Đăng lúc: {appeal.createdAt ? new Date(appeal.createdAt).toLocaleString('vi-VN') : 'Không rõ thời gian'}</p></div></div><div className="flex gap-3 text-xs text-gray-400"><span className="flex items-center gap-1"><ThumbsUp size={14} /> {appeal.likeCount || 0}</span><span className="flex items-center gap-1"><MessageSquare size={14} /> {appeal.commentCount || 0}</span></div></div><p className="mt-4 whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">{appeal.content || 'Bài viết không có nội dung chữ.'}</p></div><div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm dark:bg-blue-950/25"><b>Lý do kháng nghị:</b><p className="mt-1 whitespace-pre-wrap">{appeal.appealMessage}</p></div><div className="mt-4 flex flex-wrap gap-2"><button disabled={busy === appeal.postId} onClick={() => void review(appeal.postId, true)} className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><Check size={16} />Chấp nhận & khôi phục</button><button disabled={busy === appeal.postId} onClick={() => void review(appeal.postId, false)} className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><X size={16} />Bác bỏ</button></div></article>; })}</div>}</main></div>;
};
