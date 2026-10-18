import { Compass, Mail, Newspaper, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Các mục của trang Nhóm (giống thanh bên của Facebook): bảng feed, khám phá, nhóm của bạn, lời mời. */
export type GroupsHubTab = 'feed' | 'discover' | 'joined' | 'invites';

export interface GroupsHubNavItem {
  tab: GroupsHubTab;
  label: string;
  icon: LucideIcon;
}

export const GROUPS_HUB_NAV: GroupsHubNavItem[] = [
  { tab: 'feed', label: 'Bảng feed của bạn', icon: Newspaper },
  { tab: 'discover', label: 'Khám phá', icon: Compass },
  { tab: 'joined', label: 'Nhóm của bạn', icon: Users },
  { tab: 'invites', label: 'Lời mời', icon: Mail },
];

export const isGroupsHubTab = (value: string | null): value is GroupsHubTab =>
  value === 'feed' || value === 'discover' || value === 'joined' || value === 'invites';
