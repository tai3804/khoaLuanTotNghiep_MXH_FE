import { api } from './axiosClient';
import { fetchAuthorProfile } from './userService';

export interface StoryItem {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  createdAt: string;
  expiresAt: string;
  viewCount?: number;
}

export interface UserStories {
  userId: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  stories: StoryItem[];
}

export const storyService = {
  getStories: async (): Promise<UserStories[]> => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const res = await api.get('/stories');
      const data = res.data?.data || res.data?.result || [];
      if (Array.isArray(data)) {
        const userIds = Array.from(new Set(data.map((u: any) => String(u.userId)).filter(Boolean)));
        await Promise.all(userIds.map((id) => fetchAuthorProfile(id)));
        return data;
      }
      return [];
    } catch {
      return [];
    }
  },
  createStory: async (mediaUrl: string, mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE') => {
    const res = await api.post('/stories', { mediaUrl, mediaType });
    return res.data?.data || res.data;
  },
  viewStory: async (storyId: string) => {
    const res = await api.post(`/stories/${storyId}/view`);
    return res.data;
  },
  deleteStory: async (storyId: string) => {
    const res = await api.delete(`/stories/${storyId}`);
    return res.data;
  },
};
