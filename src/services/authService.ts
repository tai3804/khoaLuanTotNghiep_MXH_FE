import { api } from './axiosClient';

export const authService = {
  login: async (data: any) => {
    let deviceFingerprint = localStorage.getItem('deviceFingerprint');
    if (!deviceFingerprint) {
      deviceFingerprint = 'web-' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('deviceFingerprint', deviceFingerprint);
    }

    const payload = {
      email: data.email || data.username,
      password: data.password,
      deviceFingerprint,
      deviceName: 'Trình duyệt Web',
    };
    const res = await api.post('/auth/login', payload, {
      headers: {
        'X-Client-Type': 'WEB',
        'X-Device-Fingerprint': deviceFingerprint,
      },
    });
    return res.data;
  },

  register: async (data: any) => {
    const rawName = (data.fullName || data.username || 'User').trim();
    const parts = rawName.split(/\s+/);
    const lastName = parts.length > 1 ? parts[0] : 'User';
    const firstName = parts.length > 1 ? parts.slice(1).join(' ') : parts[0];

    const payload = {
      email: data.email,
      password: data.password,
      firstName: firstName || 'User',
      lastName: lastName || 'User',
    };
    const res = await api.post('/auth/register', payload);
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

  // Quản lý thiết bị đăng nhập (auth-service)
  getDevices: async () => {
    const res = await api.get('/devices');
    return res.data?.data?.devices || res.data?.data || [];
  },

  revokeDevice: async (deviceId: string) => {
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
};
