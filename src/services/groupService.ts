import { api } from './axiosClient';

export interface CreateGroupRequest {
  name: string;
  description?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  coverUrl?: string;
  initialMemberIds?: string[];
  postApprovalRequired?: boolean;
  rules?: string;
}

export interface CommunityGroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'MODERATOR' | 'MEMBER';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
  joinedAt: string;
}

export interface GroupResponse {
  id: string;
  name: string;
  description: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  ownerId: string;
  coverUrl?: string;
  memberCount: number;
  isMember: boolean;
  isAdmin: boolean;
  memberIds?: string[];
  isModerator?: boolean;
  joinStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
  postApprovalRequired?: boolean;
  rules?: string;
  createdAt: string;
  updatedAt: string;
}

const getCurrentUserId = (): string => {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u.id) return String(u.id);
    }
  } catch {}
  return '';
};

export const mapGroupForCurrentUser = (group: any): GroupResponse => {
  const currentUserId = getCurrentUserId();
  const ownerId = String(group.ownerId || group.creatorId || '');
  const rawMemberIds = Array.isArray(group.memberIds) && group.memberIds.length > 0
    ? group.memberIds.map(String)
    : (ownerId ? [ownerId] : []);
  
  // Chủ nhóm
  const isOwner = Boolean(currentUserId && ownerId && ownerId === currentUserId);
  
  // Đã tham gia nhóm nếu backend trả về member === true HOẶC là chủ nhóm HOẶC có trong memberIds
  const isMember = Boolean(
    group.member === true ||
    group.isMember === true ||
    (currentUserId && (isOwner || rawMemberIds.includes(currentUserId)))
  );
  
  const isAdmin = Boolean(group.admin === true || group.isAdmin === true || isOwner);
  // Lombok/Jackson serializes Java boolean `isModerator` as `moderator` in
  // some responses. Normalize both shapes so moderators always see their
  // group-management tools.
  const isModerator = Boolean(group.moderator === true || group.isModerator === true);

  return {
    ...group,
    id: String(group.id),
    name: group.name || 'Nhóm cộng đồng',
    description: group.description || '',
    privacy: group.privacy || 'PUBLIC',
    ownerId,
    coverUrl: group.coverUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    isMember,
    isAdmin,
    isModerator,
    memberIds: rawMemberIds,
    memberCount: Number(group.memberCount || rawMemberIds.length || 1),
    createdAt: group.createdAt || new Date().toISOString(),
    updatedAt: group.updatedAt || new Date().toISOString(),
  };
};

export const groupService = {
  createGroup: async (request: CreateGroupRequest): Promise<GroupResponse> => {
    const isUuid = (val?: string) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

    const validInitialMemberIds = (request.initialMemberIds || []).filter(isUuid);
    const response = await api.post('/groups', {
      name: request.name.trim(), description: request.description, privacy: request.privacy, coverUrl: request.coverUrl,
      initialMemberIds: validInitialMemberIds.length ? validInitialMemberIds : undefined,
      postApprovalRequired: Boolean(request.postApprovalRequired), rules: request.rules?.trim() || undefined,
    });
    const data = response.data?.data || response.data;
    if (!data?.id) throw new Error('Không thể tạo nhóm.');
    const mapped = mapGroupForCurrentUser(data as GroupResponse);
    window.dispatchEvent(new CustomEvent('community_group_created', { detail: mapped }));
    return mapped;
  },

  getGroups: async (): Promise<GroupResponse[]> => {
    const response = await api.get('/groups');
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data.map(mapGroupForCurrentUser) : [];
  },

  getGroupById: async (id: string): Promise<GroupResponse | null> => {
    const response = await api.get(`/groups/${id}`);
    const data = response.data?.data || response.data;
    return data?.id ? mapGroupForCurrentUser(data as GroupResponse) : null;
  },

  toggleJoinGroup: async (id: string): Promise<GroupResponse | null> => {
    const response = await api.post(`/groups/${id}/join`);
    const data = response.data?.data || response.data;
    if (!data?.id) return null;
    const mapped = mapGroupForCurrentUser(data as GroupResponse);
    window.dispatchEvent(new CustomEvent('community_group_updated', { detail: mapped }));
    return mapped;
  },

  leaveGroup: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}/members/me`);
  },

  addGroupMembers: async (groupId: string, memberIdsToAdd: string[]): Promise<GroupResponse | null> => {
    const response = await api.post(`/groups/${groupId}/members`, memberIdsToAdd);
    const data = response.data?.data || response.data;
    return data?.id ? mapGroupForCurrentUser(data as GroupResponse) : null;
  },

  getGroupMembers: async (groupId: string, includePending = false): Promise<CommunityGroupMember[]> => {
    const response = await api.get(`/groups/${groupId}/members`, { params: { includePending } });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data.map((member: any) => ({
      id: String(member.userId || member.id), name: member.name || 'Thành viên',
      avatar: member.avatarUrl || member.avatar || '/default-avatar.png', role: member.role || 'MEMBER',
      status: member.status, joinedAt: member.joinedAt || new Date().toISOString(),
    })) : [];
  },

  updateGroup: async (groupId: string, data: Partial<CreateGroupRequest>) => {
    const response = await api.put(`/groups/${groupId}`, data);
    const updated = (response.data?.data || response.data) as GroupResponse;
    if (!updated?.id) throw new Error('Không thể lưu thay đổi nhóm.');
    return mapGroupForCurrentUser(updated);
  },

  deleteGroup: async (groupId: string): Promise<void> => {
    await api.delete(`/groups/${groupId}`);
  },

  reviewMember: async (groupId: string, memberId: string, approved: boolean) => {
    const response = await api.post(`/groups/${groupId}/members/${memberId}/review`, null, { params: { approved } });
    return (response.data?.data || response.data) as GroupResponse;
  },

  changeMemberRole: async (groupId: string, memberId: string, role: 'ADMIN' | 'MODERATOR' | 'MEMBER') => {
    await api.put(`/groups/${groupId}/members/${memberId}/role`, null, { params: { role } });
  },

  removeMember: async (groupId: string, memberId: string, ban = false) => {
    await api.delete(`/groups/${groupId}/members/${memberId}`, { params: { ban } });
  },
};
