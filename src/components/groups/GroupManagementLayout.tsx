import React from 'react';
import {
  LayoutDashboard,
  Clock3,
  Flag,
  MessageSquareWarning,
  Users,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { GroupTab } from './GroupBanner';

interface GroupManagementLayoutProps {
  group: GroupResponse;
  activeTab: GroupTab;
  onNavigate: (tab: GroupTab) => void;
  modCounts?: {
    pendingPosts?: number;
    pendingAppeals?: number;
    reportedPosts?: number;
  } | null;
  children: React.ReactNode;
}

export const isManagementTab = (tab: GroupTab): boolean =>
  ['management', 'pending-posts', 'reports', 'appeals', 'settings'].includes(tab);

/**
 * Bố cục khung điều hành quản lý nhóm chuẩn Facebook:
 * - Cột trái (desktop): Menu thanh điều hướng các công cụ quản trị (Tổng quan, Bài chờ duyệt, Báo cáo, Kháng nghị, Thành viên, Cài đặt).
 * - Cột phải: Nội dung của công cụ đang chọn.
 * - Mobile: Thanh tab cuộn ngang mượt mà phía trên.
 */
export const GroupManagementLayout: React.FC<GroupManagementLayoutProps> = ({
  group,
  activeTab,
  onNavigate,
  modCounts,
  children,
}) => {
  const roleLabel = group.isOwner
    ? 'Chủ nhóm'
    : group.isAdmin
      ? 'Quản trị viên'
      : 'Người kiểm duyệt';

  const navItems = [
    {
      key: 'management' as GroupTab,
      label: 'Tổng quan quản lý',
      icon: <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />,
      badge: undefined,
    },
    ...(group.postApprovalRequired
      ? [
          {
            key: 'pending-posts' as GroupTab,
            label: 'Bài chờ duyệt',
            icon: <Clock3 className="h-4.5 w-4.5 shrink-0" />,
            badge: modCounts?.pendingPosts,
          },
        ]
      : []),
    {
      key: 'reports' as GroupTab,
      label: 'Nội dung bị báo cáo',
      icon: <Flag className="h-4.5 w-4.5 shrink-0" />,
      badge: modCounts?.reportedPosts,
    },
    {
      key: 'appeals' as GroupTab,
      label: 'Kháng nghị',
      icon: <MessageSquareWarning className="h-4.5 w-4.5 shrink-0" />,
      badge: modCounts?.pendingAppeals,
    },
    {
      key: 'members' as GroupTab,
      label: 'Thành viên & Yêu cầu',
      icon: <Users className="h-4.5 w-4.5 shrink-0" />,
      badge: group.pendingRequestCount,
    },
    ...(group.isAdmin
      ? [
          {
            key: 'settings' as GroupTab,
            label: 'Cài đặt nhóm',
            icon: <Settings className="h-4.5 w-4.5 shrink-0" />,
            badge: undefined,
          },
        ]
      : []),
  ];

  return (
    <div className="flex w-full flex-col lg:flex-row justify-between gap-5 lg:gap-6 lg:items-start">
      {/* Điều hướng trên mobile / tablet */}
      <div className="lg:hidden w-full overflow-x-auto no-scrollbar flex gap-2 pb-1">
        {navItems.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                active
                  ? 'bg-[#1877f2] text-white border-[#1877f2] shadow-sm'
                  : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#e4e6eb] border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge ? (
                <span
                  className={`min-w-[18px] h-4.5 rounded-full text-[10px] font-bold flex items-center justify-center px-1 shrink-0 ${
                    active ? 'bg-white text-[#1877f2]' : 'bg-red-500 text-white'
                  }`}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Cột trái điều hướng quản lý trên Desktop */}
      <aside className="hidden lg:block w-[280px] xl:w-[300px] shrink-0 sticky top-[124px] space-y-3">
        <div className="bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#393a3b] p-3 shadow-sm space-y-2.5">
          <div className="px-3 pt-2 pb-2.5 border-b border-gray-100 dark:border-[#393a3b]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#1877f2] dark:bg-blue-900/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-[#e4e6eb] truncate">Công cụ quản lý</h3>
                <p className="text-xs text-[#1877f2] font-semibold">{roleLabel}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer ${
                    active
                      ? 'bg-blue-50 text-[#1877f2] dark:bg-blue-900/25 dark:text-[#2d88ff]'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 truncate">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="min-w-[20px] h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center px-1.5 shrink-0">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Cột phải: Nội dung công cụ quản lý */}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

