import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store/store';
import { setAccessToken, clearAuth } from '../store/slices/authSlice';
import { isNativeApp } from '../utils/platform';
import { clearNativeRefreshToken } from '../utils/nativeSession';
import { requestTokenRefresh } from './tokenRefresh';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/** Mã lỗi (trường code của phản hồi) khi tài khoản đang bị khóa; khớp ACCOUNT_LOCKED_CODE ở post-service và user-service. */
const ACCOUNT_LOCKED_CODE = 40320;

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  // Web dùng cookie refresh token; app Android xác thực bằng header Bearer + refresh token trong body.
  withCredentials: !isNativeApp(),
  timeout: 10000,
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

const setAuthHeader = (config: any, token: string) => {
  if (!config.headers) {
    config.headers = {};
  }
  if (typeof config.headers.set === 'function') {
    config.headers.set('Authorization', 'Bearer ' + token);
  } else {
    config.headers['Authorization'] = 'Bearer ' + token;
  }
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      setAuthHeader(config, token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Máy chủ từ chối vì tài khoản đang bị khóa (điểm uy tín quá thấp): báo cho AccountLockedScreen hiện màn hình khóa
    if (error.response?.status === 403 && error.response?.data?.code === ACCOUNT_LOCKED_CODE) {
      window.dispatchEvent(new CustomEvent('account_locked'));
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        originalRequest._retry = true;
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            setAuthHeader(originalRequest, token);
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      console.log('[axiosClient] 401 Unauthorized encountered. Automatically refreshing access token...');

      try {
        // Phải nằm trong try: nếu bước lấy dấu vân tay/đọc refresh token ném lỗi mà nằm ngoài, isRefreshing không bao giờ
        // được tắt (finally không chạy) và mọi request 401 về sau sẽ chờ vô hạn trong failedQueue.
        const newAccessToken = await requestTokenRefresh();

        console.log('[axiosClient] Successfully refreshed access token! Retrying original request:', originalRequest.url);
        store.dispatch(setAccessToken(newAccessToken));

        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        setAuthHeader(originalRequest, newAccessToken);

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr: any) {
        console.warn('[axiosClient] Failed to refresh access token:', refreshErr);
        processQueue(refreshErr, null);
        // Only trigger session expiration when refresh token is explicitly rejected (401 or 403)
        if (refreshErr?.response && (refreshErr.response.status === 401 || refreshErr.response.status === 403)) {
          store.dispatch(clearAuth());
          localStorage.removeItem('user');
          try { localStorage.removeItem('refreshToken'); } catch {}
          void clearNativeRefreshToken();
          window.dispatchEvent(new Event('auth_session_expired'));
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
