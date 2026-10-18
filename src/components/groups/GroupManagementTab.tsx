import React, { useEffect, useState } from 'react';
import { ChevronRight, Clock3, Flag, Globe, Lock, MessageSquareWarning, Settings, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import { postService } from '../../services/api';
import { TabCard } from './groupTabUi';

type ManagementTarget = 'discussion' | 'members' | 'pending-posts' | 'appeals' | 'reports' | 'settings';

interface Props {
  group: GroupResponse;
  onNavigate: (target: ManagementTarget) => void;
}

interface StatCardProps {
  icon: React.ReactNode;
  tone: 'blue' | 'amber' | 'emerald' | 'rose';
  label: string;
  hint: string;
  value: number | null;
  highlight?: boolean;
  onClick: () => void;
}

const TONES: Record<StatCardProps['tone'], string> = {
  blue: 'bg-blue-100 text-[#1877f2] dark:bg-blue-900/30',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30',
};

const StatCard: React.FC<StatCardProps> = ({ icon, tone, label, hint, value, highlight, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#1877f2]/50 hover:shadow-md dark:border-[#393a3b] dark:bg-[#242526] cursor-pointer"
  >
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}>{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">{label}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-[#b0b3b8]">{hint}</p>
    </div>
    <div className="flex items-center gap-1.5">
      {value === null ? (
        <span className="h-7 w-8 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
      ) : (
        <span className={`min-w-8 rounded-full px-2.5 py-0.5 text-center text-lg font-extrabold ${highlight && value > 0 ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-[#e4e6eb]'}`}>{value}</span>
      )}
      <ChevronRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5" />
    </div>
  </button>
);

export const GroupManagementTab: React.FC<Props> = ({ group, onNavigate }) => {
  // Số yêu cầu tham gia lấy từ chi tiết nhóm (không cần tải cả danh sách chỉ để đếm)
  const [pendingPosts, setPendingPosts] = useState<number | null>(null);
  const [appeals, setAppeals] = useState<number | null>(null);
  const [reported, setReported] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setPendingPosts(null);
    setAppeals(null);
    setReported(null);
    postService.getGroupModerationCounts(group.id)
      .then((counts) => {
        if (!active) return;
        setPendingPosts(counts.pendingPosts);
        setAppeals(counts.pendingAppeals);
        setReported(counts.reportedPosts);
      })
      .catch(() => {
        // Máy chủ chưa trả được số tổng hợp: đếm từng loại bằng các API riêng
        if (group.postApprovalRequired) {
          postService.getPendingGroupPosts(group.id)
            .then((posts) => { if (active) setPendingPosts(posts.length); })
            .catch(() => { if (active) setPendingPosts(0); });
        } else {
          setPendingPosts(0);
        }
        postService.getGroupAppeals(group.id)
          .then((list) => { if (active) setAppeals(list.length); })
          .catch(() => { if (active) setAppeals(0); });
        setReported(0);
      });
    return () => { active = false; };
  }, [group.id, group.postApprovalRequired]);

  const isAdmin = Boolean(group.isAdmin);
  const requests = group.pendingRequestCount ?? 0;

  return (
    <div className="mx-auto w-full max-w-[760px] space-y-4">
      <TabCard className="p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-[#1877f2] dark:bg-blue-900/30"><ShieldCheck className="h-6 w-6" /></div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Công cụ quản trị</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-[#b0b3b8]">
              Bạn là <b className="text-gray-800 dark:text-[#e4e6eb]">{isAdmin ? (group.isOwner ? 'chủ nhóm' : 'quản trị viên') : 'người kiểm duyệt'}</b> của nhóm này.
            </p>
          </div>
        </div>
      </TabCard>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          icon={<Users className="h-6 w-6" />}
          tone="blue"
          label="Thành viên"
          hint="Xem, tìm kiếm và quản lý thành viên"
          value={group.memberCount}
          onClick={() => onNavigate('members')}
        />
        <StatCard
          icon={<UserPlus className="h-6 w-6" />}
          tone="emerald"
          label="Yêu cầu tham gia"
          hint="Duyệt hoặc từ chối người xin vào nhóm"
          value={group.pendingRequestCount ?? 0}
          highlight
          onClick={() => onNavigate('members')}
        />
        {group.postApprovalRequired && (
          <StatCard
            icon={<Clock3 className="h-6 w-6" />}
            tone="amber"
            label="Bài viết chờ duyệt"
            hint="Duyệt bài trước khi hiển thị trong nhóm"
            value={pendingPosts}
            highlight
            onClick={() => onNavigate('pending-posts')}
          />
        )}
        <StatCard
          icon={<Flag className="h-6 w-6" />}
          tone="amber"
          label="Nội dung bị báo cáo"
          hint="Bài viết thành viên báo cáo cho quản trị viên"
          value={reported}
          highlight
          onClick={() => onNavigate('reports')}
        />
        <StatCard
          icon={<MessageSquareWarning className="h-6 w-6" />}
          tone="rose"
          label="Kháng nghị chờ xử lý"
          hint="Xem lại bài bị gỡ mà tác giả phản đối"
          value={appeals}
          highlight
          onClick={() => onNavigate('appeals')}
        />
      </div>

      <TabCard className="p-4 sm:p-5">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb]">Quyền của bạn</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className={`rounded-xl border p-3 ${isAdmin ? 'border-[#1877f2]/40 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-[#393a3b]'}`}>
            <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-[#e4e6eb]"><ShieldCheck className="h-4 w-4 text-[#1877f2]" />Quản trị viên</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-[#b0b3b8]">
              Mọi quyền của người kiểm duyệt, cộng thêm: đổi tên, quyền riêng tư, nội quy, câu hỏi tham gia; chỉ định quản trị viên và người kiểm duyệt; xóa nhóm.
            </p>
          </div>
          <div className={`rounded-xl border p-3 ${!isAdmin ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-gray-200 dark:border-[#393a3b]'}`}>
            <p className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-[#e4e6eb]"><ShieldCheck className="h-4 w-4 text-emerald-600" />Người kiểm duyệt</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-[#b0b3b8]">
              Duyệt bài và yêu cầu tham gia, ghim hoặc gỡ bài viết, xóa hoặc cấm thành viên, xử lý kháng nghị. Không thể đổi cài đặt hay đụng tới quản trị viên.
            </p>
          </div>
        </div>
      </TabCard>

      <TabCard className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-gray-500 dark:text-[#b0b3b8]">{group.privacy === 'PUBLIC' ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5 text-amber-500" />}</div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb]">{group.privacy === 'PUBLIC' ? 'Nhóm công khai' : 'Nhóm riêng tư'}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-[#b0b3b8]">
              {group.privacy === 'PUBLIC'
                ? 'Ai cũng thấy được thành viên và bài viết, và có thể tham gia ngay.'
                : 'Chỉ thành viên thấy được bài viết và danh sách thành viên; người mới phải được duyệt.'}
              {' '}
              {group.postApprovalRequired ? 'Bài viết của thành viên cần được duyệt trước khi hiển thị.' : 'Bài viết của thành viên hiển thị ngay.'}
              {group.privacy === 'PRIVATE' && group.membershipQuestions.length > 0 ? ` Người xin vào phải trả lời ${group.membershipQuestions.length} câu hỏi.` : ''}
            </p>
          </div>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => onNavigate('settings')}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-800 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              Cài đặt nhóm
            </button>
          ) : null}
        </div>
        {requests > 0 && (
          <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-[#1877f2] dark:bg-blue-900/20">
            Có {requests} yêu cầu tham gia đang chờ bạn xem xét.
          </p>
        )}
      </TabCard>
    </div>
  );
};
