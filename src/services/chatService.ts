import { api } from './axiosClient';

export const chatService = {
  getConversations: async () => {
    try {
      const res = await api.get('/chat/conversations');
      const data = res.data?.data?.content || res.data?.data || [];
      return Array.isArray(data) ? data : [];
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
};
