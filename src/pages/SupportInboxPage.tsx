import { useEffect, useState } from 'react';
import { Loader2, RotateCcw, ShieldAlert } from 'lucide-react';
import { Header } from '../components/layout/header-bar';
import type { ChatUser } from '../components/chat/chat-box';
import { postService } from '../services/postService';
import { useToast } from '../context/ToastContext';

interface SupportInboxPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (userId?: string) => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

const actionLabel = (action?: string) =>
  action === 'HIDE_POST' ? 'Bài viết đã bị ẩn' : 'Bài viết đã bị gỡ';

const appealLabel = (status?: string) => {
  if (status === 'PENDING') return 'Đang chờ kiểm duyệt viên xem xét';
  if (status === 'ACCEPTED') return 'Đã chấp nhận — bài viết đã được khôi phục';
  if (status === 'REJECTED') return 'Đã bác bỏ';
  return 'Chưa kháng nghị';
};

export function SupportInboxPage({
  activeNavTab,
  setActiveNavTab,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
  activeChatUser,
  setActiveChatUser,
}: SupportInboxPageProps) {
  const toast = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [appealMessage, setAppealMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await postService.getMyModerationAppeals();
      setItems(Array.isArray(response) ? response : []);
    } catch {
      setItems([]);
      toast.showError('Không tải được các quyết định kiểm duyệt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const submitAppeal = async () => {
    if (!selectedPostId || !appealMessage.trim()) {
      toast.showError('Vui lòng nhập lý do kháng nghị.');
      return;
    }
    setSubmitting(true);
    try {
      await postService.appealModeratedPost(selectedPostId, appealMessage.trim());
      toast.showSuccess('Đã gửi kháng nghị. Kiểm duyệt viên sẽ xem xét bài viết của bạn.');
      setSelectedPostId(null);
      setAppealMessage('');
      await load();
    } catch {
      toast.showError('Không thể gửi kháng nghị.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onNavigateProfile}
        onNavigateAuth={onNavigateAuth}
        onSelectChatUser={setActiveChatUser}
      />
      <main className="min-h-screen bg-[#18191a] pt-[76px] text-white">
        <div className="mx-auto w-full max-w-[940px] px-5 py-9">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-[#1877f2]">Hộp thư hỗ trợ</p>
          <h1 className="text-3xl font-extrabold">Bài viết bị kiểm duyệt</h1>
          <p className="mt-2 text-[#b0b3b8]">
            Theo dõi quyết định với từng bài viết và gửi kháng nghị khi cần.
          </p>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-xl font-bold">Quyết định kiểm duyệt</h2>
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-[#303030] px-4 py-2 font-semibold transition hover:bg-[#3a3b3c] disabled:opacity-60"
            >
              <RotateCcw size={17} className={loading ? 'animate-spin' : ''} /> Làm mới
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#1877f2]" size={32} /></div>
          ) : items.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-[#3e4042] bg-[#242526] p-8 text-center text-[#b0b3b8]">
              Chưa có bài viết bị ẩn hoặc gỡ.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <article key={item.postId} className="rounded-2xl border border-[#b99922] bg-[#242526] p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 shrink-0 text-[#f59e0b]" size={23} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold">{actionLabel(item.moderationAction)}</h3>
                      <p className="mt-1 text-sm text-[#b0b3b8]">Lý do: {item.moderationReason || 'Nội dung đã bị kiểm duyệt'}</p>
                      {item.updatedAt && (
                        <p className="mt-1 text-xs text-[#8a8d91]">Cập nhật: {new Date(item.updatedAt).toLocaleString('vi-VN')}</p>
                      )}
                      <div className="mt-4 rounded-xl bg-[#18191a] p-4">
                        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#8a8d91]">Nội dung bài viết</p>
                        <p className="whitespace-pre-wrap break-words text-[#e4e6eb]">
                          {item.content || 'Nội dung bài viết không còn khả dụng.'}
                        </p>
                      </div>
                      <p className="mt-3 text-xs text-[#8a8d91]">Mã bài viết: {item.postId}</p>
                      <p className={`mt-3 text-sm font-bold ${item.appealStatus === 'ACCEPTED' ? 'text-[#31a24c]' : item.appealStatus === 'REJECTED' ? 'text-[#f02849]' : 'text-[#f59e0b]'}`}>
                        {appealLabel(item.appealStatus)}
                      </p>
                      {item.appealMessage && <p className="mt-2 text-sm text-[#d0d2d6]">Lý do bạn đã gửi: {item.appealMessage}</p>}
                      {item.appealReviewNote && <p className="mt-2 text-sm text-[#d0d2d6]">Phản hồi kiểm duyệt: {item.appealReviewNote}</p>}
                      {!item.appealStatus && (
                        <button
                          type="button"
                          onClick={() => { setSelectedPostId(item.postId); setAppealMessage(''); }}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1877f2] px-4 py-2.5 font-bold transition hover:bg-[#166fe5]"
                        >
                          <RotateCcw size={18} /> Kháng nghị quyết định
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedPostId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-[560px] rounded-2xl bg-[#242526] p-6 shadow-2xl">
            <h2 className="text-xl font-extrabold text-white">Gửi kháng nghị bài viết</h2>
            <p className="mt-2 text-sm text-[#b0b3b8]">Hãy nêu rõ lý do để kiểm duyệt viên xem xét lại quyết định này.</p>
            <textarea
              value={appealMessage}
              onChange={(event) => setAppealMessage(event.target.value)}
              placeholder="Ví dụ: Bài viết của tôi không vi phạm chính sách vì..."
              className="mt-4 min-h-[150px] w-full resize-y rounded-xl border border-[#65676b] bg-[#3a3b3c] p-4 text-white outline-none placeholder:text-[#b0b3b8] focus:border-[#1877f2]"
            />
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setSelectedPostId(null)} disabled={submitting} className="rounded-lg px-4 py-2.5 font-bold text-[#e4e6eb] hover:bg-[#3a3b3c]">Hủy</button>
              <button type="button" onClick={() => void submitAppeal()} disabled={submitting || !appealMessage.trim()} className="rounded-lg bg-[#1877f2] px-5 py-2.5 font-bold text-white hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? 'Đang gửi...' : 'Gửi kháng nghị'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
