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

export interface GroupMeta {
  id: string;
  name: string;
  coverUrl?: string;
  privacy: 'PUBLIC' | 'PRIVATE' | string;
}

export const groupMetaCache: Record<string, GroupMeta> = {};

export const mapGroupForCurrentUser = (group: any): GroupResponse => {
  const currentUserId = getCurrentUserId();
  const ownerId = String(group.ownerId || group.creatorId || '');
  const rawMemberIds = Array.isArray(group.memberIds) && group.memberIds.length > 0
    ? group.memberIds.map(String)
    : (ownerId ? [ownerId] : []);
  
  const joinStatus = group.joinStatus || (group.status as any);
  const isOwner = Boolean(currentUserId && ownerId && ownerId === currentUserId);
  const isMember = Boolean(
    (group.member === true ||
    group.isMember === true ||
    (currentUserId && (isOwner || rawMemberIds.includes(currentUserId)))) &&
    joinStatus !== 'PENDING' &&
    joinStatus !== 'REJECTED' &&
    joinStatus !== 'BANNED'
  );
  
  const isAdmin = Boolean(group.admin === true || group.isAdmin === true || isOwner);
  const isDefaultUnsplash = typeof group.coverUrl === 'string' && group.coverUrl.includes('images.unsplash.com/photo-1522071820081');
  const validCoverUrl = isDefaultUnsplash ? undefined : (typeof group.coverUrl === 'string' && group.coverUrl.trim() ? group.coverUrl.trim() : undefined);

  const mapped: GroupResponse = {
    ...group,
    id: String(group.id),
    name: group.name || 'Nhóm',
    description: group.description || '',
    privacy: group.privacy || 'PUBLIC',
    ownerId,
    coverUrl: validCoverUrl,
    isMember,
    isAdmin,
    joinStatus,
    memberIds: rawMemberIds,
    memberCount: Number(group.memberCount || rawMemberIds.length || 1),
    createdAt: group.createdAt || new Date().toISOString(),
    updatedAt: group.updatedAt || new Date().toISOString(),
  };

  groupMetaCache[mapped.id] = {
    id: mapped.id,
    name: mapped.name,
    coverUrl: mapped.coverUrl,
    privacy: mapped.privacy,
  };

  return mapped;
};

export const fetchGroupMeta = async (groupId: string): Promise<GroupMeta | null> => {
  if (!groupId) return null;
  if (groupMetaCache[groupId]) return groupMetaCache[groupId];
  try {
    const group = await groupService.getGroupById(groupId);
    if (group) {
      const meta: GroupMeta = {
        id: group.id,
        name: group.name,
        coverUrl: group.coverUrl,
        privacy: group.privacy,
      };
      groupMetaCache[groupId] = meta;
      return meta;
    }
  } catch {}
  return null;
};

