import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Settings, ShieldCheck, Users } from 'lucide-react';
import { GroupResponse, groupService } from '../../services/groupService';
import { postService } from '../../services/api';

type ManagementTarget = 'discussion' | 'members' | 'pending-posts' | 'settings';

interface Props {
  group: GroupResponse;
  onNavigate: (target: ManagementTarget) => void;
}

export const GroupManagementTab = ({ group, onNavigate }: Props) => {
  const [pendingPosts, setPendingPosts] = useState(0);
  const [pendingMembers, setPendingMembers] = useState(0);

  useEffect(() => {
    if (!group.isAdmin && !group.isModerator) return;
    Promise.all([
      group.postApprovalRequired ? postService.getPendingGroupPosts(group.id) : Promise.resolve([]),
      groupService.getGroupMembers(group.id, true),
    ]).then(([posts, members]) => {
      setPendingPosts(posts.length);
      setPendingMembers(members.filter((member) => member.status === 'PENDING').length);
    }).catch(() => undefined);
  }, [group.id, group.isAdmin, group.isModerator, group.postApprovalRequired]);

  const moderator = group.isModerator && !group.isAdmin;
  return (
    <div className="w-full max-w-[820px] space-y-4">
      <section className="rounded-2xl bg-white p-6 shadow dark:bg-[#242526]">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-3 text-[#1877f2] dark:bg-blue-900/30"><ShieldCheck size={25} /></div>
          <div><h2 className="text-xl font-extrabold">Quản trị nhóm</h2><p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Bạn đang là {moderator ? 'Người kiểm duyệt' : 'Quản trị viên'} của nhóm.</p></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => onNavigate('pending-posts')} className="rounded-2xl border border-amber-200 bg-white p-5 text-left shadow transition hover:border-amber-400 hover:shadow-md dark:border-amber-800/50 dark:bg-[#242526]">
          <div className="flex items-center justify-between"><Clock3 className="text-amber-500" /><b className="text-2xl">{pendingPosts}</b></div>
          <h3 className="mt-4 font-bold">Bài viết chờ duyệt</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Xem, duyệt hoặc từ chối bài đăng.</p>
        </button>
        <button type="button" onClick={() => onNavigate('members')} className="rounded-2xl border border-blue-200 bg-white p-5 text-left shadow transition hover:border-blue-400 hover:shadow-md dark:border-blue-800/50 dark:bg-[#242526]">
          <div className="flex items-center justify-between"><Users className="text-[#1877f2]" /><b className="text-2xl">{pendingMembers}</b></div>
          <h3 className="mt-4 font-bold">Yêu cầu tham gia</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Duyệt hoặc từ chối thành viên chờ.</p>
        </button>
      </section>

      {group.isAdmin ? (
        <button type="button" onClick={() => onNavigate('settings')} className="flex w-full items-center gap-4 rounded-2xl border border-violet-200 bg-white p-5 text-left shadow transition hover:border-violet-400 hover:shadow-md dark:border-violet-800/50 dark:bg-[#242526]">
          <div className="rounded-xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-900/30"><Settings size={24} /></div>
          <div><h3 className="font-bold">Cài đặt nhóm</h3><p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Tên, quyền riêng tư, nội quy, duyệt bài và xóa nhóm.</p></div>
        </button>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#393a3b] dark:bg-[#242526]"><CheckCircle2 className="text-emerald-500" /><p className="text-sm text-gray-600 dark:text-[#b0b3b8]">Người kiểm duyệt có quyền duyệt bài, duyệt thành viên, thêm/xóa thành viên; không được thay đổi cài đặt hoặc xóa nhóm.</p></div>
      )}
    </div>
  );
};
