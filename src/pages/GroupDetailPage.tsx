import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2, MailPlus } from 'lucide-react';
import { Header } from '../components/layout/header-bar';
import { ChatUser } from '../components/chat/chat-box';
import { GroupBanner, GroupTab, GroupTabItem, GroupTabsBar } from '../components/groups/GroupBanner';
import { GroupDiscussionTab } from '../components/groups/GroupDiscussionTab';
import { GroupAboutTab } from '../components/groups/GroupAboutTab';
import { GroupMembersTab } from '../components/groups/GroupMembersTab';
import { GroupMediaTab } from '../components/groups/GroupMediaTab';
import { GroupSettingsTab } from '../components/groups/GroupSettingsTab';
import { GroupManagementTab } from '../components/groups/GroupManagementTab';
import { GroupPendingPostsTab } from '../components/groups/GroupPendingPostsTab';
import { GroupAppealsTab } from '../components/groups/GroupAppealsTab';
import { GroupReportsTab } from '../components/groups/GroupReportsTab';
import { InviteCommunityMembersModal } from '../components/groups/InviteCommunityMembersModal';
import { useGroupMembership } from '../components/groups/useGroupMembership';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Skeleton } from '../components/common/Skeleton';
import {
  getGroupLink,
  groupService,
  GroupNotificationLevel,
  GroupResponse,
  GroupStaffMember,
} from '../services/groupService';
import { postService } from '../services/api';
import type { GroupModerationCounts } from '../services/postService';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';

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

type LoadStatus = 'loading' | 'ready' | 'notfound' | 'error';

const MAX_COVER_SIZE = 10 * 1024 * 1024;

