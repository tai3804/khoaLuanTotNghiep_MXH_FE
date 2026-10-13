import React from 'react';
import { HelpCircle, RefreshCw, ShieldAlert, CheckCircle2, Clock3 } from 'lucide-react';
import { SubmittedReport } from '../../services/reportService';

interface SupportInboxHeaderProps {
  reports: SubmittedReport[];
  loading: boolean;
  onRefresh: () => void;
}

export const SupportInboxHeader: React.FC<SupportInboxHeaderProps> = ({
  reports,
  loading,
  onRefresh,
}) => {
  const pendingCount = reports.filter((r) => r.status === 'PENDING' || r.status === 'REVIEWING').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm p-4 sm:p-5 mb-4 border border-gray-200 dark:border-[#393a3b] transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[#1877f2] dark:text-[#4599ff] shrink-0 border border-blue-100 dark:border-blue-900/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight">
                Hộp thư hỗ trợ & Báo cáo
              </h1>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1877f2] dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
                Support Inbox
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
              Theo dõi tiến trình xử lý báo cáo vi phạm, phản hồi từ quản trị viên và gửi yêu cầu xem xét lại
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center space-x-2 px-3.5 py-2 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1877f2]' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Quick Stat Badges */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-3 border-t border-gray-100 dark:border-[#393a3b]">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#18191a]/60 border border-gray-100 dark:border-[#393a3b]/50">
          <div className="w-7 h-7 rounded-lg bg-gray-200/70 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] truncate">Tổng báo cáo</p>
            <p className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">{reports.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#18191a]/60 border border-gray-100 dark:border-[#393a3b]/50">
          <div className="w-7 h-7 rounded-lg bg-gray-200/70 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] flex items-center justify-center shrink-0">
            <Clock3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] truncate">Đang xử lý</p>
            <p className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">{pendingCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#18191a]/60 border border-gray-100 dark:border-[#393a3b]/50">
          <div className="w-7 h-7 rounded-lg bg-gray-200/70 dark:bg-[#3a3b3c] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] truncate">Đã giải quyết</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
