import { api } from './axiosClient';
import { mediaService } from './mediaService';

export type GroupScope = 'all' | 'discover' | 'joined' | 'pending';
export type GroupJoinStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';

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
  status?: GroupJoinStatus;
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
  /** Người đang xem là chủ nhóm (người tạo hoặc người được chuyển quyền) */
  isOwner: boolean;
  isModerator?: boolean;
  joinStatus?: GroupJoinStatus;
  postApprovalRequired?: boolean;
  rules?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupPage {
  groups: GroupResponse[];
  page: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

export interface GroupMeta {
  id: string;
  name: string;
  coverUrl?: string;
  privacy: 'PUBLIC' | 'PRIVATE' | string;
}

export const groupMetaCache: Record<string, GroupMeta> = {};

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

/** Ảnh bìa mặc định cũ (unsplash) coi như chưa có ảnh bìa để hiển thị ảnh thay thế đẹp hơn. */
export const resolveGroupCover = (url?: string | null): string | undefined => {
  if (typeof url !== 'string') return undefined;
  const trimmed = url.trim();
  if (!trimmed || trimmed.includes('images.unsplash.com/photo-1522071820081')) return undefined;
  return trimmed;
};

export const mapGroupForCurrentUser = (group: any): GroupResponse => {
  const currentUserId = getCurrentUserId();
  const ownerId = String(group.ownerId || group.creatorId || '');
  // Lombok/Jackson có thể serialize `boolean isMember` thành `member`: chấp nhận cả hai dạng
  const isMember = group.member === true || group.isMember === true;
  const isAdmin = group.admin === true || group.isAdmin === true;
  const isModerator = group.moderator === true || group.isModerator === true;

  const mapped: GroupResponse = {
    ...group,
    id: String(group.id),
    name: group.name || 'Nhóm',
    description: group.description || '',
    privacy: group.privacy || 'PUBLIC',
    ownerId,
    coverUrl: resolveGroupCover(group.coverUrl),
    isMember,
    isAdmin,
    isModerator,
    isOwner: Boolean(currentUserId && ownerId && ownerId === currentUserId),
    joinStatus: group.joinStatus || undefined,
    memberCount: Number(group.memberCount ?? 0),
    createdAt: group.createdAt || '',
    updatedAt: group.updatedAt || '',
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

const isUuid = (val?: string) =>
  typeof val === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export const groupService = {
  createGroup: async (request: CreateGroupRequest): Promise<GroupResponse> => {
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
    const mapped = mapGroupForCurrentUser(data);
    window.dispatchEvent(new CustomEvent('community_group_created', { detail: mapped }));
    return mapped;
  },

  /**
   * Danh sách nhóm có phân trang (page từ 1) và tìm kiếm ở server.
   * Ném lỗi khi gọi thất bại để giao diện hiện đúng trạng thái lỗi thay vì "chưa có nhóm nào".
   */
  getGroups: async (options: { scope?: GroupScope; keyword?: string; page?: number; size?: number } = {}): Promise<GroupPage> => {
    const { scope = 'all', keyword = '', page = 1, size = 12 } = options;
    const response = await api.get('/groups', { params: { scope, keyword: keyword.trim() || undefined, page, size } });
    const body = response.data;
    const data = Array.isArray(body?.data) ? body.data : [];
    return {
      groups: data.map(mapGroupForCurrentUser),
      page: Number(body?.page ?? page),
      totalPages: Number(body?.totalPages ?? 1),
      totalElements: Number(body?.totalElements ?? data.length),
      last: Boolean(body?.last ?? true),
    };
  },

  /** Trả về null khi nhóm không tồn tại (404); các lỗi khác (mạng, server) được ném ra. */
  getGroupById: async (id: string): Promise<GroupResponse | null> => {
    try {
      const response = await api.get(`/groups/${id}`);
      const data = response.data?.data || response.data;
      return data && data.id ? mapGroupForCurrentUser(data) : null;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  toggleJoinGroup: async (id: string): Promise<GroupResponse | null> => {
    const response = await api.post(`/groups/${id}/join`);
    const data = response.data?.data || response.data;
    if (!data?.id) return null;
    const mapped = mapGroupForCurrentUser(data);
    window.dispatchEvent(new CustomEvent('community_group_updated', { detail: mapped }));
    return mapped;
  },

  leaveGroup: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}/members/me`);
    window.dispatchEvent(new CustomEvent('community_group_updated'));
  },

  addGroupMembers: async (groupId: string, memberIdsToAdd: string[]): Promise<GroupResponse | null> => {
    const validMemberIds = memberIdsToAdd.filter(isUuid);
    const response = await api.post(`/groups/${groupId}/members`, validMemberIds.length > 0 ? validMemberIds : memberIdsToAdd);
    const data = response.data?.data || response.data;
    if (data?.id) {
      const mapped = mapGroupForCurrentUser(data);
      window.dispatchEvent(new CustomEvent('community_group_updated', { detail: mapped }));
      return mapped;
    }
    return null;
  },

  /** Ném lỗi khi thất bại (vd: nhóm riêng tư mà mình chưa là thành viên) để người gọi tự quyết định. */
  getGroupMembers: async (groupId: string, includePending = false): Promise<CommunityGroupMember[]> => {
    const response = await api.get(`/groups/${groupId}/members`, { params: { includePending } });
    const data = response.data?.data || response.data;
    if (!Array.isArray(data)) return [];
    return data.map((member: any) => ({
      id: String(member.userId || member.id),
      name: member.name || 'Thành viên',
      avatar: member.avatarUrl || member.avatar || '/default-avatar.png',
      role: member.role || 'MEMBER',
      status: member.status,
      joinedAt: member.joinedAt || '',
    }));
  },

  updateGroup: async (groupId: string, data: Partial<CreateGroupRequest>): Promise<GroupResponse> => {
    const response = await api.put(`/groups/${groupId}`, data);
    const updated = response.data?.data || response.data;
    if (!updated?.id) throw new Error('Không thể lưu thay đổi nhóm.');
    const mapped = mapGroupForCurrentUser(updated);
    window.dispatchEvent(new CustomEvent('community_group_updated', { detail: mapped }));
    return mapped;
  },

  /** Tải ảnh lên media-service và trả về đường dẫn ảnh. */
  uploadCover: async (file: File): Promise<string> => {
    const media = await mediaService.uploadMedia(file, 'covers');
    if (!media?.fileUrl) throw new Error('Không tải được ảnh lên.');
    return media.fileUrl;
  },

  /** Tải ảnh lên rồi lưu làm ảnh bìa của nhóm. */
  changeGroupCover: async (groupId: string, file: File): Promise<GroupResponse> => {
    return groupService.updateGroup(groupId, { coverUrl: await groupService.uploadCover(file) });
  },

  deleteGroup: async (groupId: string): Promise<void> => {
    await api.delete(`/groups/${groupId}`);
    window.dispatchEvent(new CustomEvent('community_group_updated'));
  },

  reviewMember: async (groupId: string, memberId: string, approved: boolean): Promise<GroupResponse> => {
    const response = await api.post(`/groups/${groupId}/members/${memberId}/review`, null, { params: { approved } });
    const mapped = mapGroupForCurrentUser(response.data?.data || response.data);
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

  unbanMember: async (groupId: string, memberId: string): Promise<void> => {
    await api.post(`/groups/${groupId}/members/${memberId}/unban`);
    window.dispatchEvent(new CustomEvent('community_group_updated'));
  },

  transferOwnership: async (groupId: string, newOwnerId: string): Promise<void> => {
    await api.put(`/groups/${groupId}/owner`, null, { params: { newOwnerId } });
    window.dispatchEvent(new CustomEvent('community_group_updated'));
  },

  /** Tìm nhóm theo tên/mô tả (dùng cho ô tìm kiếm chung); lỗi thì trả danh sách rỗng. */
  searchGroups: async (keyword: string): Promise<GroupResponse[]> => {
    try {
      return (await groupService.getGroups({ scope: 'all', keyword, size: 10 })).groups;
    } catch {
      return [];
    }
  },
};
