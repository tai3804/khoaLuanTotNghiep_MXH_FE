import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { store } from '../store/store';
import { clearAuth } from '../store/slices/authSlice';
import { isNativeApp } from '../utils/platform';
import { clearNativeRefreshToken } from '../utils/nativeSession';
import { refreshAccessToken } from './tokenRefresh';

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

    // Máy chủ đang bảo trì (quản trị viên vừa bật): báo cho giao diện chuyển sang màn hình bảo trì ngay
    if (error.response?.status === 503 && error.response?.data?.maintenance) {
      window.dispatchEvent(new CustomEvent('system_maintenance'));
    }

    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        // Nhiều request 401 cùng lúc chỉ tạo một lần làm mới (tokenRefresh dùng chung một promise)
        const newAccessToken = await refreshAccessToken();
        setAuthHeader(originalRequest, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr: any) {
        console.warn('[axiosClient] Failed to refresh access token:', refreshErr);
        // Chỉ kết thúc phiên khi refresh token bị từ chối rõ ràng (401/403), và chỉ một lần dù nhiều request cùng lỗi
        const rejected = refreshErr?.response && (refreshErr.response.status === 401 || refreshErr.response.status === 403);
        if (rejected && store.getState().auth.accessToken) {
          store.dispatch(clearAuth());
          localStorage.removeItem('user');
          try { localStorage.removeItem('refreshToken'); } catch {}
          void clearNativeRefreshToken();
          window.dispatchEvent(new Event('auth_session_expired'));
        }
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);
