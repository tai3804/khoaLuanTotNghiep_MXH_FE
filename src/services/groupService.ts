import { api } from './axiosClient';

export interface CreateGroupRequest {
  name: string;
  description?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  coverUrl?: string;
  initialMemberIds?: string[];
}

export interface CommunityGroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'MEMBER';
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
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'kltn_community_groups';

const DEFAULT_GROUPS: GroupResponse[] = [
  {
    id: 'group-1',
    name: 'Cộng đồng lập trình viên React & Spring Boot',
    description: 'Nơi giao lưu, chia sẻ kiến thức công nghệ, ReactJS, Microservices và đồ án tốt nghiệp.',
    privacy: 'PUBLIC',
    ownerId: 'system',
    coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    memberCount: 1542,
    isMember: true,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'group-2',
    name: 'Hội Sinh Viên IUH - KLTN',
    description: 'Cộng đồng sinh viên Đại học Công nghiệp TP.HCM, chia sẻ học tập, việc làm và kinh nghiệm.',
    privacy: 'PUBLIC',
    ownerId: 'system',
    coverUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    memberCount: 3820,
    isMember: false,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'group-3',
    name: 'Góc Tuyển Dụng & Thực Tập IT',
    description: 'Tổng hợp cơ hội việc làm, thực tập IT mới nhất cho sinh viên năm cuối và lập trình viên.',
    privacy: 'PUBLIC',
    ownerId: 'system',
    coverUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    memberCount: 2190,
    isMember: false,
    isAdmin: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const getStoredGroups = (): GroupResponse[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
  return DEFAULT_GROUPS;
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
      if (data && data.id) return data;
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
      if (Array.isArray(data) && data.length > 0) return data;
    } catch {}
    return getStoredGroups();
  },

  getGroupById: async (id: string): Promise<GroupResponse | null> => {
    try {
      const response = await api.get(`/groups/${id}`);
      const data = response.data?.data || response.data;
      if (data && data.id) return data;
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

  addGroupMembers: async (groupId: string, memberIdsToAdd: string[]): Promise<GroupResponse | null> => {
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

  getGroupMembers: async (groupId: string): Promise<CommunityGroupMember[]> => {
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
};
