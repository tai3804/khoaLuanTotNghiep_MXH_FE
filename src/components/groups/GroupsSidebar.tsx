import React from 'react';
import { Globe, Lock, Plus, Users } from 'lucide-react';
import { useNavigate, useMatch } from 'react-router-dom';
import { GroupResponse } from '../../services/groupService';
import { Skeleton } from '../common/Skeleton';
import { GroupAvatar } from './GroupCover';
import { GROUPS_HUB_NAV, GroupsHubTab } from './groupsHub';
import { roleLabelOf } from './GroupCard';

interface GroupsSidebarProps {
  activeTab: GroupsHubTab | null;
  onSelectTab: (tab: GroupsHubTab) => void;
  onCreateGroupClick: () => void;
  joined: GroupResponse[];
  joinedTotal: number;
  loading: boolean;
  loadError: boolean;
  onRetry: () => void;
  inviteCount: number;
}

const GroupListItem: React.FC<{ group: GroupResponse; active: boolean; onOpen: (id: string) => void }> = ({ group, active, onOpen }) => {
  const role = roleLabelOf(group);
  return (
    <button
      type="button"
      onClick={() => onOpen(group.id)}
      aria-current={active ? 'page' : undefined}
      className={`w-full text-left flex items-center gap-3 p-2 rounded-xl cursor-pointer transition group ${
        active ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
      }`}
    >
      <GroupAvatar name={group.name} seed={group.id} coverUrl={group.coverUrl} className="w-11 h-11" />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate group-hover:text-[#1877f2] transition">
          {group.name}
        </h4>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
          {group.privacy === 'PUBLIC' ? <Globe className="w-3 h-3 shrink-0" /> : <Lock className="w-3 h-3 shrink-0" />}
          <span className="truncate">{group.memberCount.toLocaleString('vi-VN')} thành viên</span>
          {role && <span className="text-[#1877f2] dark:text-[#4599ff] font-semibold shrink-0">· {role}</span>}
        </div>
      </div>
    </button>
  );
};

export const GroupsSidebar: React.FC<GroupsSidebarProps> = ({
  activeTab,
  onSelectTab,
  onCreateGroupClick,
  joined,
  joinedTotal,
  loading,
  loadError,
  onRetry,
  inviteCount,
}) => {
  const navigate = useNavigate();
  const activeMatch = useMatch('/groups/:id');
  const open = (id: string) => navigate(`/groups/${id}`);

  // Nhóm mình điều hành tách riêng (giống "Nhóm do bạn quản lý" của Facebook)
  const managed = joined.filter((g) => g.isOwner || g.isAdmin || g.isModerator);
  const others = joined.filter((g) => !(g.isOwner || g.isAdmin || g.isModerator));

  return (
    <aside
      aria-label="Điều hướng nhóm"
      className="hidden md:flex w-[320px] lg:w-[360px] shrink-0 flex-col bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-[#393a3b] h-[calc(100vh-3.5rem)] sticky top-14"
    >
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e4e6eb]">Nhóm</h1>
      </div>

      <nav className="px-2 space-y-0.5" aria-label="Mục nhóm">
        {GROUPS_HUB_NAV.map(({ tab, label, icon: Icon }) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left transition cursor-pointer ${
                active ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
              }`}
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  active ? 'bg-[#1877f2] text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className={`flex-1 text-[15px] font-semibold ${active ? 'text-[#1877f2] dark:text-[#4599ff]' : 'text-gray-900 dark:text-[#e4e6eb]'}`}>
                {label}
              </span>
              {tab === 'invites' && inviteCount > 0 && (
                <span
                  aria-label={`${inviteCount} lời mời mới`}
                  className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center"
                >
                  {inviteCount > 99 ? '99+' : inviteCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pt-3 pb-2">
        <button
          type="button"
          onClick={onCreateGroupClick}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-[#1877f2] dark:text-[#4599ff] bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition font-bold text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Tạo nhóm mới
        </button>
      </div>

      <div className="mx-4 border-t border-gray-200 dark:border-[#393a3b]" />

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {loading ? (
          <div className="space-y-2 px-1" aria-busy="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="text" width="70%" height="0.9rem" />
                  <Skeleton variant="text" width="45%" height="0.7rem" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-red-500">Không tải được danh sách nhóm của bạn.</p>
            <button type="button" onClick={onRetry} className="mt-2 text-xs font-bold text-[#1877f2] hover:underline cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : joined.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center text-gray-400">
            <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="font-semibold text-xs text-gray-600 dark:text-gray-300">Chưa có nhóm nào</p>
            <p className="text-[11px] mt-1">Hãy tham gia hoặc tạo nhóm mới để kết nối!</p>
          </div>
        ) : (
          <>
            {managed.length > 0 && (
              <section>
                <h3 className="px-2 pb-1 text-[13px] font-bold text-gray-500 dark:text-[#b0b3b8]">Nhóm do bạn quản lý</h3>
                <div className="space-y-0.5">
                  {managed.map((g) => (
                    <GroupListItem key={g.id} group={g} active={activeMatch?.params.id === g.id} onOpen={open} />
                  ))}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h3 className="px-2 pb-1 text-[13px] font-bold text-gray-500 dark:text-[#b0b3b8]">
                  Nhóm bạn đã tham gia{joinedTotal > joined.length ? ` (${joinedTotal})` : ''}
                </h3>
                <div className="space-y-0.5">
                  {others.map((g) => (
                    <GroupListItem key={g.id} group={g} active={activeMatch?.params.id === g.id} onOpen={open} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </aside>
  );
};
