import React from 'react';
import {
  FileText,
  MessageSquare,
  User,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldOff,
  RotateCcw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SubmittedReport } from '../../services/reportService';

interface SupportInboxItemProps {
  report: SubmittedReport;
  onOpenAppeal: (reportId: string) => void;
}

const reasonLabels: Record<string, { label: string; badgeClass: string }> = {
  SPAM: {
    label: 'Spam & Quảng cáo',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40',
  },
  HARASSMENT: {
    label: 'Quấy rối / Đe dọa',
    badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800/40',
  },
  HATE_SPEECH: {
    label: 'Ngôn từ thù ghét',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/40',
  },
  INAPPROPRIATE_CONTENT: {
    label: 'Nội dung nhạy cảm / Khiêu dâm',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/40',
  },
  VIOLENCE: {
    label: 'Bạo lực nguy hiểm',
    badgeClass: 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800/40',
  },
  FALSE_INFORMATION: {
    label: 'Thông tin sai lệch',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/40',
  },
  COPYRIGHT: {
    label: 'Vi phạm bản quyền',
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40',
  },
  OTHER: {
    label: 'Lý do khác',
    badgeClass: 'bg-gray-50 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  },
};

const statusConfig: Record<
  SubmittedReport['status'],
  { label: string; icon: any; badgeClass: string; desc: string }
> = {
  PENDING: {
    label: 'Đang chờ xử lý',
    icon: Clock,
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50',
    desc: 'Báo cáo của bạn đã được tiếp nhận và đang xếp trong hàng chờ của kiểm duyệt viên.',
  },
  REVIEWING: {
    label: 'Đang xem xét',
    icon: Sparkles,
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
    desc: 'Kiểm duyệt viên đang tiến hành kiểm tra nội dung bài viết và đối chiếu với tiêu chuẩn cộng đồng.',
  },
  RESOLVED: {
    label: 'Đã xử lý vi phạm',
    icon: CheckCircle2,
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50',
    desc: 'Nội dung vi phạm đã bị xử lý theo đúng quy định. Cảm ơn bạn đã đóng góp xây dựng môi trường lành mạnh!',
  },
  DISMISSED: {
    label: 'Không vi phạm',
    icon: ShieldOff,
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    desc: 'Sau khi kiểm tra, ban quản trị nhận thấy nội dung này chưa vi phạm tiêu chuẩn cộng đồng.',
  },
};

export const SupportInboxItem: React.FC<SupportInboxItemProps> = ({ report, onOpenAppeal }) => {
  const reasonInfo = reasonLabels[report.reason] || {
    label: report.reason,
    badgeClass: 'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  };

  const statusInfo = statusConfig[report.status] || {
    label: report.status,
    icon: HelpCircle,
    badgeClass: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    desc: '',
  };

  const StatusIcon = statusInfo.icon;

  const targetTypeIcon =
    report.targetType === 'COMMENT' ? (
      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
    ) : report.targetType === 'USER' ? (
      <User className="w-3.5 h-3.5 text-purple-500" />
    ) : (
      <FileText className="w-3.5 h-3.5 text-emerald-500" />
    );

  const targetTypeName =
    report.targetType === 'COMMENT'
      ? 'Bình luận'
      : report.targetType === 'USER'
        ? 'Tài khoản'
        : 'Bài viết';

  const canAppeal =
    (report.status === 'RESOLVED' || report.status === 'DISMISSED') && !report.appealedAt;

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-4 sm:p-5 border border-gray-200 dark:border-[#393a3b] shadow-xs hover:shadow-sm transition duration-150 space-y-3.5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-gray-100 dark:border-[#393a3b]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] text-xs font-semibold">
            {targetTypeIcon}
            <span>{targetTypeName}</span>
          </span>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${reasonInfo.badgeClass}`}
          >
            {reasonInfo.label}
          </span>
        </div>

        {/* Status Pill */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusInfo.badgeClass}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          <span>{statusInfo.label}</span>
        </span>
      </div>

      {/* Description Content */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Mô tả vi phạm bạn đã gửi:
        </p>
        <p className="text-xs text-gray-700 dark:text-[#e4e6eb] bg-gray-50 dark:bg-[#18191a]/60 p-3 rounded-xl border border-gray-100 dark:border-[#393a3b]/40 italic leading-relaxed">
          "{report.description || 'Không có mô tả chi tiết kèm theo.'}"
        </p>
      </div>

      {/* Moderator Decision Explanation */}
      {statusInfo.desc && (
        <div className="text-[11px] text-gray-500 dark:text-[#b0b3b8] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{statusInfo.desc}</span>
        </div>
      )}

      {/* User's Appeal Section if present */}
      {report.appealedAt && (
        <div className="bg-blue-50/70 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-200/60 dark:border-blue-800/40 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-blue-700 dark:text-blue-300 font-bold">
            <span className="flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              Yêu cầu xem xét lại (Appeal):
            </span>
            <span className="font-normal text-blue-600/80 dark:text-blue-400 text-[10px]">
              {new Date(report.appealedAt).toLocaleString('vi-VN')}
            </span>
          </div>
          <p className="text-xs text-blue-900 dark:text-blue-200 italic">
            "{report.appealMessage || 'Đã gửi yêu cầu xem xét lại.'}"
          </p>
        </div>
      )}

      {/* Footer Info & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-[#393a3b]">
        <div className="space-y-0.5 text-[11px] text-gray-400">
          <p>Thời gian gửi: {new Date(report.createdAt).toLocaleString('vi-VN')}</p>
          {report.resolvedAt && (
            <p className="text-emerald-600 dark:text-emerald-400 font-medium">
              Hoàn tất xử lý: {new Date(report.resolvedAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>

        {canAppeal && (
          <button
            type="button"
            onClick={() => onOpenAppeal(report.reportId)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877f2] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yêu cầu xem xét lại</span>
          </button>
        )}
      </div>
    </div>
  );
};
