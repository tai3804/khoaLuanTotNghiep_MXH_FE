import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { GroupsSidebar } from '../components/groups/GroupsSidebar';
import { GroupsDiscover } from '../components/groups/GroupsDiscover';
import { GroupsFeed } from '../components/groups/GroupsFeed';
import { GROUPS_HUB_NAV, GroupsHubTab, isGroupsHubTab } from '../components/groups/groupsHub';
import { Header } from '../components/layout/header-bar';
import { ChatUser } from '../components/chat/chat-box';
import { CreateCommunityGroupModal } from '../components/groups/CreateCommunityGroupModal';
import { Skeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { groupService, GroupResponse } from '../services/groupService';

interface GroupsPageProps {
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

export const GroupsPage: React.FC<GroupsPageProps> = (props) => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Nhóm mình tham gia + số lời mời: dùng chung cho thanh bên, thẻ mobile và bảng feed
  const [joined, setJoined] = useState<GroupResponse[]>([]);
  const [joinedTotal, setJoinedTotal] = useState(0);
  const [inviteCount, setInviteCount] = useState(0);
  const [hubLoading, setHubLoading] = useState(true);
  const [hubError, setHubError] = useState(false);
  const requestSeq = useRef(0);

  const loadHub = useCallback(async () => {
    const seq = ++requestSeq.current;
    try {
      setHubError(false);
      const [joinedPage, invitedPage] = await Promise.all([
        groupService.getGroups({ scope: 'joined', page: 1, size: 50 }),
        groupService.getGroups({ scope: 'invited', page: 1, size: 1 }).catch(() => null),
      ]);
      if (seq !== requestSeq.current) return;
      setJoined(joinedPage.groups);
      setJoinedTotal(joinedPage.totalElements);
      setInviteCount(invitedPage?.totalElements ?? 0);
    } catch {
      if (seq !== requestSeq.current) return;
      setJoined([]);
      setJoinedTotal(0);
      setHubError(true);
    } finally {
      if (seq === requestSeq.current) setHubLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHub();
    window.addEventListener('community_group_created', loadHub);
    window.addEventListener('community_group_updated', loadHub);
    return () => {
      window.removeEventListener('community_group_created', loadHub);
      window.removeEventListener('community_group_updated', loadHub);
    };
  }, [loadHub, user?.id]);

  // Tab nằm trên URL (?tab=...); chưa chọn thì vào Bảng feed, hoặc Khám phá nếu mình chưa có nhóm nào
  const tabParam = searchParams.get('tab');
  const tab: GroupsHubTab | null = isGroupsHubTab(tabParam)
    ? tabParam
    : hubLoading
      ? null
      : hubError || joinedTotal > 0
        ? 'feed'
        : 'discover';

  const selectTab = useCallback((next: GroupsHubTab) => {
    setSearchParams({ tab: next });
    window.scrollTo({ top: 0 });
  }, [setSearchParams]);

  // Bảng feed tải lại khi tập nhóm mình tham gia thay đổi (vào/rời nhóm)
  const feedRefreshKey = useMemo(() => joined.map((g) => g.id).sort().join(','), [joined]);

  const openCreateModal = () => setShowCreateModal(true);

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
      <Header
        activeTab={props.activeNavTab}
        onTabChange={props.setActiveNavTab}
        onNavigateSettings={props.onNavigateSettings}
        onNavigateProfile={props.onNavigateProfile}
        onNavigateAuth={props.onNavigateAuth}
        onSelectChatUser={props.setActiveChatUser}
      />

      <div className="flex-1 flex pt-14">
        <GroupsSidebar
          activeTab={tab}
          onSelectTab={selectTab}
          onCreateGroupClick={openCreateModal}
          joined={joined}
          joinedTotal={joinedTotal}
          loading={hubLoading}
          loadError={hubError}
          onRetry={() => void loadHub()}
          inviteCount={inviteCount}
        />

        <main className="flex-1 min-w-0">
          {/* Điện thoại: thanh tab cuộn ngang thay cho cột bên trái */}
          <nav
            aria-label="Mục nhóm"
            className="md:hidden sticky top-14 z-20 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b]"
          >
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2">
              {GROUPS_HUB_NAV.map(({ tab: navTab, label, icon: Icon }) => {
                const active = tab === navTab;
                return (
                  <button
                    key={navTab}
                    type="button"
                    onClick={() => selectTab(navTab)}
                    aria-current={active ? 'page' : undefined}
                    className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold transition cursor-pointer ${
                      active
                        ? 'bg-blue-50 text-[#1877f2] dark:bg-blue-900/30 dark:text-[#4599ff]'
                        : 'bg-gray-100 text-gray-700 dark:bg-[#3a3b3c] dark:text-[#e4e6eb]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label.replace(' của bạn', '')}
                    {navTab === 'invites' && inviteCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
                        {inviteCount > 99 ? '99+' : inviteCount}
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={openCreateModal}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold bg-[#1877f2] text-white cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tạo nhóm
              </button>
            </div>
          </nav>

          <div className="p-3 sm:p-4 md:p-6 max-w-[1180px] mx-auto">
            {tab === null || (tab === 'feed' && hubLoading) ? (
              <div className="space-y-4" aria-busy="true">
                <Skeleton variant="text" width="40%" height="1.6rem" />
                <Skeleton width="100%" height="220px" />
              </div>
            ) : tab === 'feed' ? (
              <GroupsFeed
                refreshKey={feedRefreshKey}
                hasGroups={joinedTotal > 0}
                onExplore={() => selectTab('discover')}
              />
            ) : (
              <GroupsDiscover
                key={tab}
                scope={tab === 'invites' ? 'invited' : tab}
                onCreateGroupClick={openCreateModal}
                onExplore={() => selectTab('discover')}
              />
            )}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <CreateCommunityGroupModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};
