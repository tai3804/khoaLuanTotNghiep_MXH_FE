import React, { useEffect, useMemo, useState } from 'react';
import { Archive, ArrowLeft, Clock3, Edit3, Eye, History, Search, Shield, Tag, UserRoundCheck, X, Lock, CircleDotDashed, PanelTop, BookOpenCheck } from 'lucide-react';
import { Post } from '../../types';

type Panel = 'menu' | 'nickname' | 'activity' | 'archive' | 'storyArchive' | 'review' | 'search' | 'visibility' | 'status';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  posts: Post[];
  userId: string;
  onEditProfile: () => void;
  onOpenMedia: () => void;
  onOpenPrivacy: () => void;
  onArchiveChange: (ids: string[]) => void;
}

const storageKey = (userId: string, name: string) => `profile_management_${name}_${userId}`;

export const ProfileManagementModal: React.FC<Props> = ({ isOpen, onClose, posts, userId, onEditProfile, onOpenMedia, onOpenPrivacy, onArchiveChange }) => {
  const [panel, setPanel] = useState<Panel>('menu');
  const [query, setQuery] = useState('');
  const [nickname, setNickname] = useState('');
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [publicView, setPublicView] = useState(true);
  const [profileEnabled, setProfileEnabled] = useState(true);
  const [reviewHiddenIds, setReviewHiddenIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'PUBLIC' | 'FRIENDS' | 'PRIVATE'>('PUBLIC');

  useEffect(() => {
    if (!isOpen) return;
    setPanel('menu'); setQuery('');
    try {
      setNickname(localStorage.getItem(storageKey(userId, 'nickname')) || '');
      setArchivedIds(JSON.parse(localStorage.getItem(storageKey(userId, 'archived_posts')) || '[]'));
      setPublicView(localStorage.getItem(storageKey(userId, 'public_view')) !== 'false');
      setProfileEnabled(localStorage.getItem(storageKey(userId, 'enabled')) !== 'false');
      setReviewHiddenIds(JSON.parse(localStorage.getItem(storageKey(userId, 'review_hidden')) || '[]'));
      setViewMode((localStorage.getItem(storageKey(userId, 'view_mode')) as any) || 'PUBLIC');
    } catch {}
  }, [isOpen, userId]);

  const visiblePosts = useMemo(() => posts.filter((post) =>
    panel === 'archive' ? archivedIds.includes(post.id) : !archivedIds.includes(post.id)
  ).filter((post) => !query || (post.content || '').toLowerCase().includes(query.toLowerCase())), [archivedIds, panel, posts, query]);
  const save = (name: string, value: string) => localStorage.setItem(storageKey(userId, name), value);
  const toggleArchive = (postId: string) => {
    const next = archivedIds.includes(postId) ? archivedIds.filter((id) => id !== postId) : [...archivedIds, postId];
    setArchivedIds(next); save('archived_posts', JSON.stringify(next)); onArchiveChange(next);
  };
  const toggleReview = (postId: string) => {
    const next = reviewHiddenIds.includes(postId) ? reviewHiddenIds.filter((id) => id !== postId) : [...reviewHiddenIds, postId];
    setReviewHiddenIds(next); save('review_hidden', JSON.stringify(next));
  };
  if (!isOpen) return null;

  const items: Array<{ id: Panel; title: string; subtitle: string; icon: React.ReactNode }> = [
    { id: 'nickname', title: 'Chỉnh sửa biệt danh', subtitle: 'Đặt tên hiển thị riêng cho bạn', icon: <Edit3 /> },
    { id: 'activity', title: 'Nhật ký hoạt động', subtitle: 'Xem các bài viết trên trang cá nhân', icon: <History /> },
    { id: 'archive', title: 'Kho lưu trữ', subtitle: 'Lưu và khôi phục bài viết', icon: <Archive /> },
    { id: 'storyArchive', title: 'Kho lưu trữ tin', subtitle: 'Quản lý ảnh và video đã lưu', icon: <Clock3 /> },
    { id: 'review', title: 'Xem lại bài viết và thẻ', subtitle: 'Kiểm tra nội dung trước khi hiển thị', icon: <Tag /> },
    { id: 'search', title: 'Tìm kiếm', subtitle: 'Tìm trong bài viết của bạn', icon: <Search /> },
    { id: 'visibility', title: 'Chế độ xem', subtitle: 'Bật hoặc tắt xem trang công khai', icon: <Eye /> },
    { id: 'status', title: 'Trạng thái trang cá nhân', subtitle: 'Bật hoặc vô hiệu hóa trang cá nhân', icon: <UserRoundCheck /> },
  ];
  const title: Record<Panel, string> = { menu: 'Quản lý trang cá nhân', nickname: 'Chỉnh sửa biệt danh', activity: 'Nhật ký hoạt động', archive: 'Kho lưu trữ', storyArchive: 'Kho lưu trữ tin', review: 'Xem lại bài viết và thẻ', search: 'Tìm kiếm bài viết', visibility: 'Chế độ xem', status: 'Trạng thái trang cá nhân' };
  const isMenu = panel === 'menu';
  return <div className={isMenu ? 'fixed inset-0 z-[200]' : 'fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4'} onMouseDown={onClose}>
    <section className={isMenu ? 'absolute right-4 top-16 w-[360px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl bg-white dark:bg-[#242526] shadow-2xl border border-gray-200 dark:border-[#393a3b]' : 'w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-[#242526] shadow-2xl'} onMouseDown={(e) => e.stopPropagation()}>
      <header className="sticky top-0 flex items-center justify-between border-b border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] p-4 z-10">
        <div className="flex items-center gap-3">{panel !== 'menu' && <button onClick={() => setPanel('menu')} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"><ArrowLeft size={18}/></button>}<h2 className="font-bold">{title[panel]}</h2></div>
        <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c]"><X size={20}/></button>
      </header>
      {panel === 'menu' && <div className="p-2 text-[#050505] dark:text-[#e4e6eb]">
        <MenuHeading> Nội dung trên trang cá nhân </MenuHeading>
        <MenuItem icon={<Edit3/>} title="Chỉnh sửa biệt danh" onClick={() => setPanel('nickname')} />
        <MenuItem icon={<History/>} title="Nhật ký hoạt động" onClick={() => setPanel('activity')} />
        <MenuItem icon={<Archive/>} title="Kho lưu trữ" onClick={() => setPanel('archive')} />
        <MenuItem icon={<Clock3/>} title="Kho lưu trữ tin" onClick={() => setPanel('storyArchive')} />
        <MenuItem icon={<BookOpenCheck/>} title="Xem lại bài viết và thẻ" onClick={() => setPanel('review')} />
        <MenuItem icon={<Search/>} title="Tìm kiếm" onClick={() => setPanel('search')} />
        <MenuHeading> Chế độ của trang cá nhân </MenuHeading>
        <MenuItem icon={<CircleDotDashed/>} title="Bật chế độ chuyên nghiệp" description="Chế độ chuyên nghiệp không hoạt động khi bạn khóa bảo vệ trang cá nhân." disabled />
        <MenuItem icon={<Lock/>} title="Mở khóa trang cá nhân" onClick={() => setPanel('status')} />
        <MenuHeading> Quyền riêng tư </MenuHeading>
        <MenuItem icon={<Shield/>} title="Cài đặt trang cá nhân và gắn thẻ" onClick={() => { onOpenPrivacy(); onClose(); }} />
        <MenuItem icon={<Lock/>} title="Trung tâm quyền riêng tư" description="Đang phát triển" disabled />
        <MenuItem icon={<Eye/>} title="Chế độ xem" onClick={() => setPanel('visibility')} />
        <MenuHeading> Lựa chọn khác </MenuHeading>
        <MenuItem icon={<PanelTop/>} title="Trạng thái trang cá nhân" onClick={() => setPanel('status')} />
      </div>}
      {panel === 'nickname' && <div className="p-5 space-y-3"><p className="text-sm text-gray-500">Biệt danh chỉ lưu trên thiết bị này.</p><input value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={50} placeholder="Nhập biệt danh" className="w-full rounded-xl border p-3 dark:bg-[#3a3b3c]"/><button onClick={() => save('nickname', nickname.trim())} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Lưu</button></div>}
      {(panel === 'activity' || panel === 'archive' || panel === 'review' || panel === 'search') && <div className="p-4 space-y-3">{panel === 'activity' && <div className="flex gap-2 overflow-x-auto"><button className="rounded-full bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">Bài viết của bạn</button><button className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold dark:bg-[#3a3b3c]">Hoạt động đã lưu</button></div>}{panel === 'review' && <div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">Chọn bài viết để ẩn khỏi trang cá nhân hoặc cho phép hiển thị lại.</div>}{panel === 'search' && <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm kiếm trong bài viết" className="w-full rounded-xl border p-3 dark:bg-[#3a3b3c]"/>}{visiblePosts.length ? visiblePosts.map((post) => <article key={post.id} className="rounded-xl border border-gray-200 dark:border-[#393a3b] p-4"><p className="text-sm line-clamp-3">{post.content || 'Bài viết không có nội dung văn bản'}</p><p className="mt-2 text-xs text-gray-500">{post.createdAt}</p><div className="mt-3 flex justify-end gap-2">{panel !== 'search' && panel !== 'review' && <button onClick={() => toggleArchive(post.id)} className="rounded-lg bg-gray-100 dark:bg-[#3a3b3c] px-3 py-1.5 text-xs font-semibold">{archivedIds.includes(post.id) ? 'Khôi phục vào trang cá nhân' : 'Lưu trữ'}</button>}{panel === 'review' && <button onClick={() => toggleReview(post.id)} className="rounded-lg bg-gray-100 dark:bg-[#3a3b3c] px-3 py-1.5 text-xs font-semibold">{reviewHiddenIds.includes(post.id) ? 'Cho phép hiển thị' : 'Ẩn khỏi trang cá nhân'}</button>}</div></article>) : <p className="py-10 text-center text-sm text-gray-500">Không có nội dung phù hợp.</p>}</div>}
      {panel === 'storyArchive' && <div className="p-5 space-y-4"><p className="text-sm text-gray-500">Các ảnh và video đã tải lên được quản lý trong thư viện Media.</p><button onClick={() => { onOpenMedia(); onClose(); }} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Mở thư viện Media</button></div>}
      {panel === 'visibility' && <div className="p-5 space-y-3"><p className="text-sm text-gray-500">Chọn cách người khác xem trang cá nhân của bạn.</p>{([['PUBLIC','Công khai','Mọi người có thể xem thông tin công khai'],['FRIENDS','Bạn bè','Chỉ bạn bè xem nội dung mặc định'],['PRIVATE','Chỉ mình tôi','Ẩn nội dung trang cá nhân khỏi người khác']] as const).map(([value,label,desc]) => <button key={value} onClick={() => { setViewMode(value); setPublicView(value === 'PUBLIC'); save('view_mode', value); }} className={`w-full rounded-xl border p-4 text-left ${viewMode === value ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#393a3b]'}`}><b>{label}</b><small className="block pt-1 text-gray-500">{desc}</small></button>)}</div>}
      {panel === 'status' && <div className="p-5 space-y-4"><div className="rounded-xl bg-gray-50 p-4 dark:bg-[#3a3b3c]"><b>{profileEnabled ? 'Trang cá nhân đang hoạt động' : 'Trang cá nhân đang bị vô hiệu hóa'}</b><p className="pt-1 text-sm text-gray-500">Khi vô hiệu hóa, trạng thái được lưu và bạn có thể bật lại bất cứ lúc nào.</p></div><button onClick={() => { const next = !profileEnabled; setProfileEnabled(next); save('enabled', String(next)); }} className={`rounded-xl px-4 py-2 font-bold text-white ${profileEnabled ? 'bg-red-600' : 'bg-blue-600'}`}>{profileEnabled ? 'Vô hiệu hóa trang cá nhân' : 'Kích hoạt lại trang cá nhân'}</button></div>}
    </section>
  </div>;
};

const MenuHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="px-2 pt-2 pb-1 text-[17px] font-bold">{children}</h3>;
const MenuItem: React.FC<{ icon: React.ReactNode; title: string; description?: string; disabled?: boolean; onClick?: () => void }> = ({ icon, title, description, disabled, onClick }) => <button disabled={disabled} onClick={onClick} className={`flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left ${disabled ? 'cursor-not-allowed opacity-45' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'}`}><span className="mt-0.5 text-gray-600 dark:text-[#b0b3b8] [&>svg]:h-5 [&>svg]:w-5">{icon}</span><span><b className="block text-[15px] leading-5">{title}</b>{description && <small className="block pt-0.5 text-xs leading-4 text-gray-500 dark:text-[#b0b3b8]">{description}</small>}</span></button>;
