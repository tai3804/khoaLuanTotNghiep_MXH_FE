import { api } from './axiosClient';
import { store } from '../store/store';
import { fetchAuthorProfile, authorProfileCache } from './userService';

export interface StoryAudioMeta {
  title: string;
  artist: string;
  url: string;
}

export function parseStoryCaption(rawCaption?: string): { text: string; audio?: StoryAudioMeta } {
  if (!rawCaption) return { text: '' };
  const trimmed = rawCaption.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        text: parsed.text || '',
        audio: parsed.audio,
      };
    } catch {}
  }
  return { text: rawCaption };
}

export interface StoryItem {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  caption?: string;
  privacy?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
  createdAt: string;
  expiresAt: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  viewCount?: number;
  viewsCount?: number;
  isViewedByMe?: boolean;
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
        const now = Date.now();
        const enriched = await Promise.all(
          data.map(async (u: any) => {
            const uid = String(u.userId);
            let profile = authorProfileCache[uid];
            if (!profile || profile.name === 'Thành viên KLTN' || profile.name === 'Người dùng') {
              profile = (await fetchAuthorProfile(uid)) || profile;
            }

            // Facebook Rule: Stories strictly expire after 24 hours
            const activeStories = (u.stories || []).filter((s: any) => {
              if (s.isArchived || s.isDeleted) return false;
              if (s.expiresAt) {
                return new Date(s.expiresAt).getTime() > now;
              }
              if (s.createdAt) {
                return now - new Date(s.createdAt).getTime() < 24 * 60 * 60 * 1000;
              }
              return true;
            });

            return {
              ...u,
              userId: uid,
              fullName: profile?.name || u.fullName || u.username || 'Người dùng',
              avatarUrl: profile?.avatar || u.avatarUrl || '/default-avatar.png',
              stories: activeStories.map((s: any) => ({
                ...s,
                id: String(s.id),
                userId: String(s.userId || uid),
                viewCount: Number(s.viewsCount ?? s.viewCount ?? 0),
                viewsCount: Number(s.viewsCount ?? s.viewCount ?? 0),
              })),
            };
          })
        );
        // Exclude users who don't have any active stories currently within the 24h window
        return enriched.filter((u) => u.stories.length > 0);
      }
      return [];
    } catch {
      return [];
    }
  },
  getStoryArchive: async (page = 1, size = 20): Promise<{ content: StoryItem[]; totalPages: number; totalElements: number }> => {
    try {
      const res = await api.get('/stories/archive', { params: { page, size } });
      const items = res.data?.data || [];
      return {
        content: Array.isArray(items)
          ? items.map((s: any) => ({
              ...s,
              id: String(s.id),
              userId: String(s.userId),
              viewCount: Number(s.viewsCount ?? s.viewCount ?? 0),
              viewsCount: Number(s.viewsCount ?? s.viewCount ?? 0),
            }))
          : [],
        totalPages: Number(res.data?.totalPages || 1),
        totalElements: Number(res.data?.totalElements || (Array.isArray(items) ? items.length : 0)),
      };
    } catch {
      return { content: [], totalPages: 0, totalElements: 0 };
    }
  },
  createStory: async (
    mediaUrl: string,
    mediaType: 'IMAGE' | 'VIDEO' = 'IMAGE',
    caption?: string,
    privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' = 'PUBLIC'
  ) => {
    const res = await api.post('/stories', { mediaUrl, mediaType, caption, privacy });
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
