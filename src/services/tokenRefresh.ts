import axios from 'axios';
import { getDeviceFingerprint } from '../utils/fingerprint';
import { getClientType, isNativeApp } from '../utils/platform';
import { getNativeRefreshToken, setNativeRefreshToken } from '../utils/nativeSession';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

let inFlight: Promise<string> | null = null;

const doRefresh = async (): Promise<string> => {
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
  const accessToken = data?.accessToken || data?.token;
  if (!accessToken) {
    throw new Error('No access token returned');
  }

  // Server xoay vòng refresh token: bắt buộc lưu token mới, token cũ sẽ không dùng lại được.
  if (native && data?.refreshToken) {
    await setNativeRefreshToken(data.refreshToken);
  }
  return accessToken;
};

/**
 * Đổi refresh token lấy access token mới; ném lỗi (kèm response.status) nếu server từ chối.
 * Các lần gọi đồng thời dùng chung một request: refresh token bị xoay vòng nên gửi hai lần
 * cùng một token cũ sẽ làm lần sau bị từ chối.
 */
export const requestTokenRefresh = (): Promise<string> => {
  if (!inFlight) {
    inFlight = doRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
};
