import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock3,
  Sparkles,
  History,
  AlertTriangle,
  ShieldCheck,
  ArrowLeft,
  Shield,
  Layers,
  User,
  Bot,
} from 'lucide-react';

export type ModeratorTab = 'queue' | 'ai' | 'history' | 'appeals';

export interface ModeratorSidebarNavProps {
  currentTab: ModeratorTab;
  onSelectTab: (tab: ModeratorTab) => void;
  pendingCount: number;
  aiFlaggedCount: number;
  logsCount: number;
  appealsCount: number;
  sourceFilter?: 'ALL' | 'USER' | 'AI';
  onSourceFilterChange?: (source: 'ALL' | 'USER' | 'AI') => void;
  userReportCount?: number;
  aiReportCount?: number;
  isAdmin?: boolean;
}

export const ModeratorSidebarNav: React.FC<ModeratorSidebarNavProps> = ({
  currentTab,
  onSelectTab,
  pendingCount,
  aiFlaggedCount,
  logsCount,
  appealsCount,
  sourceFilter = 'ALL',
  onSourceFilterChange,
  userReportCount = 0,
  aiReportCount = 0,
  isAdmin = false,
}) => {
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'queue' as const,
      label: 'Hàng chờ báo cáo',
      description: 'Báo cáo vi phạm đang chờ xử lý',
      icon: Clock3,
      count: pendingCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'ai' as const,
      label: 'AI gắn cờ',
      description: 'Nội dung AI tự động phát hiện',
      icon: Sparkles,
      count: aiFlaggedCount,
      badgeColor: 'bg-purple-600 text-white',
    },
    {
      id: 'history' as const,
      label: 'Nhật ký & Hoàn tác',
      description: 'Lịch sử thao tác kiểm duyệt',
      icon: History,
      count: logsCount,
      badgeColor: 'bg-gray-500 dark:bg-gray-600 text-white',
    },
    {
      id: 'appeals' as const,
      label: 'Kháng nghị',
      description: 'Yêu cầu xem xét lại từ tác giả',
      icon: AlertTriangle,
      count: appealsCount,
      badgeColor: 'bg-amber-500 text-white',
    },
  ];

  return (
    <aside className="sticky top-14 shrink-0 h-[calc(100vh-3.5rem)] w-[260px] xl:w-[280px] hidden lg:flex flex-col justify-between px-3 py-4 bg-white/70 dark:bg-[#242526]/70 backdrop-blur-md border-r border-gray-200/80 dark:border-[#393a3b] select-none transition-colors overflow-y-auto">
      <div className="space-y-4">
        {/* Back to Home Button */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-[#b0b3b8] dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer group w-full"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Quay lại Bảng tin</span>
          </button>
        </div>

        {/* Header Title */}
        <div className="px-2 pt-1 pb-2 border-b border-gray-200/60 dark:border-[#393a3b]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight">
                Trung tâm kiểm duyệt
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8]">
                Bảo vệ cộng đồng & Tiêu chuẩn
              </p>
            </div>
          </div>
        </div>

        {/* Main Moderation Navigation Items */}
        <div className="space-y-1">
          <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91]">
            Hạng mục duyệt
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <div key={item.id} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-600/15 dark:text-blue-400 font-bold shadow-xs'
                      : 'text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/70 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-[#b0b3b8]'
                      }`}
                    />
                    <div className="truncate">
                      <span className="text-xs sm:text-sm block truncate">{item.label}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                        : item.count > 0
                        ? item.badgeColor
                        : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8]'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>

                {/* Sub-sources when Queue Tab is active */}
                {item.id === 'queue' && isActive && onSourceFilterChange && (
                  <div className="ml-5 pl-2.5 border-l-2 border-blue-200 dark:border-blue-900/50 space-y-0.5 py-1">
                    <button
                      type="button"
                      onClick={() => onSourceFilterChange('ALL')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        sourceFilter === 'ALL'
                          ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30'
                          : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3" />
                        <span>Tất cả nguồn</span>
                      </div>
                      <span className="text-[10px] font-semibold">{pendingCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSourceFilterChange('USER')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        sourceFilter === 'USER'
                          ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30'
                          : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <span>Người dùng</span>
                      </div>
                      <span className="text-[10px] font-semibold">{userReportCount}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSourceFilterChange('AI')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        sourceFilter === 'AI'
                          ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30'
                          : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Bot className="w-3 h-3" />
                        <span>AI gắn cờ</span>
                      </div>
                      <span className="text-[10px] font-semibold">{aiReportCount}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Admin Links */}
      <div className="pt-3 border-t border-gray-200/60 dark:border-[#393a3b] space-y-2">
        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl transition cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Hệ thống Admin</span>
            </div>
            <span className="text-[10px] text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-500 dark:text-[#b0b3b8] bg-gray-50 dark:bg-[#1a1b1c] rounded-xl border border-gray-100 dark:border-[#393a3b]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">Chế độ Kiểm duyệt viên</span>
        </div>
      </div>
    </aside>
  );
};