export const GroupDetailPage: React.FC<GroupDetailPageProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [group, setGroup] = useState<GroupResponse | null>(null);
  const [staff, setStaff] = useState<GroupStaffMember[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [modCounts, setModCounts] = useState<GroupModerationCounts | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  // Chỉ nhận kết quả của lần tải mới nhất (đổi nhóm nhanh không bị dữ liệu cũ ghi đè)
  const loadSeq = useRef(0);
  const staffSeq = useRef(0);

  const loadGroup = useCallback(async (groupId: string, silent = false) => {
    const seq = ++loadSeq.current;
    if (!silent) setStatus('loading');
    try {
      const g = await groupService.getGroupById(groupId);
      if (seq !== loadSeq.current) return;
      if (!g) {
        setGroup(null);
        setStatus('notfound');
        return;
      }
      setGroup(g);
      setStatus('ready');
    } catch (err) {
      if (seq !== loadSeq.current) return;
      // Làm mới ngầm thất bại thì giữ nguyên dữ liệu đang hiển thị
      if (silent) return;
      setGroup(null);
      setErrorMessage(getApiErrorMessage(err, 'Không thể tải nhóm. Hãy kiểm tra kết nối rồi thử lại.'));
      setStatus('error');
    }
  }, []);

  // Quản trị viên/người kiểm duyệt: ai cũng xem được, dùng cho huy hiệu trên bài viết và thẻ "Quản trị viên"
  const loadStaff = useCallback(async (groupId: string) => {
    const seq = ++staffSeq.current;
    try {
      const list = await groupService.getGroupStaff(groupId);
      if (seq === staffSeq.current) setStaff(list);
    } catch {
      if (seq === staffSeq.current) setStaff([]);
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    setShowInviteModal(false);
    setStaff([]);
    loadGroup(id);
    void loadStaff(id);
  }, [id, loadGroup, loadStaff]);

  // Các tab con (duyệt thành viên, đổi vai trò...) phát sự kiện này: làm mới số thành viên/quyền của mình
  useEffect(() => {
    if (!id) return;
    const refresh = () => {
      void loadGroup(id, true);
      void loadStaff(id);
    };
    window.addEventListener('community_group_updated', refresh);
    return () => window.removeEventListener('community_group_updated', refresh);
  }, [id, loadGroup, loadStaff]);

  const { busyId, requestJoin, cancelRequest, respondToInvitation, joinModal } = useGroupMembership(
    useCallback((updated: GroupResponse | null) => {
      if (updated) setGroup(updated);
      else if (id) void loadGroup(id, true);
    }, [id, loadGroup]),
  );
  const joining = Boolean(group && busyId === group.id);

  const isPrivateLocked = Boolean(group && group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin);
  const canModerate = Boolean(group && (group.isAdmin || group.isModerator));

  // Số việc đang chờ quản trị viên xử lý (bài chờ duyệt, kháng nghị, báo cáo) cho huy hiệu ở thanh tab
  const refreshModerationCounts = useCallback(async (groupId: string) => {
    try {
      setModCounts(await postService.getGroupModerationCounts(groupId));
    } catch {
      setModCounts(null);
    }
  }, []);

  const tabs = useMemo<GroupTabItem[]>(() => {
    if (!group) return [];
    const list: GroupTabItem[] = [
      { key: 'discussion', label: 'Thảo luận' },
      { key: 'about', label: 'Giới thiệu' },
      { key: 'members', label: 'Thành viên' },
    ];
    if (!isPrivateLocked) list.push({ key: 'media', label: 'Ảnh & video' });
    if (group.isMember) list.push({ key: 'appeals', label: 'Kháng nghị', badge: canModerate ? modCounts?.pendingAppeals : undefined });
    if (canModerate && group.postApprovalRequired) list.push({ key: 'pending-posts', label: 'Bài chờ duyệt', badge: modCounts?.pendingPosts });
    if (canModerate) list.push({ key: 'reports', label: 'Nội dung bị báo cáo', badge: modCounts?.reportedPosts });
    if (canModerate) {
      const todo = (group.pendingRequestCount ?? 0) + (modCounts?.pendingPosts ?? 0) + (modCounts?.pendingAppeals ?? 0) + (modCounts?.reportedPosts ?? 0);
      list.push({ key: 'management', label: 'Quản trị nhóm', badge: todo });
    }
    return list;
  }, [group, isPrivateLocked, canModerate, modCounts]);

  const requestedTab = searchParams.get('tab') as GroupTab | null;
  const activeTab: GroupTab = useMemo(() => {
    if (requestedTab === 'settings' && group?.isAdmin) return 'settings';
    if (requestedTab && tabs.some((t) => t.key === requestedTab)) return requestedTab;
    return 'discussion';
  }, [requestedTab, tabs, group?.isAdmin]);

  useEffect(() => {
    if (!group?.id || !canModerate) {
      setModCounts(null);
      return;
    }
    void refreshModerationCounts(group.id);
  }, [group?.id, canModerate, activeTab, refreshModerationCounts]);

  const setActiveTab = useCallback((tab: GroupTab) => {
    setSearchParams(tab === 'discussion' ? {} : { tab });
  }, [setSearchParams]);

  const handleLeaveGroup = async () => {
    if (!group) return;
    setLeaving(true);
    try {
      await groupService.leaveGroup(group.id);
      toast.showSuccess('Bạn đã rời nhóm.');
      navigate('/groups');
    } catch (err) {
      setShowLeaveConfirm(false);
      toast.showError(getApiErrorMessage(err, 'Không thể rời nhóm, vui lòng thử lại.'));
    } finally {
      setLeaving(false);
    }
  };

  const handleChangeCover = async (file: File) => {
    if (!group) return;
    if (!file.type.startsWith('image/')) {
      toast.showError('Vui lòng chọn một tệp ảnh.');
      return;
    }
    if (file.size > MAX_COVER_SIZE) {
      toast.showError('Ảnh bìa quá lớn, vui lòng chọn ảnh dưới 10MB.');
      return;
    }
    setUploadingCover(true);
    try {
      const updated = await groupService.changeGroupCover(group.id, file);
      setGroup((current) => (current ? { ...current, ...updated, memberPreview: current.memberPreview, pendingRequestCount: current.pendingRequestCount } : updated));
      toast.showSuccess('Đã cập nhật ảnh bìa nhóm.');
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể tải ảnh bìa lên, vui lòng thử lại.'));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleNotificationLevel = async (level: GroupNotificationLevel) => {
    if (!group) return;
    const previous = group.notificationLevel;
    setGroup({ ...group, notificationLevel: level });
    try {
      await groupService.setNotificationLevel(group.id, level);
      toast.showSuccess(
        level === 'ALL' ? 'Bạn sẽ nhận thông báo mọi bài viết mới của nhóm.'
          : level === 'OFF' ? 'Đã tắt thông báo hoạt động của nhóm.'
            : 'Đã chuyển sang chế độ thông báo nổi bật.',
      );
    } catch (err) {
      setGroup((current) => (current ? { ...current, notificationLevel: previous } : current));
      toast.showError(getApiErrorMessage(err, 'Không thể cập nhật cài đặt thông báo.'));
    }
  };

  const handleShare = async () => {
    if (!group) return;
    const link = getGroupLink(group.id);
    try {
      await navigator.clipboard.writeText(link);
      toast.showSuccess('Đã sao chép liên kết nhóm.');
    } catch {
      toast.showError(`Không sao chép được tự động. Liên kết nhóm: ${link}`);
    }
  };

  const header = (
    <Header
      activeTab={props.activeNavTab}
      onTabChange={props.setActiveNavTab}
      onNavigateSettings={props.onNavigateSettings}
      onNavigateProfile={props.onNavigateProfile}
      onNavigateAuth={props.onNavigateAuth}
      onSelectChatUser={props.setActiveChatUser}
    />
  );

  if (status === 'loading') {
    return (
      <div className="flex flex-col min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
        {header}
        <div className="flex-1 pt-14 flex flex-col items-center" aria-busy="true">
          <div className="w-full max-w-[1000px] bg-white dark:bg-[#242526] rounded-b-xl shadow mb-4">
            <Skeleton className="w-full h-48 sm:h-[370px] rounded-none" />
            <div className="px-4 sm:px-6 pb-4 pt-4 space-y-3">
              <Skeleton variant="text" width="60%" height="2rem" />
              <Skeleton variant="text" width="40%" height="1rem" />
            </div>
            <div className="px-4 sm:px-6 border-t border-gray-200 dark:border-gray-700 flex gap-4 py-3">
              <Skeleton width="80px" height="1.5rem" />
              <Skeleton width="80px" height="1.5rem" />
              <Skeleton width="80px" height="1.5rem" />
            </div>
          </div>
          <div className="flex w-full max-w-[1000px] mx-auto px-4 pb-16 gap-4">
            <div className="flex-1 space-y-4">
              <Skeleton width="100%" height="120px" />
              <Skeleton width="100%" height="260px" />
            </div>
            <div className="w-[360px] hidden lg:block space-y-4">
              <Skeleton width="100%" height="200px" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'ready' || !group) {
    const notFound = status === 'notfound';
    return (
      <div className="flex min-h-screen flex-col bg-[#f0f2f5] dark:bg-[#18191a]">
        {header}
        <main className="flex flex-1 items-center justify-center px-4 pt-14">
          <div className="max-w-md rounded-2xl bg-white p-7 text-center shadow dark:bg-[#242526]">
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">
              {notFound ? 'Nhóm không tồn tại' : 'Không mở được nhóm'}
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              {notFound ? 'Nhóm này không tồn tại hoặc đã bị xóa.' : errorMessage || 'Đã có lỗi xảy ra khi tải nhóm.'}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {!notFound && id && (
                <button type="button" onClick={() => loadGroup(id)} className="rounded-xl bg-[#1877f2] px-4 py-2 text-sm font-bold text-white cursor-pointer">
                  Thử lại
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/groups')}
                className={`rounded-xl px-4 py-2 text-sm font-bold cursor-pointer ${notFound ? 'bg-[#1877f2] text-white' : 'bg-gray-100 text-gray-800 dark:bg-[#3a3b3c] dark:text-[#e4e6eb]'}`}
              >
                Quay lại Nhóm
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const invited = group.joinStatus === 'INVITED';

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
      {header}

      <div className="flex-1 pt-14 flex justify-center">
        <GroupBanner
          group={group}
          setActiveTab={setActiveTab}
          joining={joining}
          uploadingCover={uploadingCover}
          onNavigateProfile={(userId) => props.onNavigateProfile(userId)}
          onInviteClick={() => setShowInviteModal(true)}
          onJoin={() => requestJoin(group)}
          onCancelRequest={() => cancelRequest(group)}
          onLeaveGroup={() => setShowLeaveConfirm(true)}
          onChangeCover={group.isAdmin ? handleChangeCover : undefined}
          onShare={handleShare}
          onNotificationLevelChange={handleNotificationLevel}
        />
      </div>

      <GroupTabsBar tabs={tabs} activeTab={activeTab === 'settings' ? 'management' : activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 w-full max-w-[1000px] mx-auto pt-4 px-3 sm:px-4 pb-16">
        {invited && (
          <section
            aria-label="Lời mời tham gia nhóm"
            className="mb-4 flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/50 dark:bg-blue-900/20"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1877f2] text-white">
                <MailPlus className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-gray-900 dark:text-[#e4e6eb]">
                  {group.invitedByName ? `${group.invitedByName} đã mời bạn tham gia nhóm này` : 'Bạn được mời tham gia nhóm này'}
                </p>
                <p className="text-sm text-gray-600 dark:text-[#b0b3b8]">
                  {group.privacy === 'PRIVATE'
                    ? 'Đây là nhóm riêng tư, quản trị viên có thể duyệt yêu cầu của bạn.'
                    : 'Chấp nhận để trở thành thành viên và xem mọi bài viết trong nhóm.'}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={joining}
                onClick={() => respondToInvitation(group, true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#1877f2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#166fe5] disabled:opacity-60 cursor-pointer"
              >
                {joining && <Loader2 className="h-4 w-4 animate-spin" />}
                Chấp nhận
              </button>
              <button
                type="button"
                disabled={joining}
                onClick={() => respondToInvitation(group, false)}
                className="rounded-lg bg-gray-200 px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-300 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer"
              >
                Từ chối
              </button>
            </div>
          </section>
        )}

        {activeTab === 'discussion' && (
          <GroupDiscussionTab
            group={group}
            staff={staff}
            joining={joining}
            onJoin={() => requestJoin(group)}
            onCancelRequest={() => cancelRequest(group)}
            onNavigateProfile={(userId) => props.onNavigateProfile(userId)}
            onSeeAbout={() => setActiveTab('about')}
            onSeeMembers={() => setActiveTab('members')}
          />
        )}
        {activeTab === 'about' && (
          <GroupAboutTab
            group={group}
            staff={staff}
            onNavigateProfile={(userId) => props.onNavigateProfile(userId)}
            onSeeMembers={() => setActiveTab('members')}
          />
        )}
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
        {activeTab === 'reports' && <GroupReportsTab group={group} onNavigateProfile={(userId) => props.onNavigateProfile(userId)} />}
        {activeTab === 'settings' && (
          <GroupSettingsTab
            group={group}
            onUpdated={(updated) => setGroup((current) => (current ? { ...current, ...updated, memberPreview: current.memberPreview, pendingRequestCount: current.pendingRequestCount } : updated))}
            onDeleted={() => navigate('/groups')}
          />
        )}
      </div>

      {showInviteModal && (
        <InviteCommunityMembersModal
          isOpen={showInviteModal}
          group={group}
          onClose={() => setShowInviteModal(false)}
          onMembersAdded={() => loadGroup(group.id, true)}
        />
      )}

      {joinModal}

      <ConfirmModal
        isOpen={showLeaveConfirm}
        title="Rời khỏi nhóm?"
        message={`Bạn sẽ không còn là thành viên và không thể đăng bài trong "${group.name}" nữa.`}
        confirmText="Rời nhóm"
        type="danger"
        loading={leaving}
        onConfirm={handleLeaveGroup}
        onClose={() => { if (!leaving) setShowLeaveConfirm(false); }}
      />
    </div>
  );
};
