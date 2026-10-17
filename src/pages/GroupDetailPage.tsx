import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/header-bar';
import { ChatUser } from '../components/chat/chat-box';
import { GroupBanner, GroupTab, GroupTabItem } from '../components/groups/GroupBanner';
import { GroupDiscussionTab } from '../components/groups/GroupDiscussionTab';
import { GroupMembersTab } from '../components/groups/GroupMembersTab';
import { GroupMediaTab } from '../components/groups/GroupMediaTab';
import { GroupSettingsTab } from '../components/groups/GroupSettingsTab';
import { GroupManagementTab } from '../components/groups/GroupManagementTab';
import { GroupPendingPostsTab } from '../components/groups/GroupPendingPostsTab';
import { GroupAppealsTab } from '../components/groups/GroupAppealsTab';
import { InviteCommunityMembersModal } from '../components/groups/InviteCommunityMembersModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Skeleton } from '../components/common/Skeleton';
import { CommunityGroupMember, groupService, GroupResponse } from '../services/groupService';
import { useToast } from '../context/ToastContext';
import { getApiErrorMessage } from '../utils/apiError';

interface GroupDetailPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
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
  const [members, setMembers] = useState<CommunityGroupMember[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [joining, setJoining] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  // Chỉ nhận kết quả của lần tải mới nhất (đổi nhóm nhanh không bị dữ liệu cũ ghi đè)
  const loadSeq = useRef(0);

  const loadGroup = useCallback(async (groupId: string, silent = false) => {
    const seq = ++loadSeq.current;
    if (!silent) setStatus('loading');
    try {
      const g = await groupService.getGroupById(groupId);
      if (seq !== loadSeq.current) return;
      if (!g) {
        setGroup(null);
        setMembers([]);
        setStatus('notfound');
        return;
      }
      setGroup(g);
      setStatus('ready');
      // Nhóm riêng tư chỉ cho thành viên xem danh sách; người ngoài gọi sẽ bị từ chối nên không gọi
      if (g.privacy === 'PUBLIC' || g.isMember || g.isAdmin) {
        const list = await groupService.getGroupMembers(g.id).catch(() => [] as CommunityGroupMember[]);
        if (seq === loadSeq.current) setMembers(list);
      } else {
        setMembers([]);
      }
    } catch (err) {
      if (seq !== loadSeq.current) return;
      // Làm mới ngầm thất bại thì giữ nguyên dữ liệu đang hiển thị
      if (silent) return;
      setGroup(null);
      setErrorMessage(getApiErrorMessage(err, 'Không thể tải nhóm. Hãy kiểm tra kết nối rồi thử lại.'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    setShowInviteModal(false);
    loadGroup(id);
  }, [id, loadGroup]);

  // Các tab con (duyệt thành viên, đổi vai trò...) phát sự kiện này: làm mới số thành viên/quyền của mình
  useEffect(() => {
    if (!id) return;
    const refresh = () => { void loadGroup(id, true); };
    window.addEventListener('community_group_updated', refresh);
    return () => window.removeEventListener('community_group_updated', refresh);
  }, [id, loadGroup]);

  const isPrivateLocked = Boolean(group && group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin);
  const canModerate = Boolean(group && (group.isAdmin || group.isModerator));

  const tabs = useMemo<GroupTabItem[]>(() => {
    if (!group) return [];
    const list: GroupTabItem[] = [
      { key: 'discussion', label: 'Thảo luận' },
      { key: 'members', label: 'Thành viên' },
    ];
    if (!isPrivateLocked) list.push({ key: 'media', label: 'Ảnh & video' });
    if (group.isMember) list.push({ key: 'appeals', label: 'Kháng nghị' });
    if (canModerate && group.postApprovalRequired) list.push({ key: 'pending-posts', label: 'Bài chờ duyệt' });
    if (canModerate) list.push({ key: 'management', label: 'Quản trị nhóm' });
    return list;
  }, [group, isPrivateLocked, canModerate]);

  const requestedTab = searchParams.get('tab') as GroupTab | null;
  const activeTab: GroupTab = useMemo(() => {
    if (requestedTab === 'settings' && group?.isAdmin) return 'settings';
    if (requestedTab && tabs.some((t) => t.key === requestedTab)) return requestedTab;
    return 'discussion';
  }, [requestedTab, tabs, group?.isAdmin]);

  const setActiveTab = useCallback((tab: GroupTab) => {
    setSearchParams(tab === 'discussion' ? {} : { tab });
  }, [setSearchParams]);

  const handleToggleJoin = async () => {
    if (!group || joining) return;
    const wasPending = group.joinStatus === 'PENDING';
    setJoining(true);
    try {
      const updated = await groupService.toggleJoinGroup(group.id);
      if (updated) {
        setGroup(updated);
        if (wasPending) toast.showSuccess('Đã hủy yêu cầu tham gia nhóm.');
        else if (updated.joinStatus === 'PENDING') toast.showSuccess('Đã gửi yêu cầu tham gia, vui lòng chờ quản trị viên duyệt.');
        else toast.showSuccess(`Bạn đã tham gia nhóm "${updated.name}".`);
        await loadGroup(group.id, true);
      }
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể thực hiện thao tác, vui lòng thử lại.'));
    } finally {
      setJoining(false);
    }
  };

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
      setGroup(updated);
      toast.showSuccess('Đã cập nhật ảnh bìa nhóm.');
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể tải ảnh bìa lên, vui lòng thử lại.'));
    } finally {
      setUploadingCover(false);
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
            <Skeleton className="w-full h-44 sm:h-72 rounded-none" />
            <div className="px-4 sm:px-8 pb-4 pt-4 space-y-3">
              <Skeleton variant="text" width="60%" height="2rem" />
              <Skeleton variant="text" width="40%" height="1rem" />
            </div>
            <div className="px-4 sm:px-8 border-t border-gray-200 dark:border-gray-700 flex gap-4 py-3">
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
            <div className="w-1/3 hidden md:block space-y-4">
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

  return (
    <div className="flex flex-col min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
      {header}

      <div className="flex-1 pt-14 flex justify-center">
        <GroupBanner
          group={group}
          tabs={tabs}
          activeTab={activeTab === 'settings' ? 'management' : activeTab}
          setActiveTab={setActiveTab}
          members={members}
          canInvite={canModerate}
          joining={joining}
          uploadingCover={uploadingCover}
          onNavigateProfile={(userId) => props.onNavigateProfile(userId)}
          onInviteClick={() => setShowInviteModal(true)}
          onToggleJoin={handleToggleJoin}
          onLeaveGroup={() => setShowLeaveConfirm(true)}
          onChangeCover={group.isAdmin ? handleChangeCover : undefined}
        />
      </div>

      <div className="flex-1 flex justify-center w-full max-w-[1000px] mx-auto pt-4 px-4 pb-16">
        {activeTab === 'discussion' && <GroupDiscussionTab group={group} joining={joining} onToggleJoin={handleToggleJoin} />}
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
            onUpdated={(updated) => setGroup(updated)}
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
