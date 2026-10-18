import { api } from './axiosClient';
import { mediaService } from './mediaService';

export type GroupScope = 'all' | 'discover' | 'joined' | 'pending' | 'invited';
export type GroupJoinStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED' | 'INVITED';
export type GroupRole = 'ADMIN' | 'MODERATOR' | 'MEMBER';
/** Mức nhận thông báo của nhóm: ALL = mọi bài viết mới, HIGHLIGHTS = chỉ việc liên quan tới mình (mặc định), OFF = tắt. */
export type GroupNotificationLevel = 'ALL' | 'HIGHLIGHTS' | 'OFF';
/** Bộ lọc danh sách thành viên; pending/banned/invited chỉ dành cho quản trị/kiểm duyệt viên. */
export type MemberScope = 'all' | 'members' | 'staff' | 'pending' | 'banned' | 'invited';

export interface CreateGroupRequest {
  name: string;
  description?: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  coverUrl?: string;
  initialMemberIds?: string[];
  postApprovalRequired?: boolean;
  rules?: string;
  /** Câu hỏi cho người xin vào nhóm riêng tư (tối đa 3). */
  membershipQuestions?: string[];
}

export interface CommunityGroupMember {
  id: string;
  name: string;
  avatar: string;
  role: GroupRole;
  status?: GroupJoinStatus;
  joinedAt: string;
  /** Câu trả lời khi xin vào nhóm (chỉ quản trị/kiểm duyệt viên thấy, ở danh sách chờ duyệt). */
  answers?: string[];
  /** Người đã mời (ở danh sách lời mời đang chờ). */
  invitedByName?: string;
}

/** Quản trị viên / người kiểm duyệt của nhóm (ai cũng xem được). */
export interface GroupStaffMember {
  id: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'MODERATOR';
  isOwner: boolean;
}

export interface GroupMemberPreview {
  id: string;
  name: string;
  avatar: string;
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
  /** Câu hỏi dành cho người xin vào nhóm riêng tư (mảng rỗng nếu không có). */
  membershipQuestions: string[];
  /** Mức thông báo mình đã chọn (chỉ có khi là thành viên). */
  notificationLevel?: GroupNotificationLevel;
  /** Tên người mời mình (khi joinStatus = INVITED, chỉ ở chi tiết một nhóm). */
  invitedByName?: string;
  /** Số yêu cầu tham gia đang chờ duyệt (chỉ quản trị/kiểm duyệt viên, chỉ ở chi tiết một nhóm). */
  pendingRequestCount?: number;
  /** Số thành viên mới trong 7 ngày qua (chỉ ở chi tiết một nhóm). */
  newMembersThisWeek?: number;
  /** Vài thành viên đầu cho dải ảnh đại diện (chỉ ở chi tiết một nhóm, khi mình được xem thành viên). */
  memberPreview?: GroupMemberPreview[];
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

export interface MemberPage {
  members: CommunityGroupMember[];
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

/** Liên kết mở thẳng nhóm (để sao chép/chia sẻ). */
export const getGroupLink = (groupId: string): string => `${window.location.origin}/groups/${groupId}`;

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
    membershipQuestions: Array.isArray(group.membershipQuestions) ? group.membershipQuestions.map(String) : [],
    notificationLevel: group.notificationLevel || undefined,
    invitedByName: group.invitedByName || undefined,
    pendingRequestCount: typeof group.pendingRequestCount === 'number' ? group.pendingRequestCount : undefined,
    newMembersThisWeek: typeof group.newMembersThisWeek === 'number' ? group.newMembersThisWeek : undefined,
    memberPreview: Array.isArray(group.memberPreview)
      ? group.memberPreview.map((m: any) => ({
          id: String(m.userId || m.id),
          name: m.name || 'Thành viên',
          avatar: m.avatarUrl || m.avatar || '/default-avatar.png',
        }))
      : undefined,
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

const mapMember = (member: any): CommunityGroupMember => ({
  id: String(member.userId || member.id),
  name: member.name || 'Thành viên',
  avatar: member.avatarUrl || member.avatar || '/default-avatar.png',
  role: member.role || 'MEMBER',
  status: member.status,
  joinedAt: member.joinedAt || '',
  answers: Array.isArray(member.answers) ? member.answers.map(String) : undefined,
  invitedByName: member.invitedByName || undefined,
});

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

/** Báo cho các màn hình đang mở (thanh bên, danh sách nhóm...) tải lại dữ liệu nhóm. */
const notifyGroupsChanged = (detail?: GroupResponse) => {
  window.dispatchEvent(new CustomEvent('community_group_updated', detail ? { detail } : undefined));
};

const pickGroup = (response: any): GroupResponse | null => {
  const data = response.data?.data || response.data;
  return data?.id ? mapGroupForCurrentUser(data) : null;
};

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
      membershipQuestions: request.membershipQuestions?.map((q) => q.trim()).filter(Boolean),
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
   * Danh sách nhóm có phân trang (page từ 1) và tìm kiếm ở server (không phân biệt dấu).
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
      return pickGroup(response);
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  /** Tham gia nhóm (gọi lại cũng an toàn). Nhóm riêng tư có câu hỏi thì cần kèm câu trả lời theo thứ tự. */
  joinGroup: async (id: string, answers?: string[]): Promise<GroupResponse | null> => {
    const response = await api.post(`/groups/${id}/join`, answers && answers.length > 0 ? { answers } : {});
    const mapped = pickGroup(response);
    notifyGroupsChanged(mapped ?? undefined);
    return mapped;
  },

