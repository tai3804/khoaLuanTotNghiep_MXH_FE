import { api } from './axiosClient';
import { store } from '../store/store';
import { fetchAuthorProfile, authorProfileCache } from './userService';

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

export interface StoryViewerItem {
  id: string;
  storyId: string;
  viewerId: string;
  viewedAt: string;
  viewerName?: string;
  viewerAvatar?: string;
}

export const storyService = {
  getStories: async (): Promise<UserStories[]> => {
    const token = store.getState().auth.accessToken;
    if (!token) return [];
    try {
      const res = await api.get('/stories');
      const data = res.data?.data || res.data?.result || [];
      if (Array.isArray(data)) {
        const enriched = await Promise.all(
          data.map(async (u: any) => {
            const uid = String(u.userId);
            let profile = authorProfileCache[uid];
            if (!profile || profile.name === 'Thành viên KLTN' || profile.name === 'Người dùng') {
              profile = (await fetchAuthorProfile(uid)) || profile;
            }
            return {
              ...u,
              userId: uid,
              fullName: profile?.name || u.fullName || u.username || 'Người dùng',
              avatarUrl: profile?.avatar || u.avatarUrl || '/default-avatar.png',
              stories: (u.stories || []).map((s: any) => ({
                ...s,
                id: String(s.id),
                userId: String(s.userId || uid),
                viewCount: Number(s.viewsCount ?? s.viewCount ?? 0),
                viewsCount: Number(s.viewsCount ?? s.viewCount ?? 0),
              })),
            };
          })
        );
        return enriched;
      }
      return [];
    } catch {
      return [];
    }
  },
  createStory: async (mediaUrl: string, mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE', content?: string) => {
    const res = await api.post('/stories', { mediaUrl, mediaType, content });
    return res.data?.data || res.data;
  },
  viewStory: async (storyId: string) => {
    const res = await api.post(`/stories/${storyId}/view`);
    return res.data;
  },
  getViewers: async (storyId: string, page = 1, size = 50): Promise<StoryViewerItem[]> => {
    try {
      const res = await api.get(`/stories/${storyId}/viewers`, { params: { page, size } });
      const data = res.data?.data?.content || res.data?.data || [];
      if (Array.isArray(data)) {
        const enriched = await Promise.all(
          data.map(async (v: any) => {
            const vid = String(v.viewerId);
            let profile = authorProfileCache[vid];
            if (!profile || profile.name === 'Thành viên KLTN' || profile.name === 'Người dùng') {
              profile = (await fetchAuthorProfile(vid)) || profile;
            }
            return {
              ...v,
              id: String(v.id || v.viewerId),
              viewerId: vid,
              viewerName: profile?.name || 'Người dùng',
              viewerAvatar: profile?.avatar || '/default-avatar.png',
            };
          })
        );
        return enriched;
      }
      return [];
    } catch {
      return [];
    }
  },
  deleteStory: async (storyId: string) => {
    const res = await api.delete(`/stories/${storyId}`);
    return res.data;
  },
};
