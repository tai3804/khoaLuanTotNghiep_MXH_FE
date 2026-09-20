import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store/store';
import { setAccessToken, clearAuth } from '../store/slices/authSlice';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken || localStorage.getItem('token');
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
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const deviceFingerprint = localStorage.getItem('deviceFingerprint') || '';

      try {
        const res = await axios.post(
          BASE_URL + '/auth/refresh',
          {}, // rely on HttpOnly cookie
          {
            withCredentials: true,
            headers: {
              'X-Client-Type': 'WEB',
              'X-Device-Fingerprint': deviceFingerprint,
            },
          }
        );

        const data = res.data?.data || res.data?.result || res.data;
        const newAccessToken = data?.accessToken || data?.token;

        if (newAccessToken) {
          store.dispatch(setAccessToken(newAccessToken));
          localStorage.setItem('token', newAccessToken);
          
          api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('No access token returned');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        store.dispatch(clearAuth());
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth_session_expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
