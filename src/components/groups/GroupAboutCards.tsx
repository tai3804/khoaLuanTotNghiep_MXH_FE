import React, { useEffect, useState } from 'react';
import { Clock, Eye, FileText, Globe, Lock, MessageSquareText, Shield, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { GroupResponse, GroupStaffMember } from '../../services/groupService';
import { UserAvatar } from '../common/UserAvatar';
import { postService } from '../../services/api';
import type { GroupPostStats } from '../../services/postService';

const cardClass =
  'bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-4';

const formatCreatedDate = (iso?: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Row: React.FC<{ icon: React.ReactNode; title: string; children?: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 shrink-0 text-gray-600 dark:text-[#b0b3b8]">{icon}</div>
    <div className="min-w-0">
      <h4 className="text-[15px] font-semibold text-gray-900 dark:text-[#e4e6eb]">{title}</h4>
      {children && <p className="mt-0.5 text-[13px] leading-normal text-gray-500 dark:text-[#b0b3b8]">{children}</p>}
    </div>
  </div>
);

/** Thẻ "Giới thiệu": mô tả, quyền riêng tư, hiển thị, duyệt bài, ngày tạo (dùng ở cột phải và tab Giới thiệu). */
export const GroupAboutCard: React.FC<{ group: GroupResponse; title?: string }> = ({ group, title = 'Giới thiệu' }) => {
  const isPublic = group.privacy === 'PUBLIC';
  const created = formatCreatedDate(group.createdAt);
  return (
    <section className={`${cardClass} space-y-3.5`}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">{title}</h3>
      <p className="whitespace-pre-line break-words text-[15px] leading-relaxed text-gray-800 dark:text-[#d0d2d6]">
        {group.description || 'Cùng chia sẻ, trao đổi và kết nối trong cộng đồng này.'}
      </p>
      <div className="space-y-3 pt-1">
        <Row
          icon={isPublic ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5 text-amber-500" />}
          title={isPublic ? 'Công khai' : 'Riêng tư'}
        >
          {isPublic
            ? 'Bất kỳ ai cũng có thể nhìn thấy mọi người trong nhóm và những gì họ đăng.'
            : 'Chỉ thành viên mới nhìn thấy mọi người trong nhóm và những gì họ đăng.'}
        </Row>
        <Row icon={<Eye className="h-5 w-5" />} title="Hiển thị">Ai cũng có thể tìm thấy nhóm này.</Row>
        {group.postApprovalRequired && (
          <Row icon={<Shield className="h-5 w-5 text-[#1877f2]" />} title="Kiểm duyệt bài viết">
            Bài viết cần được quản trị viên duyệt trước khi hiển thị với mọi người.
          </Row>
        )}
        <Row icon={<Users className="h-5 w-5" />} title={`${group.memberCount.toLocaleString('vi-VN')} thành viên`} />
        {created && <Row icon={<Clock className="h-5 w-5" />} title={`Nhóm được tạo ngày ${created}`} />}
      </div>
    </section>
  );
};

/** Thẻ "Nội quy của nhóm": mỗi dòng của nội quy là một mục có đánh số. */
export const GroupRulesCard: React.FC<{ rules?: string }> = ({ rules }) => {
  const items = (rules ?? '')
    .split('\n')
    .map((line) => line.replace(/^\s*(\d+[.)]|[-•*])\s*/, '').trim())
    .filter(Boolean);
  if (items.length === 0) return null;
  return (
    <section className={cardClass}>
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-5 w-5 text-[#1877f2]" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">Nội quy của nhóm</h3>
      </div>
      <ol className="space-y-2.5">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-[15px] text-gray-800 dark:text-[#d0d2d6]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700 dark:bg-[#3a3b3c] dark:text-[#e4e6eb]">
              {index + 1}
            </span>
            <span className="min-w-0 break-words pt-0.5">{item}</span>
          </li>
        ))}
      </ol>
    </section>
  );
};

interface StaffCardProps {
  staff: GroupStaffMember[];
  onNavigateProfile?: (userId: string) => void;
  /** Hiện nút "Xem tất cả" dẫn sang tab thành viên. */
  onSeeAll?: () => void;
  title?: string;
}

/** Thẻ "Quản trị viên và người kiểm duyệt": ai cũng xem được, kể cả nhóm riêng tư. */
export const GroupStaffCard: React.FC<StaffCardProps> = ({ staff, onNavigateProfile, onSeeAll, title = 'Quản trị viên' }) => {
  if (staff.length === 0) return null;
  return (
    <section className={cardClass}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">{title}</h3>
        {onSeeAll && (
          <button type="button" onClick={onSeeAll} className="text-sm font-semibold text-[#1877f2] hover:underline cursor-pointer">
            Xem tất cả
          </button>
        )}
      </div>
      <ul className="space-y-1">
        {staff.slice(0, 6).map((member) => (
          <li key={member.id}>
            <button
              type="button"
              onClick={() => onNavigateProfile?.(member.id)}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
            >
              <UserAvatar src={member.avatar} alt={member.name} size="md" className="h-10 w-10 rounded-full" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-gray-900 dark:text-[#e4e6eb]">{member.name}</span>
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#1877f2]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {member.isOwner ? 'Chủ nhóm' : member.role === 'ADMIN' ? 'Quản trị viên' : 'Người kiểm duyệt'}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

/** Thẻ "Hoạt động của nhóm": số bài viết mới hôm nay/tuần này và thành viên mới (giống Facebook); ẩn nếu chưa tải được. */
export const GroupActivityCard: React.FC<{ group: GroupResponse }> = ({ group }) => {
  const [stats, setStats] = useState<GroupPostStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    postService.getGroupStats(group.id)
      .then((value) => { if (!cancelled) setStats(value); })
      .catch(() => { if (!cancelled) setStats(null); });
    return () => { cancelled = true; };
  }, [group.id]);

  if (!stats) return null;
  const newMembers = group.newMembersThisWeek ?? 0;
  return (
    <section className={`${cardClass} space-y-3`}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">Hoạt động của nhóm</h3>
      <Row icon={<MessageSquareText className="h-5 w-5" />} title={`${stats.postsToday.toLocaleString('vi-VN')} bài viết mới hôm nay`}>
        {stats.postsThisWeek.toLocaleString('vi-VN')} bài viết trong 7 ngày qua · {stats.totalPosts.toLocaleString('vi-VN')} bài viết tất cả
      </Row>
      <Row icon={<UserPlus className="h-5 w-5" />} title={`${newMembers.toLocaleString('vi-VN')} thành viên mới tuần này`}>
        Tổng cộng {group.memberCount.toLocaleString('vi-VN')} thành viên
      </Row>
    </section>
  );
};
