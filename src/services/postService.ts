import { api } from './axiosClient';
import { Post, Comment } from '../types';
import { authorProfileCache, fetchAuthorProfile } from './userService';
import { groupMetaCache, fetchGroupMeta } from './groupService';

export const normalizePost = (p: any): Post => {
  const rawMediaUrls: string[] = [];
  const rawMediaList: { id?: string; fileUrl: string; fileKey?: string; mediaType?: string }[] = [];

  if (Array.isArray(p.mediaList) && p.mediaList.length > 0) {
    p.mediaList.forEach((m: any) => {
      const url = typeof m === 'string' ? m : m.fileUrl || m.mediaUrl || m.url || '';
      const mediaType = typeof m === 'string' ? undefined : (m.mediaType || (m.type ? String(m.type).toUpperCase() : undefined));
      if (url) {
        rawMediaUrls.push(url);
        rawMediaList.push({
          id: m.id ? String(m.id) : undefined,
          fileUrl: url,
          fileKey: m.fileKey,
          mediaType: mediaType || (url.match(/\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i) ? 'VIDEO' : 'IMAGE'),
        });
      }
    });
  } else if (Array.isArray(p.mediaUrls) && p.mediaUrls.length > 0) {
    p.mediaUrls.forEach((m: any) => {
      const url = typeof m === 'string' ? m : m.fileUrl || m.mediaUrl || m.url || '';
      const mediaType = typeof m === 'string' ? undefined : m.mediaType;
      if (url) {
        rawMediaUrls.push(url);
        rawMediaList.push({
          fileUrl: url,
          mediaType: mediaType || (url.match(/\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i) ? 'VIDEO' : 'IMAGE'),
        });
      }
    });
  }

  // Deduplicate media entries by fileUrl to prevent duplicated images/videos
  const seenUrls = new Set<string>();
  const mediaUrls: string[] = [];
  const mediaList: { id?: string; fileUrl: string; fileKey?: string; mediaType?: string }[] = [];

  for (let i = 0; i < rawMediaUrls.length; i++) {
    const u = rawMediaUrls[i];
    if (u && !seenUrls.has(u)) {
      seenUrls.add(u);
      mediaUrls.push(u);
      if (rawMediaList[i]) {
        mediaList.push(rawMediaList[i]);
      }
    }
  }

  const rawAuthorId =
    p.authorId ||
    p.userId ||
    p.postDetail?.authorId ||
    p.author?.id ||
    p.author?.userId ||
    p.creatorId ||
    p.createdBy ||
    p.user?.id ||
    '';
  const authorId = rawAuthorId ? String(rawAuthorId) : '';
  const cached = authorId ? authorProfileCache[authorId] : undefined;

  let currentUserName = '';
  let currentUserAvatar = '';
  try {
    const uStr = localStorage.getItem('user');
    if (uStr && authorId && authorId !== 'me') {
      const u = JSON.parse(uStr);
      if (u.id === authorId || u.userId === authorId) {
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

  const groupId = p.groupId ? String(p.groupId) : undefined;
  const cachedGroup = groupId ? groupMetaCache[groupId] : undefined;
  const groupName = p.groupName || cachedGroup?.name || undefined;
  const groupAvatar = p.groupAvatar || cachedGroup?.coverUrl || undefined;
  const groupCover = p.groupCover || cachedGroup?.coverUrl || undefined;
  const groupPrivacy = p.groupPrivacy || cachedGroup?.privacy || undefined;

  return {
    id: p.id ? String(p.id) : 'post-' + Date.now(),
    userId: authorId,
    authorName: authorName || 'Thành viên KLTN',
    authorAvatar,
    content: p.content || '',
    mediaUrls,
    mediaList,
    createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong',
    likesCount: Number(p.likeCount ?? p.likesCount ?? 0),
    commentsCount: Number(p.commentCount ?? p.commentsCount ?? 0),
    sharesCount: Number(p.shareCount ?? p.sharesCount ?? 0),
    isLiked: Boolean(p.isLiked),
    isPinned: Boolean(p.isPinned),
    isArchived: Boolean(p.isArchived),
    status: p.status || 'PUBLISHED',
    privacy: p.privacy || 'PUBLIC',
    groupId,
    groupName,
    groupAvatar,
    groupCover,
    groupPrivacy,
    originalPostId: p.originalPostId ? String(p.originalPostId) : undefined,
    comments: p.comments || [],
    taggedUserIds: Array.isArray(p.taggedUserIds) ? p.taggedUserIds.map(String) : [],
    hashtags: Array.isArray(p.hashtags) ? p.hashtags.map(String) : [],
  };
};

export interface PagedPostsResponse {
  posts: Post[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  nextCursor?: string | null;
}

export const postDetailCache: Record<string, Post> = {};

export const postService = {
  getPostById: async (postId: string): Promise<Post | null> => {
    if (!postId) return null;
    if (postDetailCache[postId]) return postDetailCache[postId];

    try {
      const res = await api.get(`/posts/${postId}`);
      const data = res.data?.data || res.data?.result || res.data;
      if (data) {
        if (data.authorId) {
          await fetchAuthorProfile(String(data.authorId)).catch(() => {});
        }
        const normalized = normalizePost(data);
        postDetailCache[postId] = normalized;
        return normalized;
      }
      return null;
    } catch {
      return null;
    }
  },

  getFeedPaged: async (page = 1, size = 10, cursor?: string | null): Promise<PagedPostsResponse> => {
    try {
      const params: Record<string, any> = {
        page,
        size,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
      };
      if (cursor) {
        params.cursor = cursor;
      }

      const res = await api.get('/posts', { params });
      const rawData = res.data;
      const rawPosts = Array.isArray(rawData?.data)
        ? rawData.data
        : (rawData?.data?.content || rawData?.result || rawData?.content || []);

      if (Array.isArray(rawPosts) && rawPosts.length > 0) {
        const authorIds = Array.from(
          new Set(rawPosts.map((p: any) => (p.authorId ? String(p.authorId) : null)).filter(Boolean))
        ) as string[];
        if (authorIds.length > 0) {
          Promise.all(authorIds.map((id) => fetchAuthorProfile(id))).catch(() => {});
        }

        const groupIds = Array.from(
          new Set(rawPosts.map((p: any) => (p.groupId ? String(p.groupId) : null)).filter(Boolean))
        ) as string[];
        if (groupIds.length > 0) {
          Promise.all(groupIds.map((gid) => fetchGroupMeta(gid))).catch(() => {});
        }
      }

      // Access control is enforced by post-service; do not wait for an extra
      // friends request before rendering the feed.
      const posts = Array.isArray(rawPosts) ? rawPosts.map(normalizePost) : [];

      let nextCursor: string | null = null;
      if (Array.isArray(rawPosts) && rawPosts.length > 0) {
        const lastRaw = rawPosts[rawPosts.length - 1];
        if (lastRaw?.createdAt) {
          nextCursor = lastRaw.createdAt;
        }
      }

      const isLast = rawData?.last !== undefined ? Boolean(rawData.last) : (posts.length < size);

      return {
        posts,
        page: rawData?.page ?? page,
        size: rawData?.size ?? size,
        totalElements: rawData?.totalElements ?? posts.length,
        totalPages: rawData?.totalPages ?? 1,
        last: isLast,
        nextCursor,
      };
    } catch (err: any) {
      console.error('getFeedPaged error:', err);
      return {
        posts: [],
        page,
        size,
        totalElements: 0,
        totalPages: 0,
        last: true,
        nextCursor: null,
      };
    }
  },

  getWatchFeed: async (page = 1, size = 10, cursor?: string | null): Promise<PagedPostsResponse> => {
    try {
      const params: Record<string, any> = {
        page,
        size,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
        'filters[hasVideo]': 'true'
      };
      if (cursor) {
        params.cursor = cursor;
      }

      const res = await api.get('/posts', { params });
      const rawData = res.data;
      const rawPosts = Array.isArray(rawData?.data)
        ? rawData.data
        : (rawData?.data?.content || rawData?.result || rawData?.content || []);

      if (Array.isArray(rawPosts) && rawPosts.length > 0) {
        const authorIds = Array.from(
          new Set(rawPosts.map((p: any) => (p.authorId ? String(p.authorId) : null)).filter(Boolean))
        ) as string[];
        if (authorIds.length > 0) {
          Promise.all(authorIds.map((id) => fetchAuthorProfile(id))).catch(() => {});
        }
      }

      const posts = Array.isArray(rawPosts) ? rawPosts.map(normalizePost) : [];

      let nextCursor: string | null = null;
      if (Array.isArray(rawPosts) && rawPosts.length > 0) {
        const lastRaw = rawPosts[rawPosts.length - 1];
        if (lastRaw?.createdAt) {
          nextCursor = lastRaw.createdAt;
        }
      }

      const isLast = rawData?.last !== undefined ? Boolean(rawData.last) : (posts.length < size);

      return {
        posts,
        page: rawData?.page ?? page,
        size: rawData?.size ?? size,
        totalElements: rawData?.totalElements ?? posts.length,
        totalPages: rawData?.totalPages ?? 1,
        last: isLast,
        nextCursor,
      };
    } catch (err: any) {
      console.error('getWatchFeed error:', err);
      return {
        posts: [],
        page,
        size,
        totalElements: 0,
        totalPages: 0,
        last: true,
        nextCursor: null,
      };
    }
  },

  getFeed: async (page = 1, size = 10): Promise<Post[]> => {
    const res = await postService.getFeedPaged(page, size);
    return res.posts;
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

  createPost: async (
    content: string,
    privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' = 'PUBLIC',
    files: File[] = [],
    mediaUrls?: string[],
    groupId?: string,
    taggedUserIds?: string[]
  ): Promise<Post> => {
    const formData = new FormData();
    formData.append('content', content);
    formData.append('privacy', privacy);
    if (groupId) {
      formData.append('groupId', groupId);
    }
    if (taggedUserIds && taggedUserIds.length > 0) {
      taggedUserIds.forEach((id) => {
        formData.append('taggedUserIds', id);
      });
    }

    files.forEach((file) => {
      formData.append('files', file);
    });
    if (mediaUrls && mediaUrls.length > 0) {
      mediaUrls.forEach((url) => {
        formData.append('mediaUrls', url);
      });
    }

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

  updatePost: async (
    postId: string,
    data: {
      content?: string;
      privacy?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' | string;
      allowedUserIds?: string[];
      isPinned?: boolean;
      isArchived?: boolean;
      mediaUrls?: string[];
    }
  ): Promise<Post> => {
    const res = await api.put(`/posts/${postId}`, data);
    const postData = res.data?.data || res.data;
    const normalized = normalizePost(postData);
    window.dispatchEvent(new CustomEvent('post_updated', { detail: normalized }));
    return normalized;
  },

  pinPost: async (postId: string, isPinned = true): Promise<Post> => {
    const res = await api.patch(`/posts/${postId}/pin`, null, { params: { isPinned } });
    const postData = res.data?.data || res.data;
    const normalized = normalizePost(postData);
    window.dispatchEvent(new CustomEvent('post_updated', { detail: normalized }));
    return normalized;
  },

  archivePost: async (postId: string, isArchived = true): Promise<Post> => {
    const res = await api.patch(`/posts/${postId}/archive`, null, { params: { isArchived } });
    const postData = res.data?.data || res.data;
    const normalized = normalizePost(postData);
    window.dispatchEvent(new CustomEvent('post_updated', { detail: normalized }));
    return normalized;
  },

  updatePostPrivacy: async (postId: string, privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' | string): Promise<Post> => {
    const res = await api.patch(`/posts/${postId}/privacy`, null, { params: { privacy } });
    const postData = res.data?.data || res.data;
    const normalized = normalizePost(postData);
    window.dispatchEvent(new CustomEvent('post_updated', { detail: normalized }));
    return normalized;
  },

  getGroupPosts: async (groupId: string, page = 1, size = 30): Promise<Post[]> => {
    if (!groupId) return [];
    try {
      const res = await api.get(`/posts/group/${groupId}`, { params: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' } });
      const raw = res.data?.data?.content || (Array.isArray(res.data?.data) ? res.data?.data : []) || res.data?.result || [];
      if (Array.isArray(raw) && raw.length > 0) {
        const authorIds = Array.from(
          new Set(raw.map((p: any) => (p.authorId ? String(p.authorId) : null)).filter(Boolean))
        ) as string[];
        if (authorIds.length > 0) {
          Promise.all(authorIds.map((id) => fetchAuthorProfile(id))).catch(() => {});
        }
        return raw.map(normalizePost);
      }
      return [];
    } catch (e) {
      console.warn('Failed to fetch group posts from backend:', e);
      return [];
    }
  },

  getPendingGroupPosts: async (groupId: string): Promise<Post[]> => {
    if (!groupId) return [];
    try {
      const res = await api.get(`/posts/group/${groupId}/pending`);
      const raw = res.data?.data || res.data?.result || res.data || [];
      return Array.isArray(raw) ? raw.map(normalizePost) : [];
    } catch (e) {
      console.warn('Failed to fetch pending group posts:', e);
      return [];
    }
  },

  reviewGroupPost: async (postId: string, approved: boolean): Promise<Post> => {
    const res = await api.patch(`/posts/${postId}/group-review`, null, { params: { approved } });
    return normalizePost(res.data?.data || res.data);
  },

  updatePostDate: async (postId: string, createdAt: string): Promise<Post> => {
    const res = await api.patch(`/posts/${postId}/date`, { createdAt });
    const normalized = normalizePost(res.data?.data || res.data);
    window.dispatchEvent(new CustomEvent('post_updated', { detail: normalized }));
    return normalized;
  },

  updateAllMyPostsPrivacy: async (privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'): Promise<number> => {
    const res = await api.patch('/posts/privacy/batch', null, { params: { privacy } });
    return Number(res.data?.data ?? res.data ?? 0);
  },

  savePost: async (postId: string, collectionName?: string) => {
    try {
      const res = await api.post('/posts/saved', { postId, collectionName });
      try {
        const saved = JSON.parse(localStorage.getItem('kltn_saved_post_ids') || '[]');
        if (!saved.includes(String(postId))) {
          localStorage.setItem('kltn_saved_post_ids', JSON.stringify([...saved, String(postId)]));
        }
      } catch {}
      window.dispatchEvent(new CustomEvent('saved_posts_changed', { detail: { postId, isSaved: true } }));
      return res.data;
    } catch (err) {
      try {
        const saved = JSON.parse(localStorage.getItem('kltn_saved_post_ids') || '[]');
        if (!saved.includes(String(postId))) {
          localStorage.setItem('kltn_saved_post_ids', JSON.stringify([...saved, String(postId)]));
        }
      } catch {}
      window.dispatchEvent(new CustomEvent('saved_posts_changed', { detail: { postId, isSaved: true } }));
      return { success: true };
    }
  },

  unsavePost: async (postId: string) => {
    try {
      const res = await api.delete(`/posts/saved/${postId}`);
      try {
        const saved = JSON.parse(localStorage.getItem('kltn_saved_post_ids') || '[]');
        localStorage.setItem('kltn_saved_post_ids', JSON.stringify(saved.filter((id: string) => id !== String(postId))));
      } catch {}
      window.dispatchEvent(new CustomEvent('saved_posts_changed', { detail: { postId, isSaved: false } }));
      return res.data;
    } catch (err) {
      try {
        const saved = JSON.parse(localStorage.getItem('kltn_saved_post_ids') || '[]');
        localStorage.setItem('kltn_saved_post_ids', JSON.stringify(saved.filter((id: string) => id !== String(postId))));
      } catch {}
      window.dispatchEvent(new CustomEvent('saved_posts_changed', { detail: { postId, isSaved: false } }));
      return { success: true };
    }
  },

  isPostSaved: async (postId: string): Promise<boolean> => {
    try {
      const res = await api.get(`/posts/saved/${postId}/status`);
      const status = Boolean(res.data?.data ?? res.data?.result ?? res.data);
      try {
        const saved = JSON.parse(localStorage.getItem('kltn_saved_post_ids') || '[]');
        if (status && !saved.includes(String(postId))) {
          localStorage.setItem('kltn_saved_post_ids', JSON.stringify([...saved, String(postId)]));
        } else if (!status && saved.includes(String(postId))) {
          localStorage.setItem('kltn_saved_post_ids', JSON.stringify(saved.filter((id: string) => id !== String(postId))));
        }
      } catch {}
      return status;
    } catch {
      try {
        const saved = JSON.parse(localStorage.getItem('kltn_saved_post_ids') || '[]');
        return saved.includes(String(postId));
      } catch {
        return false;
      }
    }
  },

  getSavedPosts: async (page = 1, size = 20): Promise<Post[]> => {
    try {
      const res = await api.get('/posts/saved', { params: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' } });
      const raw = res.data?.data?.content || (Array.isArray(res.data?.data) ? res.data?.data : []) || res.data?.result || [];
      if (Array.isArray(raw) && raw.length > 0) {
        const authorIds = Array.from(
          new Set(raw.map((p: any) => (p.authorId ? String(p.authorId) : null)).filter(Boolean))
        ) as string[];
        if (authorIds.length > 0) {
          await Promise.all(authorIds.map((id) => fetchAuthorProfile(id))).catch(() => {});
        }
        return raw.map((p: any) => {
          const norm = normalizePost(p);
          norm.isSaved = true;
          return norm;
        });
      }
      return [];
    } catch (e) {
      console.warn('Failed to fetch saved posts from server, checking local cache:', e);
      try {
        const savedIds: string[] = JSON.parse(localStorage.getItem('kltn_saved_post_ids') || '[]');
        if (savedIds.length > 0) {
          const slice = savedIds.slice((page - 1) * size, page * size);
          const posts = (
            await Promise.all(
              slice.map(async (id) => {
                try {
                  const p = await postService.getPostById(id);
                  return p ? ({ ...p, isSaved: true } as Post) : null;
                } catch {
                  return null;
                }
              })
            )
          ).filter((p): p is Post => p !== null);
          return posts;
        }
      } catch {}
      return [];
    }
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
      const res = await api.get(`/posts/${postId}/comments`, { params: { size: 100 } });
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
            if (currentUser && currentUser.id && authorId && authorId !== 'me' && currentUser.id === authorId) {
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
            taggedUserIds: Array.isArray(c.taggedUserIds) ? c.taggedUserIds.map(String) : [],
          };
        });

        // Automatically fetch replies for each top-level comment
        const topLevelComments = parsedComments.filter(c => !c.parentCommentId);
        const replyPromises = topLevelComments.map(async (parent) => {
          try {
            const repliesRes = await api.get(`/posts/${postId}/comments`, {
              params: { parentCommentId: parent.id, size: 100 },
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
                  if (currentUser && currentUser.id && rAuthorId && rAuthorId !== 'me' && currentUser.id === rAuthorId) {
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
                  taggedUserIds: Array.isArray(rc.taggedUserIds) ? rc.taggedUserIds.map(String) : [],
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

  addComment: async (
    postId: string,
    content: string,
    file?: File,
    parentCommentId?: string,
    taggedUserIds?: string[]
  ): Promise<Comment> => {
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
    if (taggedUserIds && taggedUserIds.length > 0) {
      taggedUserIds.forEach((id) => {
        formData.append('taggedUserIds', id);
      });
    }
    const res = await api.post(`/posts/${postId}/comments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const c = res.data?.data || res.data;
    const authorId = String(c.authorId || c.userId || currentUser?.id || '');
    const cached = authorId ? authorProfileCache[authorId] : undefined;

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
      taggedUserIds: Array.isArray(c.taggedUserIds) ? c.taggedUserIds.map(String) : (taggedUserIds || []),
    };
  },

  deleteComment: async (postId: string, commentId: string) => {
    const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
    return res.data;
  },

  updateComment: async (postId: string, commentId: string, content: string): Promise<Comment> => {
    const res = await api.put(`/posts/${postId}/comments/${commentId}`, { content });
    const c = res.data?.data || res.data;
    return {
      id: String(c.id), postId: String(c.postId || postId), userId: String(c.authorId || c.userId || ''),
      authorName: c.authorName || '', authorAvatar: c.authorAvatar || '', content: c.content || content,
      createdAt: c.createdAt ? new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
      likesCount: Number(c.likeCount || 0), parentCommentId: c.parentCommentId ? String(c.parentCommentId) : undefined,
    };
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

  getPostsByHashtag: async (hashtag: string, page = 0, size = 20): Promise<PagedPostsResponse> => {
    try {
      const cleanTag = hashtag.replace(/^#/, '').trim().toLowerCase();
      const res = await api.get(`/posts/hashtag/${encodeURIComponent(cleanTag)}`, {
        params: { page, size, sortBy: 'createdAt', sortDirection: 'DESC' },
      });
      const rawData = res.data;
      const rawPosts = Array.isArray(rawData?.data?.content)
        ? rawData.data.content
        : (Array.isArray(rawData?.data) ? rawData.data : (rawData?.result || []));

      if (Array.isArray(rawPosts) && rawPosts.length > 0) {
        const authorIds = Array.from(new Set(rawPosts.map((p: any) => (p.authorId ? String(p.authorId) : null)).filter(Boolean))) as string[];
        Promise.all(authorIds.map((id) => fetchAuthorProfile(id))).catch(() => {});
      }

      const posts = Array.isArray(rawPosts) ? rawPosts.map(normalizePost) : [];
      return {
        posts,
        page: rawData?.data?.page ?? page,
        size: rawData?.data?.size ?? size,
        totalElements: rawData?.data?.totalElements ?? posts.length,
        totalPages: rawData?.data?.totalPages ?? 1,
        last: rawData?.data?.last ?? (posts.length < size),
      };
    } catch (err) {
      console.error('getPostsByHashtag error:', err);
      return {
        posts: [],
        page,
        size,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };
    }
  },

  /**
   * Chia sẻ bài viết lên Bảng tin / Trang cá nhân (Share Post Request)
   */
  sharePost: async (
    postId: string,
    caption?: string,
    privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' = 'PUBLIC'
  ): Promise<Post> => {
    const res = await api.post(`/posts/${postId}/share`, {
      originalPostId: postId,
      caption: caption || '',
      privacy: privacy || 'PUBLIC',
    });
    const data = res.data?.data || res.data?.result || res.data;
    return normalizePost(data);
  },
};
