import React from 'react';
import { GroupResponse, GroupStaffMember } from '../../services/groupService';
import { GroupAboutCard, GroupRulesCard, GroupStaffCard } from './GroupAboutCards';

interface GroupAboutTabProps {
  group: GroupResponse;
  staff: GroupStaffMember[];
  onNavigateProfile?: (userId: string) => void;
  onSeeMembers?: () => void;
}

/** Tab "Giới thiệu" (giống Facebook): mô tả, quyền riêng tư, nội quy và đội ngũ quản trị của nhóm. */
export const GroupAboutTab: React.FC<GroupAboutTabProps> = ({ group, staff, onNavigateProfile, onSeeMembers }) => (
  <div className="w-full max-w-[680px] mx-auto space-y-4">
    <GroupAboutCard group={group} title="Giới thiệu về nhóm này" />
    <GroupRulesCard rules={group.rules} />
    <GroupStaffCard staff={staff} onNavigateProfile={onNavigateProfile} onSeeAll={onSeeMembers} title="Quản trị viên và người kiểm duyệt" />
  </div>
);
