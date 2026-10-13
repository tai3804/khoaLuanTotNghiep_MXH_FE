import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { ChatUser } from '../components/chat/chat-box';
import { reportService, SubmittedReport } from '../services/reportService';
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
  const [reports, setReports] = useState<SubmittedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupportInboxFilterStatus>('ALL');
  const [appealReportId, setAppealReportId] = useState<string | null>(null);

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

  useEffect(() => {
    loadReports();
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
            loading={loading}
            onRefresh={loadReports}
          />

          <SupportInboxFilters
            activeStatus={statusFilter}
            onStatusChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            counts={statusCounts}
          />

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
              <p className="mt-3 text-xs font-semibold text-gray-500 dark:text-[#b0b3b8]">
                Đang tải danh sách báo cáo của bạn...
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
            <SupportInboxEmpty
              isFiltered={isFiltered}
              onClearFilters={() => {
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              onNavigateHome={() => setActiveNavTab('home')}
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
        </main>

        <SidebarRight onSelectChatUser={(u) => setActiveChatUser(u)} />
      </div>

      <SupportInboxAppealModal
        reportId={appealReportId}
        onClose={() => setAppealReportId(null)}
        onSubmit={handleAppealSubmit}
      />
    </div>
  );
};
