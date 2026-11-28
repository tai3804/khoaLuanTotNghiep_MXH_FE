import { api } from './axiosClient';
import { getDeviceFingerprint, getDeviceName } from '../utils/fingerprint';
import { refreshAccessToken } from './tokenRefresh';
import { getClientType, isNativeApp } from '../utils/platform';
import { clearNativeRefreshToken, setNativeRefreshToken } from '../utils/nativeSession';

/** Trong app Android, lưu refresh token server trả trong body (không có cookie) vào kho bảo mật native. */
const persistNativeRefreshToken = async (responseBody: any): Promise<void> => {
  if (!isNativeApp()) return;
  const result = responseBody?.data || responseBody?.result || responseBody;
  if (result?.refreshToken) {
    await setNativeRefreshToken(result.refreshToken);
  }
};

let devicesCache: any[] | null = null;
let lastDevicesFetchTime = 0;
let inFlightDevicesPromise: Promise<any> | null = null;
const DEVICES_CACHE_TTL_MS = 15_000;

export const authService = {
  /** Làm mới access token qua điểm duy nhất tokenRefresh (không gửi trùng); trả null nếu không làm mới được. */
  refreshToken: (): Promise<string | null> => refreshAccessToken().catch(() => null),

  login: async (data: any) => {
    const deviceFingerprint = await getDeviceFingerprint();
    const deviceName = getDeviceName();

    const payload = {
      email: data.email || data.username,
      password: data.password,
      deviceFingerprint,
      deviceName,
    };
    const res = await api.post('/auth/login', payload, {
      headers: {
        'X-Client-Type': getClientType(),
        'X-Device-Fingerprint': deviceFingerprint,
      },
    });
    await persistNativeRefreshToken(res.data);
    return res.data;
  },

  sendRegisterOtp: async (email: string) => {
    const res = await api.post('/auth/register/send-otp', { email });
    return res.data;
  },

  verifyRegisterOtp: async (email: string, otpCode: string) => {
    const res = await api.post('/auth/register/verify-otp', { email, otpCode });
    return res.data?.data || res.data;
  },

  register: async (data: any) => {
    const payload = {
      registerSessionToken: data.registerSessionToken,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName || undefined,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender || 'MALE',
    };
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  logout: async () => {
    try {
      const deviceFingerprint = await getDeviceFingerprint();
      await api.post('/auth/logout', { deviceFingerprint }, {
        headers: {
          'X-Client-Type': getClientType(),
          'X-Device-Fingerprint': deviceFingerprint,
        },
      });
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      await clearNativeRefreshToken();
    }
  },

  // Quản lý thiết bị đăng nhập (auth-service)
  getDevices: async (forceRefresh = false) => {
    if (!forceRefresh && devicesCache && Date.now() - lastDevicesFetchTime < DEVICES_CACHE_TTL_MS) {
      return devicesCache;
    }
    if (inFlightDevicesPromise && !forceRefresh) {
      return inFlightDevicesPromise;
    }

    inFlightDevicesPromise = (async () => {
      try {
        const res = await api.get('/devices');
        const list = res.data?.data?.devices || res.data?.data || [];
        devicesCache = Array.isArray(list) ? list : [];
        lastDevicesFetchTime = Date.now();
        return devicesCache;
      } finally {
        inFlightDevicesPromise = null;
      }
    })();

    return inFlightDevicesPromise;
  },

  revokeDevice: async (deviceId: string) => {
    devicesCache = null;
    const res = await api.delete(`/devices/${deviceId}`);
    return res.data;
  },

  // Xác thực 2 bước (MFA)
  setupMfa: async () => {
    const res = await api.post('/auth/mfa/setup');
    return res.data?.data || res.data;
  },

  enableMfa: async (otpCode: string) => {
    const res = await api.post('/auth/mfa/enable', { otpCode, mfaType: 'TOTP' });
    return res.data;
  },

  disableMfa: async (otpCode: string) => {
    const res = await api.post('/auth/mfa/disable', { otpCode });
    return res.data;
  },

  verifyMfa: async (mfaToken: string, otpCode: string) => {
    const deviceFingerprint = (await getDeviceFingerprint()) || localStorage.getItem('deviceFingerprint') || '';
    const deviceName = getDeviceName();
    const res = await api.post(
      '/auth/mfa/verify',
      { mfaToken, otpCode, deviceFingerprint, deviceName },
      {
        headers: {
          'X-Client-Type': getClientType(),
          'X-Device-Fingerprint': deviceFingerprint,
        },
      }
    );
    await persistNativeRefreshToken(res.data);
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/password/forgot', { email });
    return res.data;
  },

  resetPassword: async (data: { email: string; resetToken: string; newPassword: string }) => {
    const res = await api.post('/auth/password/reset', data);
    return res.data;
  },
};