  /** Hủy yêu cầu tham gia đang chờ duyệt của chính mình. */
  cancelJoinRequest: async (id: string): Promise<GroupResponse | null> => {
    const response = await api.delete(`/groups/${id}/join-request`);
    const mapped = pickGroup(response);
    notifyGroupsChanged(mapped ?? undefined);
    return mapped;
  },

  /** Người được mời chấp nhận (accept=true) hoặc từ chối lời mời vào nhóm. */
  respondToInvitation: async (id: string, accept: boolean): Promise<GroupResponse | null> => {
    const response = await api.post(`/groups/${id}/invitation/${accept ? 'accept' : 'decline'}`);
    const mapped = pickGroup(response);
    notifyGroupsChanged(mapped ?? undefined);
    return mapped;
  },

  leaveGroup: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}/members/me`);
    notifyGroupsChanged();
  },

  /**
   * Quản trị/kiểm duyệt viên thêm thẳng bạn bè vào nhóm; thành viên thường gửi lời mời
   * (người được mời phải chấp nhận). Chỉ mời được bạn bè của mình.
   */
  addGroupMembers: async (groupId: string, memberIdsToAdd: string[]): Promise<GroupResponse | null> => {
    const validMemberIds = memberIdsToAdd.filter(isUuid);
    const response = await api.post(`/groups/${groupId}/members`, validMemberIds.length > 0 ? validMemberIds : memberIdsToAdd);
    const mapped = pickGroup(response);
    notifyGroupsChanged(mapped ?? undefined);
    return mapped;
  },

  /** Danh sách đầy đủ không phân trang (dùng cho việc cần toàn bộ, vd. loại người đã có khỏi danh sách mời). */
  getGroupMembers: async (groupId: string, includePending = false): Promise<CommunityGroupMember[]> => {
    const response = await api.get(`/groups/${groupId}/members`, { params: { includePending } });
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data.map(mapMember) : [];
  },

  /** Thành viên phân trang (page từ 1), tìm theo tên không phân biệt dấu. */
  getGroupMembersPage: async (
    groupId: string,
    options: { scope?: MemberScope; keyword?: string; page?: number; size?: number } = {},
  ): Promise<MemberPage> => {
    const { scope = 'all', keyword = '', page = 1, size = 20 } = options;
    const response = await api.get(`/groups/${groupId}/members/page`, {
      params: { scope, keyword: keyword.trim() || undefined, page, size },
    });
    const body = response.data;
    const data = Array.isArray(body?.data) ? body.data : [];
    return {
      members: data.map(mapMember),
      page: Number(body?.page ?? page),
      totalPages: Number(body?.totalPages ?? 1),
      totalElements: Number(body?.totalElements ?? data.length),
      last: Boolean(body?.last ?? true),
    };
  },

  /** Quản trị viên và người kiểm duyệt của nhóm: ai cũng xem được, kể cả nhóm riêng tư. */
  getGroupStaff: async (groupId: string): Promise<GroupStaffMember[]> => {
    const response = await api.get(`/groups/${groupId}/staff`);
    const data = response.data?.data || [];
    return (Array.isArray(data) ? data : []).map((s: any) => ({
      id: String(s.userId),
      name: s.name || 'Thành viên',
      avatar: s.avatarUrl || '/default-avatar.png',
      role: s.role === 'MODERATOR' ? 'MODERATOR' : 'ADMIN',
      isOwner: Boolean(s.owner),
    }));
  },

  /** Chọn mức nhận thông báo của nhóm (chỉ thành viên). */
  setNotificationLevel: async (groupId: string, level: GroupNotificationLevel): Promise<void> => {
    await api.put(`/groups/${groupId}/members/me/notification-level`, null, { params: { level } });
  },

  updateGroup: async (groupId: string, data: Partial<CreateGroupRequest>): Promise<GroupResponse> => {
    const response = await api.put(`/groups/${groupId}`, data);
    const updated = response.data?.data || response.data;
    if (!updated?.id) throw new Error('Không thể lưu thay đổi nhóm.');
    const mapped = mapGroupForCurrentUser(updated);
    notifyGroupsChanged(mapped);
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
    notifyGroupsChanged();
  },

  reviewMember: async (groupId: string, memberId: string, approved: boolean): Promise<GroupResponse> => {
    const response = await api.post(`/groups/${groupId}/members/${memberId}/review`, null, { params: { approved } });
    const mapped = mapGroupForCurrentUser(response.data?.data || response.data);
    notifyGroupsChanged(mapped);
    return mapped;
  },

  changeMemberRole: async (groupId: string, memberId: string, role: GroupRole): Promise<void> => {
    await api.put(`/groups/${groupId}/members/${memberId}/role`, null, { params: { role } });
    notifyGroupsChanged();
  },

  /** ban=true: cấm khỏi nhóm; deleteContent=true: gỡ luôn bài viết của người đó trong nhóm. */
  removeMember: async (groupId: string, memberId: string, ban = false, deleteContent = false): Promise<void> => {
    await api.delete(`/groups/${groupId}/members/${memberId}`, { params: { ban, deleteContent } });
    notifyGroupsChanged();
  },

  unbanMember: async (groupId: string, memberId: string): Promise<void> => {
    await api.post(`/groups/${groupId}/members/${memberId}/unban`);
    notifyGroupsChanged();
  },

  transferOwnership: async (groupId: string, newOwnerId: string): Promise<void> => {
    await api.put(`/groups/${groupId}/owner`, null, { params: { newOwnerId } });
    notifyGroupsChanged();
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
