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

  verifyMfa: async (mfaToken: string, otpCode: string) => {
    let deviceFingerprint = localStorage.getItem('deviceFingerprint') || '';
    const res = await api.post('/auth/mfa/verify', { mfaToken, otpCode, deviceFingerprint });
    return res.data;
  },
};
