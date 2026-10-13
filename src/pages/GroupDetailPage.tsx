import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/layout/header-bar';
import { ChatUser } from '../components/chat/chat-box';
import { GroupBanner } from '../components/groups/GroupBanner';
import { GroupDiscussionTab } from '../components/groups/GroupDiscussionTab';
import { GroupMembersTab } from '../components/groups/GroupMembersTab';
import { GroupMediaTab } from '../components/groups/GroupMediaTab';
import { GroupSettingsTab } from '../components/groups/GroupSettingsTab';
import { GroupManagementTab } from '../components/groups/GroupManagementTab';
import { GroupPendingPostsTab } from '../components/groups/GroupPendingPostsTab';
import { GroupAppealsTab } from '../components/groups/GroupAppealsTab';
import { InviteCommunityMembersModal } from '../components/groups/InviteCommunityMembersModal';
import { Skeleton } from '../components/common/Skeleton';
import { CommunityGroupMember, groupService, GroupResponse } from '../services/groupService';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

interface GroupDetailPageProps {
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

const groupDetailsCache: Record<string, { group: GroupResponse; members: CommunityGroupMember[] }> = {};

export const GroupDetailPage: React.FC<GroupDetailPageProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'discussion' | 'members' | 'media' | 'appeals' | 'management' | 'pending-posts' | 'settings'>('discussion');

