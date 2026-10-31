import React from 'react';
import { Eye, Globe, Lock, Users } from 'lucide-react';
import { GroupResponse, GroupStaffMember } from '../../services/groupService';
import { GroupAboutCard, GroupActivityCard, GroupRulesCard, GroupStaffCard } from './GroupAboutCards';

interface GroupAboutTabProps {
  group: GroupResponse;
  staff: GroupStaffMember[];
  onNavigateProfile?: (userId: string) => void;
  onSeeMembers?: () => void;
}

const GroupSummarySidebarCard: React.FC<{ group: GroupResponse }> = ({ group }) => (
  <section className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-4 space-y-3">
    <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">Thông tin nhóm</h3>
    <div className="space-y-2.5 text-sm text-gray-600 dark:text-[#b0b3b8]">
      <div className="flex items-center gap-2.5">
        <Users className="h-4 w-4 text-[#1877f2] shrink-0" />
        <span><b className="text-gray-900 dark:text-[#e4e6eb]">{group.memberCount.toLocaleString('vi-VN')}</b> thành viên</span>
      </div>
      <div className="flex items-center gap-2.5">
        {group.privacy === 'PUBLIC' ? (
          <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
        ) : (
          <Lock className="h-4 w-4 text-amber-500 shrink-0" />
        )}
        <span>{group.privacy === 'PUBLIC' ? 'Nhóm công khai' : 'Nhóm riêng tư'}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <Eye className="h-4 w-4 text-blue-500 shrink-0" />
        <span>Bất kỳ ai cũng có thể tìm thấy nhóm</span>
      </div>
    </div>
  </section>
);

/** Tab "Giới thiệu" (chuẩn bố cục Facebook): cột chính thông tin + nội quy + đội ngũ; cột phải thống kê hoạt động. */
export const GroupAboutTab: React.FC<GroupAboutTabProps> = ({ group, staff, onNavigateProfile, onSeeMembers }) => (
  <div className="flex w-full justify-between gap-5 lg:gap-6 lg:items-start">
    {/* Cột chính: Giới thiệu, Nội quy, Quản trị viên */}
    <div className="min-w-0 w-full flex-1 max-w-[740px] xl:max-w-[780px] space-y-4">
      <GroupAboutCard group={group} title="Giới thiệu về nhóm này" />
      <GroupRulesCard rules={group.rules} />
      <GroupStaffCard staff={staff} onNavigateProfile={onNavigateProfile} onSeeAll={onSeeMembers} title="Quản trị viên và người kiểm duyệt" columns={2} />
    </div>

    {/* Cột phụ: Hoạt động của nhóm + Tóm tắt nhóm */}
    <aside className="hidden w-[340px] xl:w-[360px] shrink-0 space-y-4 lg:block lg:sticky lg:top-[124px]">
      <GroupActivityCard group={group} />
      <GroupSummarySidebarCard group={group} />
    </aside>
  </div>
);
