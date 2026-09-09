import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Post, Comment } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(BASE_URL + '/auth/refresh', { refreshToken });
          const newToken = res.data?.data?.accessToken || res.data?.data?.token || res.data?.token;
          if (newToken) {
            localStorage.setItem('token', newToken);
            originalRequest.headers.Authorization = 'Bearer ' + newToken;
            return api(originalRequest);
          }
        } catch (e) {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authorProfileCache: Record<string, { name: string; avatar: string }> = {
  '0d0455f2-c0bf-4e88-beb3-ada9096331cb': { name: 'Nguyễn Văn An', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  '65184771-2b30-491e-8a1c-a54253125ba6': { name: 'Trần Thị Bình', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  '49f4c3d5-c9a6-4c60-abeb-ee8739771a92': { name: 'Lê Hoàng Cường', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  '04728d5e-9d52-437f-88d7-36d856f73ccd': { name: 'Phạm Minh Đức', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  '7d0804f8-5582-4497-9409-e9b7b45d6985': { name: 'Hoàng Thu Hà', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
  'f165579d-0a38-4c3a-b9e1-d4f34277bad4': { name: 'Đặng Quốc Huy', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  '261c0e7c-5eae-4f94-93d7-1ee7dbf01c19': { name: 'Vũ Thị Mai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
  '7ac740f1-635b-434c-8919-ac9002b9edc6': { name: 'Bùi Tuấn Nam', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
  '7f123ae7-243d-45f0-99a5-fbe2dbf8b2be': { name: 'Đỗ Phương Thảo', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  'ea5d0f19-8417-461e-8777-45fcd7b7567c': { name: 'Ngô Quang Vinh', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
};

export const fetchAuthorProfile = async (userId: string) => {
  if (!userId || userId === 'me') return null;

  // Check if user is current authenticated user
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed && (parsed.id === userId || parsed.userId === userId) && parsed.fullName) {
        authorProfileCache[userId] = { name: parsed.fullName, avatar: parsed.avatar || '' };
        return authorProfileCache[userId];
      }
    }
  } catch {}

  if (authorProfileCache[userId] && authorProfileCache[userId].name !== 'Thành viên KLTN' && authorProfileCache[userId].name !== 'Người dùng') {
    return authorProfileCache[userId];
  }

  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const profile = await userService.getUserProfile(userId);
    if (profile) {
      const parts = [profile.lastName, profile.middleName, profile.firstName].filter(Boolean);
      const name = parts.join(' ').trim() || 'Thành viên KLTN';
      const avatar = profile.avatarUrl || '/default-avatar.png';
      authorProfileCache[userId] = { name, avatar };
      return authorProfileCache[userId];
    }
  } catch {
    // ignore
  }
  return null;
};

export const normalizePost = (p: any): Post => {
  const mediaUrls = Array.isArray(p.mediaList)
    ? p.mediaList.map((m: any) => m.mediaUrl || m.url || m)
    : Array.isArray(p.mediaUrls)
    ? p.mediaUrls
    : [];

  const authorId = p.authorId ? String(p.authorId) : p.userId || 'me';
  const cached = authorProfileCache[authorId];

  let currentUserName = '';
  let currentUserAvatar = '';
  try {
    const uStr = localStorage.getItem('user');
    if (uStr) {
      const u = JSON.parse(uStr);
      if (u.id === authorId) {
        currentUserName = u.fullName || u.username;
        currentUserAvatar = u.avatar || '';
      }
    }
  } catch {}

  const authorName =
    currentUserName ||
    p.authorName ||
    cached?.name ||
    (p.author ? [p.author.lastName, p.author.middleName, p.author.firstName].filter(Boolean).join(' ').trim() : 'Thành viên KLTN');

  const authorAvatar =
    currentUserAvatar ||
    p.authorAvatar ||
    cached?.avatar ||
    p.author?.avatarUrl ||
    '/default-avatar.png';

  return {
    id: p.id ? String(p.id) : 'post-' + Date.now(),
    userId: authorId,
    authorName: authorName || 'Thành viên KLTN',
    authorAvatar,
    content: p.content || '',
    mediaUrls,
    createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong',
    likesCount: Number(p.likeCount ?? p.likesCount ?? 0),
    commentsCount: Number(p.commentCount ?? p.commentsCount ?? 0),
    sharesCount: Number(p.shareCount ?? p.sharesCount ?? 0),
    isLiked: Boolean(p.isLiked),
    privacy: p.privacy || 'PUBLIC',
    comments: p.comments || [],
  };
};

export const authService = {
  login: async (data: any) => {
    let deviceFingerprint = localStorage.getItem('deviceFingerprint');
    if (!deviceFingerprint) {
      deviceFingerprint = 'web-' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('deviceFingerprint', deviceFingerprint);
    }

    const payload = {
      email: data.email || data.username,
      password: data.password,
      deviceFingerprint,
      deviceName: 'Trình duyệt Web',
    };
    const res = await api.post('/auth/login', payload);
    return res.data;
  },
  register: async (data: any) => {
    const rawName = (data.fullName || data.username || 'User').trim();
    const parts = rawName.split(/\s+/);
    const lastName = parts.length > 1 ? parts[0] : 'User';
    const firstName = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];

    const payload = {
      email: data.email,
      password: data.password,
      firstName: firstName || 'User',
      lastName: lastName || 'User',
    };
    const res = await api.post('/auth/register', payload);
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },
  // Quản lý thiết bị đăng nhập (auth-service)
  getDevices: async () => {
    const res = await api.get('/devices');
    return res.data?.data?.devices || res.data?.data || [];
  },
  revokeDevice: async (deviceId: string) => {
    const res = await api.delete(`/devices/${deviceId}`);
    return res.data;
  },
  // Xác thực 2 bước (MFA)
  setupMfa: async () => {
    const res = await api.post('/auth/mfa/setup');
    return res.data?.data || res.data;
  },
  enableMfa: async (otpCode: string) => {
    const res = await api.post('/auth/mfa/enable', { otpCode, mfaType: 'TOTP' });
    return res.data;
  },
  disableMfa: async (otpCode: string) => {
    const res = await api.post('/auth/mfa/disable', { otpCode });
    return res.data;
  },
};

export const userService = {
  getMyProfile: async () => {
    const res = await api.get('/users/profile/me');
    return res.data?.data || res.data?.result || res.data;
  },
  getUserProfile: async (userId: string) => {
    if (!userId || userId === 'me') {
      return userService.getMyProfile();
    }
    try {
      const res = await api.get(`/users/profile/${userId}`);
      return res.data?.data || res.data?.result || res.data;
    } catch (err: any) {
      // If user queried own ID or error occurred, check if it's the current user
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u.id === userId || u.profileId === userId) {
            return await userService.getMyProfile();
          }
        }
      } catch {}
      throw err;
    }
  },
  updateMyProfile: async (data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    avatarUrl?: string;
    coverUrl?: string;
    bio?: string;
    dateOfBirth?: string;
    gender?: string;
    location?: string;
    website?: string;
  }) => {
    const res = await api.put('/users/profile/me', data);
    return res.data?.data || res.data;
  },
  getFriends: async (page = 0, size = 50) => {
    try {
      const res = await api.get('/users/connections/friends', { params: { page, size } });
      const data = res.data?.data?.content || res.data?.data || res.data?.result || [];
      if (Array.isArray(data)) {
        let currentUserId = '';
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          currentUserId = String(u.id || u.userId || u.profileId || '').toLowerCase();
        } catch {}

        const friendIds = Array.from(
          new Set(
            data
              .map((c: any) => {
                const isCurrentRequester = String(c.requesterId).toLowerCase() === currentUserId;
                const fid = isCurrentRequester ? c.targetId : c.requesterId;
                return fid ? String(fid) : null;
              })
              .filter((id) => id && String(id).toLowerCase() !== currentUserId)
          )
        ) as string[];

        await Promise.all(friendIds.map((id) => fetchAuthorProfile(id)));

        return data
          .map((c: any) => {
            const isCurrentRequester = String(c.requesterId).toLowerCase() === currentUserId;
            const fid = String(isCurrentRequester ? c.targetId : c.requesterId);
            const profile = authorProfileCache[fid];
            return {
              id: fid,
              connectionId: String(c.id),
              userId: fid,
              name: profile?.name || c.name || 'Thành viên KLTN',
              avatar: profile?.avatar || c.avatar || '/default-avatar.png',
              online: true,
              status: c.status || 'ACCEPTED',
              createdAt: c.createdAt,
            };
          })
          .filter((f: any) => String(f.userId).toLowerCase() !== currentUserId);
      }
      return [];
    } catch {
      return [];
    }
  },
  getUserFriends: async (targetUserId: string, page = 0, size = 50) => {
    if (!targetUserId || targetUserId === 'me') {
      return userService.getFriends(page, size);
    }
    try {
      const res = await api.get(`/users/connections/friends/user/${targetUserId}`, { params: { page, size } });
      const data = res.data?.data?.content || res.data?.data || res.data?.result || [];
      if (Array.isArray(data)) {
        const targetLower = String(targetUserId).toLowerCase();
        const friendIds = Array.from(
          new Set(
            data
              .map((c: any) => {
                const isTargetRequester = String(c.requesterId).toLowerCase() === targetLower;
                const fid = isTargetRequester ? c.targetId : c.requesterId;
                return fid ? String(fid) : null;
              })
              .filter((id) => id && String(id).toLowerCase() !== targetLower)
          )
        ) as string[];

        await Promise.all(friendIds.map((id) => fetchAuthorProfile(id)));

        return data
          .map((c: any) => {
            const isTargetRequester = String(c.requesterId).toLowerCase() === targetLower;
            const fid = String(isTargetRequester ? c.targetId : c.requesterId);
            const profile = authorProfileCache[fid];
            return {
              id: fid,
              connectionId: String(c.id),
              userId: fid,
              name: profile?.name || c.name || 'Thành viên KLTN',
              avatar: profile?.avatar || c.avatar || '/default-avatar.png',
              online: true,
              status: c.status || 'ACCEPTED',
              createdAt: c.createdAt,
            };
          })
          .filter((f: any) => String(f.userId).toLowerCase() !== targetLower);
      }
      return [];
    } catch {
      return userService.getFriends(page, size);
    }
  },
  getConnectionStatus: async (targetUserId: string) => {
    if (!targetUserId || targetUserId === 'me') return null;
    try {
      const res = await api.get(`/users/connections/status/${targetUserId}`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  },
  getFollowers: async (page = 0, size = 20) => {
    const res = await api.get('/users/connections/followers', { params: { page, size } });
    const data = res.data?.data?.content || res.data?.data || [];
    return Array.isArray(data) ? data : [];
  },
  getFollowing: async (page = 0, size = 20) => {
    const res = await api.get('/users/connections/following', { params: { page, size } });
    const data = res.data?.data?.content || res.data?.data || [];
    return Array.isArray(data) ? data : [];
  },
  getPendingRequests: async (page = 0, size = 50) => {
    try {
      const res = await api.get('/users/connections/friend-requests/pending', { params: { page, size } });
      const data = res.data?.data?.content || res.data?.data || [];
      if (Array.isArray(data)) {
        const requesterIds = Array.from(
          new Set(data.map((c: any) => (c.requesterId ? String(c.requesterId) : null)).filter(Boolean))
        ) as string[];

        await Promise.all(requesterIds.map((id) => fetchAuthorProfile(id)));

        return data.map((c: any) => {
          const reqId = String(c.requesterId || c.userId || c.id);
          const profile = authorProfileCache[reqId];
          return {
            id: String(c.id),
            requestId: String(c.id),
            requesterId: reqId,
            userId: reqId,
            name: profile?.name || c.name || 'Người dùng',
            avatar: profile?.avatar || c.avatar || '',
            createdAt: c.createdAt,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  },
  getSuggestedFriends: async () => {
    let currentUserId = '';
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      currentUserId = u.id || '';
    } catch {}

    const seedUsers = [
      { id: '0d0455f2-c0bf-4e88-beb3-ada9096331cb', name: 'Nguyễn Văn An', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', bio: 'Nghiên cứu Microservices & Cloud Architecture' },
      { id: '65184771-2b30-491e-8a1c-a54253125ba6', name: 'Trần Thị Bình', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', bio: 'Frontend Developer @ Tech Corp' },
      { id: '49f4c3d5-c9a6-4c60-abeb-ee8739771a92', name: 'Lê Hoàng Cường', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', bio: 'DevOps & Kubernetes Specialist' },
      { id: '04728d5e-9d52-437f-88d7-36d856f73ccd', name: 'Phạm Minh Đức', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', bio: 'Data Science & Machine Learning Engineer' },
      { id: '7d0804f8-5582-4497-9409-e9b7b45d6985', name: 'Hoàng Thu Hà', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', bio: 'UI/UX Designer | Yêu thiết kế sáng tạo' },
      { id: 'f165579d-0a38-4c3a-b9e1-d4f34277bad4', name: 'Đặng Quốc Huy', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', bio: 'Chuyên gia An toàn thông tin & CTF' },
      { id: '261c0e7c-5eae-4f94-93d7-1ee7dbf01c19', name: 'Vũ Thị Mai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', bio: 'Product Manager | Tech Lead' },
      { id: '7ac740f1-635b-434c-8919-ac9002b9edc6', name: 'Bùi Tuấn Nam', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', bio: 'Fullstack Engineer | React & Spring Boot' },
      { id: '7f123ae7-243d-45f0-99a5-fbe2dbf8b2be', name: 'Đỗ Phương Thảo', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', bio: 'Content Creator & Marketing Specialist' },
      { id: 'ea5d0f19-8417-461e-8777-45fcd7b7567c', name: 'Ngô Quang Vinh', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', bio: 'Sinh viên CNTT - KLTN 2026' },
    ];

    return seedUsers.filter((u) => u.id !== currentUserId);
  },
  sendFriendRequest: async (targetId: string) => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.id === targetId || u.profileId === targetId) {
          throw new Error('Bạn không thể gửi lời mời kết bạn cho chính mình');
        }
      }
    } catch (err: any) {
      if (err.message?.includes('chính mình')) throw err;
    }
    const res = await api.post(`/users/connections/friend-requests/${targetId}`);
    return res.data;
  },
  acceptFriendRequest: async (requestId: string) => {
    const res = await api.post(`/users/connections/friend-requests/${requestId}/accept`);
    return res.data;
  },
  rejectFriendRequest: async (requestId: string) => {
    const res = await api.post(`/users/connections/friend-requests/${requestId}/reject`);
    return res.data;
  },
  unfriend: async (friendId: string) => {
    const res = await api.delete(`/users/connections/friends/${friendId}`);
    return res.data;
  },
  follow: async (targetId: string) => {
    const res = await api.post(`/users/connections/follow/${targetId}`);
    return res.data;
  },
  unfollow: async (targetId: string) => {
    const res = await api.post(`/users/connections/unfollow/${targetId}`);
    return res.data;
  },
};

export const postService = {
  getFeed: async (page = 1, size = 100): Promise<Post[]> => {
    try {
      const res = await api.get('/posts', {
        params: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' },
      });
      const raw = Array.isArray(res.data?.data)
        ? res.data.data
        : (res.data?.data?.content || res.data?.result || res.data || []);

      if (Array.isArray(raw) && raw.length > 0) {
        const authorIds = Array.from(new Set(raw.map((p: any) => (p.authorId ? String(p.authorId) : null)).filter(Boolean))) as string[];
        Promise.all(authorIds.map((id) => fetchAuthorProfile(id))).catch(() => {});
        return raw.map(normalizePost);
      }
      return [];
    } catch (err: any) {
      console.error('getFeed error:', err);
      return [];
    }
  },
  getAllPosts: async (page = 1, size = 100): Promise<Post[]> => {
    try {
      const res = await api.get('/posts', {
        params: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' },
      });
      const raw = res.data?.data?.content || res.data?.data || res.data?.result || [];
      if (Array.isArray(raw)) {
        const authorIds = Array.from(new Set(raw.map((p) => (p.authorId ? String(p.authorId) : null)).filter(Boolean))) as string[];
        await Promise.all(authorIds.map((id) => fetchAuthorProfile(id)));
        return raw.map(normalizePost);
      }
      return [];
    } catch {
      return [];
    }
  },
  createPost: async (content: string, privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' = 'PUBLIC', files: File[] = []): Promise<Post> => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('privacy', privacy);
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const data = res.data?.data || res.data;
    return normalizePost(data);
  },
  getUserPosts: async (userId: string, page = 0, size = 100): Promise<Post[]> => {
    try {
      const res = await api.get(`/posts/user/${userId}`, {
        params: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' },
      });
      const raw = res.data?.data?.content || res.data?.data || res.data?.result || res.data || [];
      if (Array.isArray(raw)) {
        const authorIds = Array.from(new Set(raw.map((p) => (p.authorId ? String(p.authorId) : null)).filter(Boolean))) as string[];
        await Promise.all(authorIds.map((id) => fetchAuthorProfile(id)));
        return raw.map(normalizePost);
      }
      return [];
    } catch {
      return [];
    }
  },
  deletePost: async (postId: string) => {
    const res = await api.delete(`/posts/${postId}`);
    return res.data;
  },
  reactPost: async (postId: string, type: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY' = 'LIKE') => {
    const res = await api.post(`/posts/${postId}/reactions`, { type });
    return res.data;
  },
  removeReaction: async (postId: string) => {
    const res = await api.delete(`/posts/${postId}/reactions`);
    return res.data;
  },
  getComments: async (postId: string): Promise<Comment[]> => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      const data = res.data?.data?.content || res.data?.data || res.data?.result || [];
      if (Array.isArray(data)) {
        // Collect author IDs and fetch profiles from user-service
        const authorIds = Array.from(new Set(data.map((c: any) => (c.authorId ? String(c.authorId) : null)).filter(Boolean))) as string[];
        await Promise.all(authorIds.map((id) => fetchAuthorProfile(id)));

        // Get logged in user from localStorage if available
        let currentUser: any = null;
        try {
          const uStr = localStorage.getItem('user');
          if (uStr) currentUser = JSON.parse(uStr);
        } catch {}

        return data.map((c: any) => {
          const authorId = String(c.authorId || c.userId || '');
          const cached = authorProfileCache[authorId];
          let authorName = c.authorName;
          let authorAvatar = c.authorAvatar || c.author?.avatarUrl || '';

          if (!authorName || authorName === 'Người dùng' || authorName === 'Thành viên' || authorName === 'Thành viên KLTN') {
            if (currentUser && (currentUser.id === authorId || authorId === 'me')) {
              authorName = currentUser.fullName || currentUser.username;
              if (!authorAvatar) authorAvatar = currentUser.avatar;
            } else if (cached?.name) {
              authorName = cached.name;
              if (!authorAvatar) authorAvatar = cached.avatar;
            } else if (c.author) {
              authorName = [c.author.lastName, c.author.middleName, c.author.firstName].filter(Boolean).join(' ').trim();
            }
          }

          return {
            id: String(c.id),
            postId: String(c.postId || postId),
            userId: authorId || 'user',
            authorName: authorName || 'Thành viên KLTN',
            authorAvatar: authorAvatar || cached?.avatar || '',
            content: c.content || '',
            createdAt: c.createdAt ? new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
            likesCount: Number(c.likeCount || 0),
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  },
  addComment: async (postId: string, content: string, file?: File): Promise<Comment> => {
    let currentUser: any = null;
    try {
      const uStr = localStorage.getItem('user');
      if (uStr) currentUser = JSON.parse(uStr);
    } catch {}

    const formData = new FormData();
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }
    const res = await api.post(`/posts/${postId}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const c = res.data?.data || res.data;
    const authorId = String(c.authorId || c.userId || currentUser?.id || 'me');
    const cached = authorProfileCache[authorId];

    return {
      id: String(c.id),
      postId: String(c.postId || postId),
      userId: authorId,
      authorName: currentUser?.fullName || cached?.name || c.authorName || 'Bạn',
      authorAvatar: currentUser?.avatar || cached?.avatar || c.authorAvatar || '',
      content: c.content || content,
      createdAt: 'Vừa xong',
      likesCount: 0,
    };
  },
  deleteComment: async (postId: string, commentId: string) => {
    const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return res.data;
  },
};

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
    const res = await api.post('/chat/conversations/direct', { targetUserId });
    return res.data?.data || res.data;
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