  const cached = id ? groupDetailsCache[id] : null;
  const [group, setGroup] = useState<GroupResponse | null>(cached?.group || null);
  const [members, setMembers] = useState<CommunityGroupMember[]>(cached?.members || []);
  const [isLoading, setIsLoading] = useState(!cached && Boolean(id));
  const [loadError, setLoadError] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const loadGroup = async (groupId: string, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    try {
      setLoadError('');
      const g = await groupService.getGroupById(groupId);
      if (g) {
        const m = await groupService.getGroupMembers(g.id);
        groupDetailsCache[groupId] = { group: g, members: m };
        setGroup(g);
        setMembers(m);
      } else {
        setGroup(null);
        setLoadError('Nhóm không tồn tại hoặc đã bị giải tán.');
      }
    } catch (err) {
      console.error('Failed to load group:', err);
      if (!group) {
        setGroup(null);
        setLoadError('Không thể tải nhóm. Hãy kiểm tra kết nối backend rồi thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      const existing = groupDetailsCache[id];
      if (existing) {
        setGroup(existing.group);
        setMembers(existing.members);
        setIsLoading(false);
        // Refresh silently in background
        loadGroup(id, true);
      } else {
        setIsLoading(true);
        loadGroup(id, false);
      }
    }
  }, [id]);

  const handleToggleJoin = async () => {
    if (!group) return;
    try {
      const updated = await groupService.toggleJoinGroup(group.id);
      if (updated) {
        setGroup(updated);
        const m = await groupService.getGroupMembers(updated.id);
        setMembers(m);
        groupDetailsCache[group.id] = { group: updated, members: m };
        toast.showSuccess(updated.joinStatus === 'PENDING' ? 'Yêu cầu tham gia đã được gửi.' : 'Bạn đã tham gia nhóm.');
      }
    } catch (err) {
      console.error('Failed to toggle join group:', err);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    const ok = await confirm({
      title: 'Rời khỏi nhóm',
      message: `Bạn có chắc muốn rời khỏi nhóm "${group.name}" không?`,
      confirmText: 'Rời nhóm',
      cancelText: 'Ở lại',
      type: 'danger',
    });
    if (!ok) return;
    try {
      await groupService.leaveGroup(group.id);
      delete groupDetailsCache[group.id];
      toast.showSuccess('Bạn đã rời nhóm.');
      navigate('/groups');
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể rời nhóm. Quản trị viên tạo nhóm cần chuyển quyền quản trị trước.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      {/* Persistent Header */}
      <Header
        activeTab={props.activeNavTab}
        onTabChange={(tab) => {
          props.setActiveNavTab(tab);
          if (tab === 'friends') props.setActiveSidebarFilter?.('friends');
          if (tab === 'groups') props.setActiveSidebarFilter?.('groups');
        }}
        onNavigateSettings={props.onNavigateSettings}
        onNavigateProfile={props.onNavigateProfile}
        onNavigateAuth={props.onNavigateAuth}
        onSelectChatUser={props.setActiveChatUser}
      />

      {/* Main Centered Group Container (Facebook Standard Width matching ProfilePage) */}
      <div className="pt-14 min-h-screen">
        <main className="w-full max-w-[1120px] xl:max-w-[1180px] 2xl:max-w-[1240px] mx-auto px-2 sm:px-4 lg:px-6 py-4 space-y-4">
          {isLoading && !group ? (
            /* Skeleton State inside main area only */
            <div className="space-y-4 animate-fade-in">
              <div className="w-full bg-white dark:bg-[#242526] rounded-2xl shadow-sm overflow-hidden mb-4 border border-gray-200 dark:border-[#393a3b]">
                <Skeleton className="w-full h-[260px] sm:h-[320px] rounded-none" />
                <div className="px-6 pb-4 pt-4 flex flex-col md:flex-row justify-between items-end md:items-center relative">
                  <div className="flex-1 pb-4">
                    <Skeleton variant="text" width="60%" height="2rem" className="mb-2" />
                    <Skeleton variant="text" width="40%" height="1rem" />
                  </div>
                  <div className="flex items-center space-x-3">
                    <Skeleton width="120px" height="2.5rem" />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton width="100%" height="140px" />
                <Skeleton width="100%" height="260px" />
              </div>
            </div>
          ) : !group ? (
            /* Error / Group Not Found */
            <div className="flex items-center justify-center py-16">
              <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#242526] p-7 text-center shadow-sm border border-gray-200 dark:border-[#393a3b] space-y-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">Không mở được nhóm</h1>
                <p className="text-xs text-gray-500 dark:text-gray-300 leading-relaxed">
                  {loadError || 'Nhóm này không tồn tại hoặc bạn không có quyền truy cập.'}
                </p>
                <button
                  onClick={() => navigate('/groups')}
                  className="rounded-xl bg-[#1877f2] hover:bg-[#166fe5] px-4 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
                >
                  Quay lại danh sách nhóm
                </button>
              </div>
            </div>
          ) : (
            /* Normal Group View */
            <div className="space-y-4">
              <GroupBanner
                group={group}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                members={members}
                onNavigateProfile={(userId) => props.onNavigateProfile(userId)}
                onInviteClick={() => setShowInviteModal(true)}
                onToggleJoin={handleToggleJoin}
                onLeaveGroup={handleLeaveGroup}
                onGroupUpdated={(updated) => {
                  setGroup(updated);
                  groupDetailsCache[updated.id] = { group: updated, members };
                }}
              />
              <div className="w-full">
                {activeTab === 'discussion' && <GroupDiscussionTab group={group} onToggleJoin={handleToggleJoin} />}
                {activeTab === 'members' && (
                  <GroupMembersTab
                    group={group}
                    onInviteClick={() => setShowInviteModal(true)}
                    onNavigateProfile={(userId) => props.onNavigateProfile(userId)}
                  />
                )}
                {activeTab === 'media' && <GroupMediaTab group={group} />}
                {activeTab === 'appeals' && <GroupAppealsTab group={group} />}
                {activeTab === 'management' && <GroupManagementTab group={group} onNavigate={setActiveTab} />}
                {activeTab === 'pending-posts' && <GroupPendingPostsTab group={group} />}
                {activeTab === 'settings' && (
                  <GroupSettingsTab
                    group={group}
                    onUpdated={(updated) => {
                      setGroup(updated);
                      loadGroup(updated.id, true);
                    }}
                    onDeleted={() => navigate('/groups')}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Invite Modal */}
      {showInviteModal && group && (
        <InviteCommunityMembersModal
          isOpen={showInviteModal}
          group={group}
          onClose={() => setShowInviteModal(false)}
          onMembersAdded={() => loadGroup(group.id, true)}
        />
      )}
    </div>
  );
};

export default GroupDetailPage;
