import { api } from './axiosClient';
import { store } from '../store/store';

export const authorProfileCache: Record<string, { name: string; avatar: string }> = {};

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

  // AuthContext persists the token in localStorage; Redux is not guaranteed
  // to be hydrated on pages that render the contacts sidebar first.
  const token = store.getState().auth.accessToken || localStorage.getItem('token');
  if (!token) return null;
  try {
    const profile = await userService.getUserProfile(userId);
    if (profile) {
      const parts = [profile.lastName, profile.middleName, profile.firstName].filter(Boolean);
      const name = profile.fullName || parts.join(' ').trim() || profile.name || profile.username || 'Thành viên KLTN';
      const avatar = profile.avatarUrl || profile.avatar || '/default-avatar.png';
      authorProfileCache[userId] = { name, avatar };
      return authorProfileCache[userId];
    }
  } catch {
    // ignore
  }
  return null;
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
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (String(parsed.id) === String(userId) || String(parsed.userId) === String(userId)) {
            return parsed;
          }
        }
      } catch {}
      throw err;
    }
  },

  updateMyProfile: async (data: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    fullName?: string;
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

  updateProfile: async (data: any) => {
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
                const responseUserId = c.userId ? String(c.userId) : '';
                if (responseUserId && responseUserId.toLowerCase() !== currentUserId) return responseUserId;
                const requesterId = c.requesterId ? String(c.requesterId) : '';
                const targetId = c.targetId ? String(c.targetId) : '';
                const fid = requesterId.toLowerCase() === currentUserId ? targetId
                  : targetId.toLowerCase() === currentUserId ? requesterId
                  : (targetId || requesterId);
                return fid ? String(fid) : null;
              })
              .filter((id) => id && String(id).toLowerCase() !== currentUserId && id !== 'undefined' && id !== 'null')
          )
        ) as string[];

        try {
          localStorage.setItem('my_friend_ids', JSON.stringify(friendIds));
        } catch {}

        await Promise.all(friendIds.map((id) => fetchAuthorProfile(id)));

        return friendIds.map((fid) => {
          const connection = data.find((item: any) =>
            String(item.userId || '').toLowerCase() === fid.toLowerCase() ||
            String(item.requesterId || '').toLowerCase() === fid.toLowerCase() ||
            String(item.targetId || '').toLowerCase() === fid.toLowerCase()
          ) || {};
          const profile = authorProfileCache[fid];
          const name = profile?.name || connection.name || connection.fullName || connection.username || 'Người dùng';
          const avatar = profile?.avatar || connection.avatarUrl || connection.avatar || '/default-avatar.png';
          return {
            id: fid,
            userId: fid,
            connectionId: String(connection.id || connection.connectionId || fid),
            name: name,
            fullName: name,
            avatar: avatar,
            avatarUrl: avatar,
            online: true,
            createdAt: connection.createdAt,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  },

  getConnectionStatus: async (targetUserId: string) => {
    try {
      const res = await api.get(`/users/connections/status/${targetUserId}`);
      return res.data?.data || res.data?.result || null;
    } catch {
      return null;
    }
  },

  getUserFriends: async (targetUserId: string, page = 0, size = 50) => {
    try {
      // The server route is /friends/user/{id}; the old URL returned 404 and
      // was silently converted to an empty list on another person's profile.
      const res = await api.get(`/users/connections/friends/user/${targetUserId}`, { params: { page, size } });
      const data = res.data?.data?.content || res.data?.data || res.data?.result || [];
      if (!Array.isArray(data)) return [];
      const ownerId = String(targetUserId).toLowerCase();
      const normalized = data.map((connection: any) => {
        const requesterId = String(connection.requesterId || '');
        const targetId = String(connection.targetId || '');
        // A connection has two IDs. For another person's profile, display the
        // ID at the opposite end of that person's friendship.
        const friendId = requesterId.toLowerCase() === ownerId
          ? targetId
          : targetId.toLowerCase() === ownerId
            ? requesterId
            : String(connection.userId || targetId || requesterId || '');
        return { connection, friendId };
      }).filter(({ friendId }) => Boolean(friendId));

      await Promise.all(normalized.map(({ friendId }) => fetchAuthorProfile(friendId).catch(() => null)));

      return normalized.map(({ connection, friendId }) => {
        const profile = authorProfileCache[friendId];
        const name = profile?.name || connection.fullName || connection.name || connection.username || 'Bạn bè';
        const avatar = profile?.avatar || connection.avatarUrl || connection.avatar || '/default-avatar.png';
        return {
          id: friendId,
          userId: friendId,
          connectionId: String(connection.id || ''),
          name,
          fullName: name,
          avatar,
          avatarUrl: avatar,
          online: Boolean(connection.isOnline),
        };
      });
    } catch {
      return [];
    }
  },

  getFollowers: async (page = 0, size = 20) => {
    try {
      const res = await api.get('/users/connections/followers', { params: { page, size } });
      const data = res.data?.data?.content || res.data?.data || [];
      if (Array.isArray(data)) {
        const followerIds = Array.from(
          new Set(data.map((c: any) => (c.requesterId ? String(c.requesterId) : null)).filter(Boolean))
        ) as string[];

        await Promise.all(followerIds.map((id) => fetchAuthorProfile(id)));

        return data.map((c: any) => {
          const fid = String(c.requesterId || c.userId || c.id);
          const profile = authorProfileCache[fid];
          return {
            id: fid,
            connectionId: String(c.id),
            userId: fid,
            name: profile?.name || c.name || 'Người dùng',
            avatar: profile?.avatar || c.avatar || '/default-avatar.png',
            bio: 'Đang theo dõi bạn',
            createdAt: c.createdAt,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
  },

  getFollowing: async (page = 0, size = 20) => {
    try {
      const res = await api.get('/users/connections/following', { params: { page, size } });
      const data = res.data?.data?.content || res.data?.data || [];
      if (Array.isArray(data)) {
        const followingIds = Array.from(
          new Set(data.map((c: any) => (c.targetId ? String(c.targetId) : null)).filter(Boolean))
        ) as string[];

        await Promise.all(followingIds.map((id) => fetchAuthorProfile(id)));

        return data.map((c: any) => {
          const fid = String(c.targetId || c.userId || c.id);
          const profile = authorProfileCache[fid];
          return {
            id: fid,
            connectionId: String(c.id),
            userId: fid,
            name: profile?.name || c.name || 'Người dùng',
            avatar: profile?.avatar || c.avatar || '/default-avatar.png',
            bio: 'Bạn đang theo dõi',
            createdAt: c.createdAt,
          };
        });
      }
      return [];
    } catch {
      return [];
    }
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
    try {
      let data: any[] = [];
      try {
        const res = await api.get('/users/connections/suggestions');
        const raw = res.data?.data?.content || res.data?.data || res.data?.result || [];
        if (Array.isArray(raw)) {
          data = raw;
        }
      } catch (err) {
        console.warn('Backend suggestions endpoint warning:', err);
      }

      // Fallback: If backend suggestions array is empty, query search API to suggest active platform users
      if (!data || data.length === 0) {
        try {
          const searchRes = await api.get('/users/profile/search', { params: { keyword: '', page: 1, size: 20 } });
          const searchRaw = searchRes.data?.data?.content || searchRes.data?.data || searchRes.data?.result || [];
          if (Array.isArray(searchRaw)) {
            data = searchRaw;
          }
        } catch {}
      }

      if (Array.isArray(data) && data.length > 0) {
        let currentUserId = '';
        try {
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          currentUserId = String(u.id || u.userId || u.profileId || '').toLowerCase();
        } catch {}

        return data
          .filter((s: any) => {
            const sid = String(s.userId || s.id || '').toLowerCase();
            return sid && sid !== currentUserId;
          })
          .map((s: any) => {
            const uid = String(s.userId || s.id);
            const nameParts = [s.lastName, s.middleName, s.firstName].filter(Boolean);
            const name = s.fullName || (nameParts.length > 0 ? nameParts.join(' ').trim() : s.username) || 'Thành viên KLTN';
            const avatar = s.avatarUrl || s.avatar || '/default-avatar.png';
            const mutual = s.mutualFriendsCount || 0;
            return {
              id: uid,
              userId: uid,
              name,
              avatar,
              mutualFriendsCount: mutual,
              bio: '',
            };
          });
      }
      return [];
    } catch {
      return [];
    }
  },

  getMutualFriends: async (targetId: string, page = 0, size = 20) => {
    try {
      const res = await api.get(`/users/connections/mutual-friends/${targetId}`, { params: { page, size } });
      const data = res.data?.data?.content || res.data?.data || res.data?.result || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  searchUsers: async (keyword: string, page = 1, size = 20) => {
    if (!keyword.trim()) return [];
    try {
      const res = await api.get('/users/profile/search', { params: { keyword, page, size } });
      const raw = res.data?.data;
      const data = Array.isArray(raw) ? raw : (raw?.content || res.data?.result || []);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
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

  getPrivacySettings: async () => {
    try {
      const res = await api.get('/users/privacy');
      return res.data?.data || res.data?.result || res.data;
    } catch {
      return null;
    }
  },

  updatePrivacySettings: async (settings: {
    defaultPostPrivacy?: string;
    friendRequestPrivacy?: string;
    friendListPrivacy?: string;
    searchPrivacy?: string;
  }) => {
    const res = await api.put('/users/privacy', settings);
    return res.data?.data || res.data?.result || res.data;
  },
};
