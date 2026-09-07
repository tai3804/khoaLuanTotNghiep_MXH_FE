import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Post, Comment, LoginRequest, RegisterRequest } from '../types';

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
          const newToken = res.data?.data?.token || res.data?.result?.token || res.data?.token;
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

export const authService = {
  login: async (data: LoginRequest) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  register: async (data: RegisterRequest) => {
    const res = await api.post('/auth/register', data);
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
  getProfile: async () => {
    const res = await api.get('/users/profile/me');
    return res.data?.data || res.data?.result || res.data;
  },
};

export const userService = {
  getFriends: async () => {
    const res = await api.get('/users/connections/friends');
    return res.data?.data || res.data?.result || res.data || [];
  },
  getUserProfile: async (userId: string) => {
    const res = await api.get(`/users/profile/${userId}`);
    return res.data?.data || res.data?.result || res.data;
  },
};

export const postService = {
  getFeed: async (page = 0, size = 10): Promise<Post[]> => {
    const res = await api.get('/feeds', { params: { page, size } });
    const data = res.data?.data || res.data?.result || res.data;
    if (Array.isArray(data)) return data;
    if (data?.content && Array.isArray(data.content)) return data.content;
    return [];
  },
  createPost: async (content: string, mediaUrls: string[] = []): Promise<Post> => {
    const res = await api.post('/posts', { content, mediaUrls });
    return res.data?.data || res.data?.result || res.data;
  },
  likePost: async (postId: string) => {
    const res = await api.post(`/posts/${postId}/reactions`, { type: 'LIKE' });
    return res.data?.data || res.data?.result || res.data;
  },
  getComments: async (postId: string): Promise<Comment[]> => {
    const res = await api.get(`/posts/${postId}/comments`);
    const data = res.data?.data || res.data?.result || res.data;
    return Array.isArray(data) ? data : [];
  },
  addComment: async (postId: string, content: string): Promise<Comment> => {
    const res = await api.post(`/posts/${postId}/comments`, { content });
    return res.data?.data || res.data?.result || res.data;
  },
};