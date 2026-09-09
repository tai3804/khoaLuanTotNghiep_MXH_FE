import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
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

      const refreshToken = localStorage.getItem('refreshToken');
      const deviceFingerprint = localStorage.getItem('deviceFingerprint') || '';

      if (refreshToken) {
        try {
          const res = await axios.post(
            BASE_URL + '/auth/refresh',
            { refreshToken },
            {
              headers: {
                'X-Client-Type': 'WEB',
                'X-Device-Fingerprint': deviceFingerprint,
              },
            }
          );

          const data = res.data?.data || res.data?.result || res.data;
          const newAccessToken = data?.accessToken || data?.token;
          const newRefreshToken = data?.refreshToken;

          if (newAccessToken) {
            localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
            originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;

            processQueue(null, newAccessToken);
            return api(originalRequest);
          } else {
            throw new Error('No access token returned');
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.dispatchEvent(new Event('auth_session_expired'));
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth_session_expired'));
      }
    }
    return Promise.reject(error);
  }
);
