import { api } from './axiosClient';

const presenceCache: Record<string, { online: boolean; lastActiveAt?: string | null; timestamp: number }> = {};
const inFlightPresenceMap = new Map<string, Promise<Record<string, any>>>();
const PRESENCE_CACHE_TTL_MS = 20_000;

export const chatService = {
  getConversations: async () => {
    try {
      const res = await api.get('/chat/conversations');
      const raw = res.data?.data || res.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.content)) return raw.content;
      return [];
    } catch {
      return [];
    }
  },

  createDirectChat: async (targetUserId: string) => {
    if (!targetUserId) throw new Error('targetUserId is required');
    const res = await api.post('/chat/conversations/direct', { targetUserId });
    const data = res.data?.data || res.data;
    if (data && data.conversationId && !data.id) {
      data.id = data.conversationId;
    }
    return data;
  },

  createGroupChat: async (name: string, memberIds: string[], avatarUrl?: string) => {
    if (!memberIds || memberIds.length === 0) throw new Error('memberIds is required');
    const res = await api.post('/chat/conversations/group', { name, memberIds, avatarUrl });
    const data = res.data?.data || res.data;
    if (data && data.conversationId && !data.id) {
      data.id = data.conversationId;
    }
    return data;
  },

  getMessages: async (conversationId: string, page = 0, size = 50) => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages`, { params: { page, size } });
      const data = res.data?.data?.content || res.data?.data || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    const res = await api.post(`/chat/conversations/${conversationId}/messages`, { content, type: 'TEXT' });
    return res.data?.data || res.data;
  },

  markAsRead: async (conversationId: string, messageId?: string) => {
    await api.post(`/chat/conversations/${conversationId}/messages/read`, null, {
      params: messageId ? { messageId } : undefined,
    });
  },

  markAsDelivered: async (conversationId: string, messageId: string) => {
    await api.post(`/chat/conversations/${conversationId}/messages/delivered`, null, { params: { messageId } });
  },

  getUserPresence: async (userId: string) => {
    try {
      const res = await api.get(`/chat/presence/${userId}`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  getBatchPresence: async (userIds: string[]): Promise<Record<string, any>> => {
    if (!userIds || userIds.length === 0) return {};
    const validIds = Array.from(new Set(userIds.map((id) => String(id).trim()).filter(Boolean)));
    if (validIds.length === 0) return {};

    const now = Date.now();
    const result: Record<string, any> = {};
    const missingIds: string[] = [];

    validIds.forEach((id) => {
      const cached = presenceCache[id];
      if (cached && now - cached.timestamp < PRESENCE_CACHE_TTL_MS) {
        result[id] = { online: cached.online, lastActiveAt: cached.lastActiveAt };
      } else {
        missingIds.push(id);
      }
    });

    if (missingIds.length === 0) {
      return result;
    }

    const cacheKey = missingIds.slice().sort().join(',');
    if (inFlightPresenceMap.has(cacheKey)) {
      const fetched = await inFlightPresenceMap.get(cacheKey)!;
      return { ...result, ...fetched };
    }

    const fetchPromise = (async () => {
      try {
        const res = await api.post('/chat/presence/batch', missingIds);
        const data = res.data?.data || {};
        if (data && typeof data === 'object') {
          Object.entries(data).forEach(([uid, val]: [string, any]) => {
            const entry = {
              online: Boolean(val?.online),
              lastActiveAt: val?.lastActiveAt || null,
              timestamp: Date.now(),
            };
            presenceCache[uid] = entry;
            result[uid] = { online: entry.online, lastActiveAt: entry.lastActiveAt };
          });
        }
        return result;
      } catch {
        return result;
      } finally {
        inFlightPresenceMap.delete(cacheKey);
      }
    })();

    inFlightPresenceMap.set(cacheKey, fetchPromise);
    return fetchPromise;
  },

  getConversationDetail: async (conversationId: string) => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}`);
      return res.data?.data || res.data;
    } catch (err) {
      console.error('[chatService] Error fetching conversation detail:', err);
      return null;
    }
  },

  updateGroupInfo: async (conversationId: string, data: { name?: string; avatarUrl?: string }) => {
    const res = await api.put(`/chat/conversations/${conversationId}/group-info`, data);
    return res.data?.data || res.data;
  },

  addGroupMembers: async (conversationId: string, memberIds: string[]) => {
    const res = await api.post(`/chat/conversations/${conversationId}/members`, { memberIds });
    return res.data?.data || res.data;
  },

  removeGroupMember: async (conversationId: string, targetUserId: string) => {
    const res = await api.delete(`/chat/conversations/${conversationId}/members/${targetUserId}`);
    return res.data?.data || res.data;
  },

  leaveGroup: async (conversationId: string) => {
    const res = await api.post(`/chat/conversations/${conversationId}/members/leave`);
    return res.data?.data || res.data;
  },

  promoteAdmin: async (conversationId: string, targetUserId: string) => {
    const res = await api.post(`/chat/conversations/${conversationId}/members/${targetUserId}/promote-admin`);
    return res.data?.data || res.data;
  },

  demoteAdmin: async (conversationId: string, targetUserId: string) => {
    const res = await api.post(`/chat/conversations/${conversationId}/members/${targetUserId}/demote-admin`);
    return res.data?.data || res.data;
  },

  /**
   * Chỉnh sửa tin nhắn (Edit Message Request)
   */
  editMessage: async (conversationId: string, messageId: string, content: string) => {
    const res = await api.put(`/chat/conversations/${conversationId}/messages/${messageId}`, { content });
    return res.data?.data || res.data;
  },

  /**
   * Thu hồi tin nhắn với mọi người (Recall Message Request)
   */
  recallMessage: async (conversationId: string, messageId: string) => {
    const res = await api.delete(`/chat/conversations/${conversationId}/messages/${messageId}/recall`);
    return res.data?.data || res.data;
  },

  /**
   * Xóa tin nhắn ở phía tôi (Delete for me)
   */
  deleteMessageForMe: async (conversationId: string, messageId: string) => {
    const res = await api.delete(`/chat/conversations/${conversationId}/messages/${messageId}/for-me`);
    return res.data?.data || res.data;
  },

  /**
   * Gửi tập tin đính kèm (Send File / Image / Video / Document)
   */
  sendFileMessage: async (
    conversationId: string,
    fileUrl: string,
    fileName?: string,
    type: 'IMAGE' | 'VIDEO' | 'FILE' | 'AUDIO' = 'FILE'
  ) => {
    const res = await api.post(`/chat/conversations/${conversationId}/messages`, {
      content: fileName || fileUrl,
      mediaUrl: fileUrl,
      type,
    });
    return res.data?.data || res.data;
  },
};

