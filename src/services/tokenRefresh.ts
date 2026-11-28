import axios from 'axios';
import { store } from '../store/store';
import { setAccessToken } from '../store/slices/authSlice';
import { getDeviceFingerprint } from '../utils/fingerprint';

/**
 * Điểm DUY NHẤT gọi POST /auth/refresh trong toàn bộ giao diện.
 *
 * auth-service xoay vòng refresh token: mỗi refresh token chỉ dùng được một lần, gửi lại token cũ bị coi là dùng lại token
 * bị đánh cắp và thiết bị bị thu hồi (người dùng bị đăng xuất). Vì vậy không được để hai yêu cầu refresh chạy song song:
 *  - trong một tab: mọi nơi cần làm mới (mở trang, hẹn giờ, quay lại tab, interceptor 401, các WebSocket) dùng chung một
 *    promise đang chạy;
 *  - giữa các tab: khóa Web Locks đảm bảo tab sau chỉ gửi yêu cầu khi tab trước đã nhận cookie refresh token mới.
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

  const res = await axios.post(
    BASE_URL + '/auth/refresh',
    {},
    {
      withCredentials: true,
      headers: {
        'X-Client-Type': 'WEB',
        'X-Device-Fingerprint': deviceFingerprint,
      },
    }
  );
  const data = res.data?.data || res.data?.result || res.data;
  const newAccessToken: string | undefined = data?.accessToken || data?.token;
  if (!newAccessToken) {
    throw new Error('No access token returned');
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
