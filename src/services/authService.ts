import axios from 'axios';
import { api } from './axiosClient';
import { getDeviceFingerprint, getDeviceName } from '../utils/fingerprint';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const authService = {
  refreshToken: async (): Promise<string | null> => {
    try {
      const deviceFingerprint = (await getDeviceFingerprint()) || localStorage.getItem('deviceFingerprint') || '';

      const res = await axios.post(
        BASE_URL + '/auth/refresh',
        {}, // Carried strictly via HttpOnly cookie
        {
          withCredentials: true,
          headers: {
            'X-Client-Type': 'WEB',
            'X-Device-Fingerprint': deviceFingerprint,
          },
        }
      );
      const data = res.data?.data || res.data?.result || res.data;
      const newAccessToken = data?.accessToken || data?.token || null;

      if (newAccessToken) {
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
      }

      return newAccessToken;
    } catch {
      return null;
    }
  },

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
      const deviceFingerprint = await getDeviceFingerprint();
      await api.post('/auth/logout', { deviceFingerprint }, {
        headers: {
          'X-Client-Type': 'WEB',
          'X-Device-Fingerprint': deviceFingerprint,
        },
      });
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
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

  forgotPassword: async (email: string) => {
    const res = await api.post('/auth/password/forgot', { email });
    return res.data;
  },

  resetPassword: async (data: { email: string; resetToken: string; newPassword: string }) => {
    const res = await api.post('/auth/password/reset', data);
    return res.data;
  },
};
