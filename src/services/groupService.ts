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

const STORAGE_KEY = 'kltn_community_groups';

const LEGACY_SAMPLE_GROUP_IDS = new Set(['group-1', 'group-2', 'group-3']);

const getStoredGroups = (): GroupResponse[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Remove the old demo groups while preserving groups created by users.
        const groups = parsed.filter((group) => !LEGACY_SAMPLE_GROUP_IDS.has(group.id));
        if (groups.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
        }
        return groups;
      }
    }
  } catch {}
  return [];
};

const saveStoredGroups = (groups: GroupResponse[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch {}
};

export const groupService = {
  createGroup: async (request: CreateGroupRequest): Promise<GroupResponse> => {
    try {
      // Try backend if route exists in future
      const response = await api.post('/groups', request);
      const data = response.data?.data || response.data;
      if (data && data.id) return data as GroupResponse;
    } catch {
      // Fallback to client storage
    }

    let currentUserId = 'me';
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) currentUserId = user.id;
    } catch {}

    const initialMemberIds = request.initialMemberIds || [];
    const memberIds = Array.from(new Set([currentUserId, ...initialMemberIds]));

    const newGroup: GroupResponse = {
      id: 'grp-' + Date.now(),
      name: request.name.trim(),
      description: request.description || `Chào mừng bạn đến với ${request.name}!`,
      privacy: request.privacy,
      ownerId: currentUserId,
      coverUrl: request.coverUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      memberCount: memberIds.length,
      isMember: true,
      isAdmin: true,
      memberIds: memberIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = getStoredGroups();
    const updated = [newGroup, ...existing];
    saveStoredGroups(updated);

    window.dispatchEvent(new CustomEvent('community_group_created', { detail: newGroup }));
    return newGroup;
  },

  getGroups: async (): Promise<GroupResponse[]> => {
    try {
      const response = await api.get('/groups');
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) return data as GroupResponse[];
    } catch {}
    return getStoredGroups();
  },

  getGroupById: async (id: string): Promise<GroupResponse | null> => {
    try {
      const response = await api.get(`/groups/${id}`);
      const data = response.data?.data || response.data;
      if (data && data.id) return data as GroupResponse;
    } catch {}

    const groups = getStoredGroups();
    const found = groups.find((g) => g.id === id);
    if (found) return found;

    // Fallback for default group
    return {
      id,
      name: 'Cộng đồng nhóm thảo luận',
      description: 'Cộng đồng kết nối các thành viên trên hệ thống mạng xã hội.',
      privacy: 'PUBLIC',
      ownerId: 'system',
      coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      memberCount: 120,
      isMember: true,
      isAdmin: false,
      memberIds: ['system'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  toggleJoinGroup: async (id: string): Promise<GroupResponse | null> => {
    try {
      const response = await api.post(`/groups/${id}/join`);
      const data = response.data?.data || response.data;
      if (data?.id) return data as GroupResponse;
    } catch {}
    const groups = getStoredGroups();
    const idx = groups.findIndex((g) => g.id === id);
    if (idx >= 0) {
      const group = groups[idx];
      const nextMemberState = !group.isMember;
      const updated: GroupResponse = {
        ...group,
        isMember: nextMemberState,
        memberCount: nextMemberState ? group.memberCount + 1 : Math.max(1, group.memberCount - 1),
      };
      groups[idx] = updated;
      saveStoredGroups(groups);
      window.dispatchEvent(new CustomEvent('community_group_updated', { detail: updated }));
      return updated;
    }
    return null;
  },

  leaveGroup: async (id: string): Promise<void> => {
    try {
      await api.delete(`/groups/${id}/members/me`);
      return;
    } catch {}
    const groups = getStoredGroups();
    const idx = groups.findIndex((group) => group.id === id);
    if (idx < 0) return;
    const group = groups[idx];
    if (group.isAdmin) throw new Error('Quản trị viên tạo nhóm không thể rời nhóm. Hãy chuyển quyền quản trị hoặc xóa nhóm.');
    let currentUserId = 'me';
    try { currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id || currentUserId; } catch {}
    const memberIds = (group.memberIds || []).filter((memberId) => String(memberId) !== String(currentUserId));
    groups[idx] = { ...group, isMember: false, memberIds, memberCount: Math.max(0, group.memberCount - 1) };
    saveStoredGroups(groups);
    window.dispatchEvent(new CustomEvent('community_group_updated', { detail: groups[idx] }));
  },

  addGroupMembers: async (groupId: string, memberIdsToAdd: string[]): Promise<GroupResponse | null> => {
    try {
      const response = await api.post(`/groups/${groupId}/members`, memberIdsToAdd);
      const data = response.data?.data || response.data;
      if (data?.id) return data as GroupResponse;
    } catch {}
    const groups = getStoredGroups();
    const idx = groups.findIndex((g) => g.id === groupId);
    if (idx >= 0) {
      const group = groups[idx];
      const currentIds = new Set(group.memberIds || [group.ownerId]);
      memberIdsToAdd.forEach((id) => currentIds.add(id));
      const updatedList = Array.from(currentIds);

      const updated: GroupResponse = {
        ...group,
        memberIds: updatedList,
        memberCount: Math.max(group.memberCount, updatedList.length),
      };
      groups[idx] = updated;
      saveStoredGroups(groups);
      window.dispatchEvent(new CustomEvent('community_group_updated', { detail: updated }));
      return updated;
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
    } catch {}
    const groups = getStoredGroups();
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];

    const memberIds = group.memberIds && group.memberIds.length > 0 ? group.memberIds : [group.ownerId];

    const members: CommunityGroupMember[] = await Promise.all(
      memberIds.map(async (uid) => {
        const isOwner = uid === group.ownerId;
        try {
          const { userService } = await import('./userService');
          const prof = await userService.getUserProfile(uid);
          const name = prof.fullName || [prof.lastName, prof.middleName, prof.firstName].filter(Boolean).join(' ') || prof.username || 'Thành viên';
          const avatar = prof.avatarUrl || prof.avatar || '/default-avatar.png';
          return {
            id: uid,
            name,
            avatar,
            role: isOwner ? 'ADMIN' : 'MEMBER',
            joinedAt: group.createdAt || new Date().toISOString(),
          };
        } catch {
          return {
            id: uid,
            name: isOwner ? 'Quản trị viên' : 'Thành viên KLTN',
            avatar: '/default-avatar.png',
            role: isOwner ? 'ADMIN' : 'MEMBER',
            joinedAt: group.createdAt || new Date().toISOString(),
          };
        }
      })
    );
    return members;
  },

  updateGroup: async (groupId: string, data: Partial<CreateGroupRequest>) => {
    try {
      const response = await api.put(`/groups/${groupId}`, data);
      const updated = (response.data?.data || response.data) as GroupResponse;
      if (updated?.id) return updated;
    } catch {}
    const groups = getStoredGroups();
    const index = groups.findIndex((group) => group.id === groupId);
    if (index < 0) throw new Error('Không tìm thấy nhóm để cập nhật.');
    const updated: GroupResponse = { ...groups[index], ...data, updatedAt: new Date().toISOString() };
    groups[index] = updated;
    saveStoredGroups(groups);
    window.dispatchEvent(new CustomEvent('community_group_updated', { detail: updated }));
    return updated;
  },

  deleteGroup: async (groupId: string): Promise<void> => {
    try {
      await api.delete(`/groups/${groupId}`);
      return;
    } catch {}
    saveStoredGroups(getStoredGroups().filter((group) => group.id !== groupId));
    window.dispatchEvent(new CustomEvent('community_group_updated'));
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
