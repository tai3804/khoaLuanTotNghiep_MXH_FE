import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { ChatUser } from '../components/chat/chat-box';
import { GroupBanner } from '../components/groups/GroupBanner';
import { GroupDiscussionTab } from '../components/groups/GroupDiscussionTab';
import { GroupMembersTab } from '../components/groups/GroupMembersTab';
import { GroupMediaTab } from '../components/groups/GroupMediaTab';
import { GroupSettingsTab } from '../components/groups/GroupSettingsTab';
import { InviteCommunityMembersModal } from '../components/groups/InviteCommunityMembersModal';
import { Skeleton } from '../components/common/Skeleton';
import { CommunityGroupMember, groupService, GroupResponse } from '../services/groupService';
import { useToast } from '../context/ToastContext';

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

export const GroupDetailPage: React.FC<GroupDetailPageProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'discussion' | 'members' | 'media' | 'settings'>('discussion');
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [loadError, setLoadError] = useState('');
  const [members, setMembers] = useState<CommunityGroupMember[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const loadGroup = async (groupId: string) => {
    try {
      setLoadError('');
      const g = await groupService.getGroupById(groupId);
      setGroup(g);
      if (g) {
        setMembers(await groupService.getGroupMembers(g.id));
      }
    } catch (err) {
      console.error('Failed to load group:', err);
      setGroup(null);
      setLoadError('Không thể tải nhóm. Hãy kiểm tra kết nối backend rồi thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      loadGroup(id);
    }
  }, [id]);

  const handleToggleJoin = async () => {
    if (!group) return;
    try {
      const updated = await groupService.toggleJoinGroup(group.id);
      if (updated) {
        setGroup(updated);
        setMembers(await groupService.getGroupMembers(updated.id));
        toast.showSuccess(updated.joinStatus === 'PENDING' ? 'Yêu cầu tham gia đã được gửi.' : 'Bạn đã tham gia nhóm.');
      }
    } catch (err) {
      console.error('Failed to toggle join group:', err);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    if (!window.confirm('Bạn có chắc muốn rời khỏi nhóm này?')) return;
    try {
      await groupService.leaveGroup(group.id);
      toast.showSuccess('Bạn đã rời nhóm.');
      navigate('/groups');
    } catch (error: any) {
      toast.showError(error?.message || 'Không thể rời nhóm. Quản trị viên tạo nhóm cần chuyển quyền quản trị trước.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
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
        <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
          <SidebarLeft
            activeFilter={props.activeSidebarFilter || 'groups'}
            onFilterChange={(filter) => {
              props.setActiveSidebarFilter?.(filter);
              if (filter === 'friends') {
                props.setActiveNavTab('friends');
              } else if (filter === 'groups') {
                props.setActiveNavTab('groups');
              } else if (filter === 'watch') {
                props.setActiveNavTab('watch');
              } else if (filter === 'saved') {
                props.setActiveNavTab('saved');
              } else if (filter === 'moderation') {
                props.setActiveNavTab('moderation');
              } else if (filter === 'support') {
                props.setActiveNavTab('support');
              } else {
                props.setActiveNavTab('home');
              }
            }}
            onNavigateProfile={() => props.onNavigateProfile?.()}
            onNavigateSettings={props.onNavigateSettings}
          />

          <main className="flex-1 max-w-[740px] xl:max-w-[800px] 2xl:max-w-[860px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)] space-y-4">
            {/* Skeleton Banner */}
            <div className="w-full bg-white dark:bg-[#242526] rounded-2xl shadow-sm overflow-hidden mb-4">
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
            
            {/* Main Content Area Skeleton */}
            <div className="space-y-4">
              <Skeleton width="100%" height="140px" />
              <Skeleton width="100%" height="260px" />
            </div>
          </main>

          <SidebarRight onSelectChatUser={(u) => props.setActiveChatUser(u)} />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
        <Header
          activeTab={props.activeNavTab}
          onTabChange={props.setActiveNavTab}
          onNavigateSettings={props.onNavigateSettings}
          onNavigateProfile={props.onNavigateProfile}
          onNavigateAuth={props.onNavigateAuth}
          onSelectChatUser={props.setActiveChatUser}
        />
        <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
          <SidebarLeft
            activeFilter={props.activeSidebarFilter || 'groups'}
            onFilterChange={(filter) => {
              props.setActiveSidebarFilter?.(filter);
              if (filter === 'friends') props.setActiveNavTab('friends');
              else if (filter === 'groups') props.setActiveNavTab('groups');
              else props.setActiveNavTab('home');
            }}
            onNavigateProfile={() => props.onNavigateProfile?.()}
            onNavigateSettings={props.onNavigateSettings}
          />
          <main className="flex flex-1 items-center justify-center px-4 py-16">
            <div className="max-w-md rounded-2xl bg-white dark:bg-[#242526] p-7 text-center shadow-sm border border-gray-200 dark:border-[#393a3b]">
              <h1 className="text-xl font-bold">Không mở được nhóm</h1>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-300">
                {loadError || 'Nhóm này không tồn tại hoặc bạn không có quyền truy cập.'}
              </p>
              <button
                onClick={() => navigate('/groups')}
                className="mt-5 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] px-4 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer"
              >
                Quay lại Nhóm
              </button>
            </div>
          </main>
          <SidebarRight onSelectChatUser={(u) => props.setActiveChatUser(u)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
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

      <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
        {/* Left Sidebar */}
        <SidebarLeft
          activeFilter={props.activeSidebarFilter || 'groups'}
          onFilterChange={(filter) => {
            props.setActiveSidebarFilter?.(filter);
            if (filter === 'friends') {
              props.setActiveNavTab('friends');
            } else if (filter === 'groups') {
              props.setActiveNavTab('groups');
            } else if (filter === 'watch') {
              props.setActiveNavTab('watch');
            } else if (filter === 'saved') {
              props.setActiveNavTab('saved');
            } else if (filter === 'moderation') {
              props.setActiveNavTab('moderation');
            } else if (filter === 'support') {
              props.setActiveNavTab('support');
            } else {
              props.setActiveNavTab('home');
            }
          }}
          onNavigateProfile={() => props.onNavigateProfile?.()}
          onNavigateSettings={props.onNavigateSettings}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 max-w-[740px] xl:max-w-[800px] 2xl:max-w-[860px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)] space-y-4">
          <GroupBanner 
            group={group} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            members={members}
            onNavigateProfile={(userId) => props.onNavigateProfile(userId)}
            onInviteClick={() => setShowInviteModal(true)}
            onToggleJoin={handleToggleJoin}
            onLeaveGroup={handleLeaveGroup}
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
            {activeTab === 'settings' && (
              <GroupSettingsTab
                group={group}
                onUpdated={(updated) => { setGroup(updated); loadGroup(updated.id); }}
                onDeleted={() => navigate('/groups')}
              />
            )}
          </div>
        </main>

        {/* Right Contacts & Group Chats Sidebar */}
        <SidebarRight onSelectChatUser={(u) => props.setActiveChatUser(u)} />
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteCommunityMembersModal
          isOpen={showInviteModal}
          group={group}
          onClose={() => setShowInviteModal(false)}
          onMembersAdded={() => loadGroup(group.id)}
        />
      )}
    </div>
  );
};


