import { api } from './axiosClient';

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

  getUserPresence: async (userId: string) => {
    try {
      const res = await api.get(`/chat/presence/${userId}`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  getBatchPresence: async (userIds: string[]) => {
    try {
      if (!userIds || userIds.length === 0) return {};
      const res = await api.post('/chat/presence/batch', userIds);
      return res.data?.data || {};
    } catch {
      return {};
    }
  },
};
