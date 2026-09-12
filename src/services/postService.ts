import { api } from './axiosClient';
import { Post, Comment } from '../types';
import { authorProfileCache, fetchAuthorProfile } from './userService';

export const normalizePost = (p: any): Post => {
  const mediaUrls = Array.isArray(p.mediaList)
    ? p.mediaList.map((m: any) => (typeof m === 'string' ? m : m.fileUrl || m.mediaUrl || m.url || '')).filter(Boolean)
    : Array.isArray(p.mediaUrls)
    ? p.mediaUrls.map((m: any) => (typeof m === 'string' ? m : m.fileUrl || m.mediaUrl || m.url || '')).filter(Boolean)
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

  removeReaction: async (postId: string, type: 'LIKE' | 'LOVE' | 'HAHA' | 'WOW' | 'SAD' | 'ANGRY' = 'LIKE') => {
    const res = await api.post(`/posts/${postId}/reactions`, { type });
    return res.data;
  },

  getComments: async (postId: string): Promise<Comment[]> => {
    try {
      const res = await api.get(`/posts/${postId}/comments`);
      const data = res.data?.data?.content || res.data?.data || res.data?.result || [];
      if (Array.isArray(data)) {
        const authorIds = Array.from(new Set(data.map((c: any) => (c.authorId ? String(c.authorId) : null)).filter(Boolean))) as string[];
        await Promise.all(authorIds.map((id) => fetchAuthorProfile(id)));

        let currentUser: any = null;
        try {
          const uStr = localStorage.getItem('user');
          if (uStr) currentUser = JSON.parse(uStr);
        } catch {}

        const parsedComments: Comment[] = data.map((c: any) => {
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
            parentCommentId: c.parentCommentId ? String(c.parentCommentId) : undefined,
          };
        });

        // Automatically fetch replies for each top-level comment
        const topLevelComments = parsedComments.filter(c => !c.parentCommentId);
        const replyPromises = topLevelComments.map(async (parent) => {
          try {
            const repliesRes = await api.get(`/posts/${postId}/comments`, {
              params: { parentCommentId: parent.id },
            });
            const repliesData = repliesRes.data?.data?.content || repliesRes.data?.data || repliesRes.data?.result || [];
            if (Array.isArray(repliesData) && repliesData.length > 0) {
              const rAuthorIds = Array.from(new Set(repliesData.map((rc: any) => (rc.authorId ? String(rc.authorId) : null)).filter(Boolean))) as string[];
              await Promise.all(rAuthorIds.map((id) => fetchAuthorProfile(id)));

              return repliesData.map((rc: any) => {
                const rAuthorId = String(rc.authorId || rc.userId || '');
                const rCached = authorProfileCache[rAuthorId];
                let rName = rc.authorName;
                let rAvatar = rc.authorAvatar || rc.author?.avatarUrl || '';

                if (!rName || rName === 'Người dùng' || rName === 'Thành viên' || rName === 'Thành viên KLTN') {
                  if (currentUser && (currentUser.id === rAuthorId || rAuthorId === 'me')) {
                    rName = currentUser.fullName || currentUser.username;
                    if (!rAvatar) rAvatar = currentUser.avatar;
                  } else if (rCached?.name) {
                    rName = rCached.name;
                    if (!rAvatar) rAvatar = rCached.avatar;
                  } else if (rc.author) {
                    rName = [rc.author.lastName, rc.author.middleName, rc.author.firstName].filter(Boolean).join(' ').trim();
                  }
                }

                return {
                  id: String(rc.id),
                  postId: String(rc.postId || postId),
                  userId: rAuthorId || 'user',
                  authorName: rName || 'Thành viên KLTN',
                  authorAvatar: rAvatar || rCached?.avatar || '',
                  content: rc.content || '',
                  createdAt: rc.createdAt ? new Date(rc.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
                  likesCount: Number(rc.likeCount || 0),
                  parentCommentId: String(parent.id),
                };
              });
            }
          } catch {}
          return [];
        });

        const repliesArrays = await Promise.all(replyPromises);
        const allReplies = repliesArrays.flat();

        const combinedMap = new Map<string, Comment>();
        parsedComments.forEach((c) => combinedMap.set(c.id, c));
        allReplies.forEach((c) => combinedMap.set(c.id, c));

        return Array.from(combinedMap.values());
      }
      return [];
    } catch {
      return [];
    }
  },

  addComment: async (postId: string, content: string, file?: File, parentCommentId?: string): Promise<Comment> => {
    let currentUser: any = null;
    try {
      const uStr = localStorage.getItem('user');
      if (uStr) currentUser = JSON.parse(uStr);
    } catch {}

    const formData = new FormData();
    formData.append('content', content);
    if (parentCommentId) {
      formData.append('parentCommentId', parentCommentId);
    }
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
      parentCommentId: c?.parentCommentId ? String(c.parentCommentId) : parentCommentId,
    };
  },

  deleteComment: async (postId: string, commentId: string) => {
    const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return res.data;
  },

  getReactions: async (postId: string) => {
    try {
      const res = await api.get(`/posts/${postId}/reactions`);
      const data = res.data?.data?.content || res.data?.data || res.data?.result || [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  searchPosts: async (query: string, page = 1, size = 20): Promise<Post[]> => {
    if (!query.trim()) return [];
    try {
      const res = await api.get('/posts/search', { params: { query, page, size } });
      const raw = Array.isArray(res.data?.data)
        ? res.data.data
        : (res.data?.data?.content || res.data?.result || res.data || []);
      if (Array.isArray(raw) && raw.length > 0) {
        const authorIds = Array.from(new Set(raw.map((p: any) => (p.authorId ? String(p.authorId) : null)).filter(Boolean))) as string[];
        Promise.all(authorIds.map((id) => fetchAuthorProfile(id))).catch(() => {});
        return raw.map(normalizePost);
      }
      return [];
    } catch {
      return [];
    }
  },
};
