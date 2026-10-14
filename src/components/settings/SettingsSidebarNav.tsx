import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Lock, Shield, Sun, Bell, ArrowLeft, Settings } from 'lucide-react';

export type SettingsSubTab = 'profile' | 'security' | 'privacy' | 'appearance' | 'notifications';

interface SettingsSidebarNavProps {
  activeSubTab: SettingsSubTab;
  onTabChange?: (tab: SettingsSubTab) => void;
}

export const SettingsSidebarNav: React.FC<SettingsSidebarNavProps> = ({
  activeSubTab,
  onTabChange,
}) => {
  const navigate = useNavigate();

  const menuGroups = [
    {
      title: 'Trung tâm tài khoản',
      items: [
        {
          id: 'profile',
          label: 'Hồ sơ cá nhân',
          description: 'Tên, ảnh đại diện, tiểu sử',
          icon: User,
          path: '/settings/profile',
        },
        {
          id: 'security',
          label: 'Mật khẩu và bảo mật',
          description: '2FA, thiết bị đăng nhập',
          icon: Lock,
          path: '/settings/security',
        },
      ],
    },
    {
      title: 'Tùy chọn trải nghiệm',
      items: [
        {
          id: 'appearance',
          label: 'Giao diện & Ngôn ngữ',
          description: 'Chế độ tối, ngôn ngữ',
          icon: Sun,
          path: '/settings/appearance',
        },
        {
          id: 'notifications',
          label: 'Thông báo',
          description: 'Âm thanh, thông báo tương tác',
          icon: Bell,
          path: '/settings/notifications',
        },
      ],
    },
    {
      title: 'Quyền riêng tư & Đối tượng',
      items: [
        {
          id: 'privacy',
          label: 'Quyền riêng tư trang cá nhân',
          description: 'Phạm vi hiển thị bài viết & bạn bè',
          icon: Shield,
          path: '/settings/privacy',
        },
      ],
    },
  ];

  return (
    <aside className="w-full md:w-80 shrink-0 bg-white/80 dark:bg-[#242526]/80 backdrop-blur-md rounded-2xl border border-gray-200/90 dark:border-[#393a3b] shadow-xs p-3.5 space-y-4 h-fit transition-colors select-none">
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

      {/* Header */}
      <div className="px-2 pb-2 border-b border-gray-100 dark:border-[#393a3b] flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1877f2]">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-black text-gray-900 dark:text-[#e4e6eb] leading-tight">
            Cài đặt hệ thống
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-[#8a8d91]">
            Quản lý tài khoản & tùy chọn
          </p>
        </div>
      </div>

      {/* Menu Groups */}
      <div className="space-y-4">
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <h3 className="px-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#8a8d91] mb-1">
              {group.title}
            </h3>
            {group.items.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;

              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  onClick={() => onTabChange?.(tab.id as SettingsSubTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-blue-50 text-[#1877f2] dark:bg-blue-600/15 dark:text-blue-400 font-bold shadow-xs'
                      : 'text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/70 font-medium'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-500 dark:text-[#b0b3b8] group-hover:text-gray-900 dark:group-hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm block truncate leading-tight">
                      {tab.label}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-[#8a8d91] block truncate font-normal mt-0.5">
                      {tab.description}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
};
