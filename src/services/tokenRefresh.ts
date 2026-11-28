import axios from 'axios';
import { store } from '../store/store';
import { setAccessToken } from '../store/slices/authSlice';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { getClientType, isNativeApp } from '../utils/platform';
import { getNativeRefreshToken, setNativeRefreshToken } from '../utils/nativeSession';

/**
 * Điểm DUY NHẤT gọi POST /auth/refresh trong toàn bộ giao diện.
 *
 * auth-service xoay vòng refresh token: mỗi refresh token chỉ dùng được một lần, gửi lại token cũ bị coi là dùng lại token
 * bị đánh cắp và thiết bị bị thu hồi (người dùng bị đăng xuất). Vì vậy không được để hai yêu cầu refresh chạy song song:
 *  - trong một tab: mọi nơi cần làm mới (mở trang, hẹn giờ, quay lại tab, interceptor 401, các WebSocket) dùng chung một
 *    promise đang chạy;
 *  - giữa các tab: khóa Web Locks đảm bảo tab sau chỉ gửi yêu cầu khi tab trước đã nhận cookie refresh token mới.
 *
 * Web gửi refresh token bằng cookie HttpOnly; app Android không có cookie nên refresh token nằm trong body và được lưu
 * ở kho bảo mật native (đọc bên trong khóa, nên luôn lấy token mới nhất sau lần xoay vòng trước).
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
const LOCK_NAME = 'kltn-auth-refresh';

let inflight: Promise<string> | null = null;

async function requestNewAccessToken(): Promise<string> {
  let deviceFingerprint = '';
  try {
    deviceFingerprint = (await getDeviceFingerprint()) || localStorage.getItem('deviceFingerprint') || '';
  } catch {
    deviceFingerprint = localStorage.getItem('deviceFingerprint') || '';
  }

  const native = isNativeApp();
  let body: { refreshToken?: string } = {};
  if (native) {
    const refreshToken = await getNativeRefreshToken();
    if (!refreshToken) {
      // Chưa đăng nhập trong app: báo giống phản hồi 401 của server để nơi gọi xử lý như hết phiên.
      throw Object.assign(new Error('No refresh token stored'), { response: { status: 401 } });
    }
    body = { refreshToken };
  }

  const res = await axios.post(BASE_URL + '/auth/refresh', body, {
    // Web: cookie HttpOnly. App: token nằm trong body, không dùng cookie.
    withCredentials: !native,
    headers: {
      'X-Client-Type': getClientType(),
      'X-Device-Fingerprint': deviceFingerprint,
    },
  });

  const data = res.data?.data || res.data?.result || res.data;
  const newAccessToken: string | undefined = data?.accessToken || data?.token;
  if (!newAccessToken) {
    throw new Error('No access token returned');
  }

  // Server xoay vòng refresh token: bắt buộc lưu token mới trước hết, token cũ sẽ không dùng lại được.
  if (native && data?.refreshToken) {
    await setNativeRefreshToken(data.refreshToken);
  }
  store.dispatch(setAccessToken(newAccessToken));
  return newAccessToken;
}

/**
 * Làm mới access token. Gọi đồng thời nhiều lần chỉ gửi một yêu cầu; lỗi được ném ra nguyên vẹn (kèm error.response)
 * để nơi gọi phân biệt refresh token bị từ chối (401/403) với lỗi mạng.
 */
export function refreshAccessToken(): Promise<string> {
  if (inflight) return inflight;

  const run = typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request(LOCK_NAME, () => requestNewAccessToken())
    : requestNewAccessToken();

  inflight = run.finally(() => {
    inflight = null;
  });
  return inflight;
}

/** Tên cũ của refreshAccessToken, giữ lại cho mã còn gọi theo tên này. */
export const requestTokenRefresh = refreshAccessToken;