export const groupService = {
  createGroup: async (request: CreateGroupRequest): Promise<GroupResponse> => {
    const isUuid = (val?: string) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

    const validInitialMemberIds = (request.initialMemberIds || []).filter(isUuid);
    const payload = {
      name: request.name.trim(),
      description: request.description?.trim() || undefined,
      privacy: request.privacy,
      coverUrl: request.coverUrl?.trim() || undefined,
      postApprovalRequired: Boolean(request.postApprovalRequired),
      rules: request.rules?.trim() || undefined,
      initialMemberIds: validInitialMemberIds.length > 0 ? validInitialMemberIds : undefined,
    };

    const response = await api.post('/groups', payload);
    const data = response.data?.data || response.data;
    if (!data?.id) throw new Error('Không thể tạo nhóm.');
    const mapped = mapGroupForCurrentUser(data as GroupResponse);
    window.dispatchEvent(new CustomEvent('community_group_created', { detail: mapped }));
    return mapped;
  },

  getGroups: async (): Promise<GroupResponse[]> => {
    try {
      const response = await api.get('/groups');
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.map(mapGroupForCurrentUser);
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch groups from backend:', err);
      return [];
    }
  },

  getGroupById: async (id: string): Promise<GroupResponse | null> => {
    try {
      const response = await api.get(`/groups/${id}`);
      const data = response.data?.data || response.data;
      if (data && data.id) {
        return mapGroupForCurrentUser(data as GroupResponse);
      }
      return null;
    } catch (err) {
      console.warn('Failed to fetch group by id from backend:', err);
      return null;
    }
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
    window.dispatchEvent(new CustomEvent('community_group_updated'));
  },

  addGroupMembers: async (groupId: string, memberIdsToAdd: string[]): Promise<GroupResponse | null> => {
    const isUuid = (val?: string) =>
      typeof val === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

    const validMemberIds = memberIdsToAdd.filter(isUuid);
    const response = await api.post(`/groups/${groupId}/members`, validMemberIds.length > 0 ? validMemberIds : memberIdsToAdd);
    const data = response.data?.data || response.data;
    if (data?.id) {
      const mapped = mapGroupForCurrentUser(data as GroupResponse);
      window.dispatchEvent(new CustomEvent('community_group_updated', { detail: mapped }));
      return mapped;
    }
    return null;
  },

  getGroupMembers: async (groupId: string, includePending = false): Promise<CommunityGroupMember[]> => {
    try {
      const response = await api.get(`/groups/${groupId}/members`, { params: { includePending } });
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.map((member: any) => ({
          id: String(member.userId || member.id),
          name: member.name || 'Thành viên',
          avatar: member.avatarUrl || member.avatar || '/default-avatar.png',
          role: member.role || 'MEMBER',
          status: member.status,
          joinedAt: member.joinedAt || new Date().toISOString(),
        }));
      }
      return [];
    } catch (err) {
      console.warn('Failed to fetch group members from backend:', err);
      return [];
    }
  },

  updateGroup: async (groupId: string, data: Partial<CreateGroupRequest>): Promise<GroupResponse> => {
    const response = await api.put(`/groups/${groupId}`, data);
    const updated = (response.data?.data || response.data) as GroupResponse;
    if (!updated?.id) throw new Error('Không thể lưu thay đổi nhóm.');
    const mapped = mapGroupForCurrentUser(updated);
    window.dispatchEvent(new CustomEvent('community_group_updated', { detail: mapped }));
    return mapped;
  },

  deleteGroup: async (groupId: string): Promise<void> => {
    await api.delete(`/groups/${groupId}`);
    window.dispatchEvent(new CustomEvent('community_group_updated'));
  },

  reviewMember: async (groupId: string, memberId: string, approved: boolean): Promise<GroupResponse> => {
    const response = await api.post(`/groups/${groupId}/members/${memberId}/review`, null, { params: { approved } });
    const data = (response.data?.data || response.data) as GroupResponse;
    const mapped = mapGroupForCurrentUser(data);
    window.dispatchEvent(new CustomEvent('community_group_updated', { detail: mapped }));
    return mapped;
  },

  changeMemberRole: async (groupId: string, memberId: string, role: 'ADMIN' | 'MODERATOR' | 'MEMBER'): Promise<void> => {
    await api.put(`/groups/${groupId}/members/${memberId}/role`, null, { params: { role } });
    window.dispatchEvent(new CustomEvent('community_group_updated'));
  },

  removeMember: async (groupId: string, memberId: string, ban = false): Promise<void> => {
    await api.delete(`/groups/${groupId}/members/${memberId}`, { params: { ban } });
    window.dispatchEvent(new CustomEvent('community_group_updated'));
  },

  searchGroups: async (keyword: string): Promise<GroupResponse[]> => {
    try {
      const all = await groupService.getGroups();
      const query = keyword.trim().toLowerCase();
      if (!query) return all;
      return all.filter((g) =>
        (g.name && g.name.toLowerCase().includes(query)) ||
        (g.description && g.description.toLowerCase().includes(query))
      );
    } catch {
      return [];
    }
  },
};
