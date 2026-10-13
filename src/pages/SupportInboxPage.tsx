import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, RotateCcw, ShieldAlert } from 'lucide-react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { ChatUser } from '../components/chat/chat-box';
import { reportService, SubmittedReport } from '../services/reportService';
import { postService } from '../services/postService';
import { useToast } from '../context/ToastContext';
import { SupportInboxHeader } from '../components/support-inbox/SupportInboxHeader';
import {
  SupportInboxFilters,
  SupportInboxFilterStatus,
} from '../components/support-inbox/SupportInboxFilters';
import { SupportInboxItem } from '../components/support-inbox/SupportInboxItem';
import { SupportInboxEmpty } from '../components/support-inbox/SupportInboxEmpty';
import { SupportInboxAppealModal } from '../components/support-inbox/SupportInboxAppealModal';

interface SupportInboxPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  activeSidebarFilter?: string;
  setActiveSidebarFilter?: (filter: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (uid?: string) => void;
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

export const SupportInboxPage: React.FC<SupportInboxPageProps> = ({
  activeNavTab,
  setActiveNavTab,
  activeSidebarFilter = 'support',
  setActiveSidebarFilter,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
  activeChatUser,
  setActiveChatUser,
}) => {
  const [inboxTab, setInboxTab] = useState<'reports' | 'appeals'>('reports');
  const [reports, setReports] = useState<SubmittedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupportInboxFilterStatus>('ALL');
  const [appealReportId, setAppealReportId] = useState<string | null>(null);

  // Moderated post appeals state (from dev)
  const [moderatedItems, setModeratedItems] = useState<any[]>([]);
  const [moderatedLoading, setModeratedLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [appealMessage, setAppealMessage] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  const toast = useToast();

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load support inbox reports:', err);
      toast.showError('Không thể tải danh sách báo cáo hỗ trợ.');
    } finally {
      setLoading(false);
    }
  };

  const loadModeratedPosts = async () => {
    setModeratedLoading(true);
    try {
      const response = await postService.getMyModerationAppeals();
      setModeratedItems(Array.isArray(response) ? response : []);
    } catch {
      setModeratedItems([]);
    } finally {
      setModeratedLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    loadModeratedPosts();
  }, []);

  const handleAppealSubmit = async (reportId: string, message: string) => {
    try {
      await reportService.appeal(reportId, message);
      toast.showSuccess('Đã gửi yêu cầu xem xét lại thành công!');
      loadReports();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể gửi yêu cầu xem xét lại.';
      toast.showError(msg);
      throw err;
    }
  };

  const submitPostAppeal = async () => {
    if (!selectedPostId || !appealMessage.trim()) {
      toast.showError('Vui lòng nhập lý do kháng nghị.');
      return;
    }
    setSubmittingAppeal(true);
    try {
      await postService.appealModeratedPost(selectedPostId, appealMessage.trim());
      toast.showSuccess('Đã gửi kháng nghị. Kiểm duyệt viên sẽ xem xét bài viết của bạn.');
      setSelectedPostId(null);
      setAppealMessage('');
      await loadModeratedPosts();
    } catch {
      toast.showError('Không thể gửi kháng nghị bài viết.');
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const statusCounts = useMemo<Record<SupportInboxFilterStatus, number>>(() => {
    return {
      ALL: reports.length,
      PENDING: reports.filter((r) => r.status === 'PENDING').length,
      REVIEWING: reports.filter((r) => r.status === 'REVIEWING').length,
      RESOLVED: reports.filter((r) => r.status === 'RESOLVED').length,
      DISMISSED: reports.filter((r) => r.status === 'DISMISSED').length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (statusFilter !== 'ALL' && report.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesReason = report.reason?.toLowerCase().includes(query);
        const matchesDesc = report.description?.toLowerCase().includes(query);
        const matchesTargetId = report.targetId?.toLowerCase().includes(query);
        const matchesReportId = report.reportId?.toLowerCase().includes(query);
        if (!matchesReason && !matchesDesc && !matchesTargetId && !matchesReportId) {
          return false;
        }
      }
      return true;
    });
  }, [reports, statusFilter, searchQuery]);

  const isFiltered = statusFilter !== 'ALL' || !!searchQuery.trim();

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      <Header
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onNavigateProfile}
        onNavigateAuth={onNavigateAuth}
        onSelectChatUser={setActiveChatUser}
      />

      <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
        <SidebarLeft
          activeFilter={activeSidebarFilter || 'support'}
          onFilterChange={(f) => {
            if (setActiveSidebarFilter) setActiveSidebarFilter(f);
            setActiveNavTab(f);
          }}
          onNavigateProfile={() => onNavigateProfile()}
          onNavigateSettings={onNavigateSettings}
        />

        <main className="flex-1 max-w-[740px] xl:max-w-[800px] 2xl:max-w-[860px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          <SupportInboxHeader
            reports={reports}
            loading={loading || moderatedLoading}
            onRefresh={() => {
              loadReports();
              loadModeratedPosts();
            }}
          />

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mb-4 bg-white dark:bg-[#242526] p-1.5 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-2xs">
            <button
              type="button"
              onClick={() => setInboxTab('reports')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                inboxTab === 'reports'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-[#1877f2] dark:text-[#4599ff] border border-blue-100 dark:border-blue-900/40 shadow-xs'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
              }`}
            >
              <span>Báo cáo bạn đã gửi</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-[#3a3b3c] font-black">
                {reports.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setInboxTab('appeals')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                inboxTab === 'appeals'
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 shadow-xs'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
              }`}
            >
              <span>Bài viết bị kiểm duyệt</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-[#3a3b3c] font-black">
                {moderatedItems.length}
              </span>
            </button>
          </div>

          {inboxTab === 'reports' ? (
            <>
              <SupportInboxFilters
                activeStatus={statusFilter}
                onStatusChange={setStatusFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                counts={statusCounts}
              />

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
                  <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-[#b0b3b8]">
                    Đang tải danh sách báo cáo hỗ trợ...
                  </p>
                </div>
              ) : filteredReports.length === 0 ? (
                <SupportInboxEmpty
                  isFiltered={isFiltered}
                  onClearFilters={() => {
                    setStatusFilter('ALL');
                    setSearchQuery('');
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {filteredReports.map((report) => (
                    <SupportInboxItem
                      key={report.reportId}
                      report={report}
                      onOpenAppeal={(id) => setAppealReportId(id)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Moderated Posts & Appeals Tab */
            <div className="space-y-3">
              {moderatedLoading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-[#b0b3b8]">
                    Đang tải danh sách bài viết bị kiểm duyệt...
                  </p>
                </div>
              ) : moderatedItems.length === 0 ? (
                <div className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] p-8 text-center text-gray-500 dark:text-[#b0b3b8]">
                  <ShieldAlert className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Không có bài viết nào bị xử lý</p>
                  <p className="text-xs mt-1">Tất cả bài viết của bạn đều tuân thủ đúng tiêu chuẩn cộng đồng.</p>
                </div>
              ) : (
                moderatedItems.map((item) => (
                  <article
                    key={item.postId}
                    className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-[#242526] p-4 sm:p-5 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="mt-0.5 shrink-0 text-amber-500" size={22} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {actionLabel(item.moderationAction)}
                          </h3>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            item.appealStatus === 'ACCEPTED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : item.appealStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {appealLabel(item.appealStatus)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 dark:text-[#b0b3b8]">
                          Lý do: {item.moderationReason || 'Nội dung đã bị kiểm duyệt'}
                        </p>
                        {item.updatedAt && (
                          <p className="mt-0.5 text-[11px] text-gray-400">
                            Cập nhật: {new Date(item.updatedAt).toLocaleString('vi-VN')}
                          </p>
                        )}
                        <div className="mt-3 rounded-xl bg-gray-50 dark:bg-[#18191a] p-3 border border-gray-100 dark:border-[#393a3b]">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Nội dung bài viết
                          </p>
                          <p className="whitespace-pre-wrap break-words text-xs text-gray-800 dark:text-[#e4e6eb]">
                            {item.content || 'Nội dung bài viết không còn khả dụng.'}
                          </p>
                        </div>
                        {item.appealMessage && (
                          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                            Lý do bạn đã gửi: {item.appealMessage}
                          </p>
                        )}
                        {item.appealReviewNote && (
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                            Phản hồi kiểm duyệt: {item.appealReviewNote}
                          </p>
                        )}
                        {!item.appealStatus && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPostId(item.postId);
                              setAppealMessage('');
                            }}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#1877f2] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#166fe5] cursor-pointer"
                          >
                            <RotateCcw size={14} /> Kháng nghị quyết định
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </main>

        <SidebarRight onSelectChatUser={(u) => setActiveChatUser(u)} />
      </div>

      <SupportInboxAppealModal
        reportId={appealReportId}
        onClose={() => setAppealReportId(null)}
        onSubmit={handleAppealSubmit}
      />

      {/* Moderated Post Appeal Modal */}
      {selectedPostId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-[520px] rounded-2xl bg-white dark:bg-[#242526] p-6 shadow-2xl border border-gray-200 dark:border-[#393a3b]">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Gửi kháng nghị bài viết</h2>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-[#b0b3b8]">
              Hãy nêu rõ lý do để kiểm duyệt viên xem xét lại quyết định xử lý bài viết này.
            </p>
            <textarea
              value={appealMessage}
              onChange={(event) => setAppealMessage(event.target.value)}
              placeholder="Ví dụ: Bài viết của tôi chia sẻ góc nhìn khách quan và không hề mang tính chất xúc phạm ai..."
              className="mt-3.5 min-h-[130px] w-full resize-y rounded-xl border border-gray-300 dark:border-[#393a3b] bg-gray-50 dark:bg-[#18191a] p-3 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1877f2]/40"
            />
            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedPostId(null)}
                disabled={submittingAppeal}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void submitPostAppeal()}
                disabled={submittingAppeal || !appealMessage.trim()}
                className="rounded-xl bg-[#1877f2] px-4 py-2 text-xs font-bold text-white hover:bg-[#166fe5] disabled:opacity-50 cursor-pointer"
              >
                {submittingAppeal ? 'Đang gửi...' : 'Gửi kháng nghị'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
