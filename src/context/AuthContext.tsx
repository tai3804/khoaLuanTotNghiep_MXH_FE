import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthTokens, AuthContextType, RegisterData } from '../types';
import { authService, userService } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setAccessToken, clearAuth } from '../store/slices/authSlice';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      // We don't check storedToken anymore, if user exists we assume they might still have a valid cookie
      if (storedUser && !localStorage.getItem('isGuest')) {
        return JSON.parse(storedUser);
      }
    } catch {}
    return null;
  });

  const tokens = accessToken ? { accessToken, refreshToken: '' } : null;

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('isGuest') === 'true';
  });

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const refreshUserProfile = async () => {
    try {
      const profile = await userService.getMyProfile();
      if (profile) {
        const fullName = `${profile.lastName || ''} ${profile.firstName || ''}`.trim() || profile.fullName;
        setUser((prev) => {
          const updated: User = {
            id: profile.userId || profile.id || prev?.id || 'me',
            username: profile.email || prev?.username || 'user',
            email: profile.email || prev?.email || '',
            fullName: fullName || prev?.fullName || 'Người dùng',
            avatar: profile.avatarUrl || prev?.avatar || '',
            bio: profile.bio || prev?.bio || '',
          };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch {
      // ignore
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const isGuestUser = localStorage.getItem('isGuest') === 'true';

    // If we have a user and not a guest, we try to refresh profile.
    // This will trigger a 401 if accessToken is empty, which in turn triggers axiosClient's refresh interceptor.
    if (storedUser && !isGuestUser) {
      refreshUserProfile();
    } else {
      setIsGuest(true);
    }

    const handleExpired = () => {
      setUser(null);
      dispatch(clearAuth());
      setIsGuest(true);
      setLoginModalOpen(false);
      window.dispatchEvent(new Event('navigate_to_auth'));
    };
    window.addEventListener('auth_session_expired', handleExpired);

    return () => {
      window.removeEventListener('auth_session_expired', handleExpired);
    };
  }, []);

  // Check if current device has been revoked remotely (heartbeat & focus listener)
  useEffect(() => {
    if (!user) return;

    const checkDeviceSession = async () => {
      const currentFingerprint = localStorage.getItem('deviceFingerprint');
      if (!currentFingerprint) return;

      try {
        const devices = await authService.getDevices();
        if (Array.isArray(devices)) {
          const currentDev = devices.find((d: any) => d.deviceFingerprint === currentFingerprint);
          if (currentDev && currentDev.status === 'REVOKED') {
            console.warn('[AuthContext] Session has been revoked remotely.');
            localStorage.removeItem('user');
            dispatch(clearAuth());
            setUser(null);
            setIsGuest(true);
            setLoginModalOpen(false);
            window.dispatchEvent(new Event('navigate_to_auth'));
          }
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('user');
          dispatch(clearAuth());
          setUser(null);
          setIsGuest(true);
          setLoginModalOpen(false);
          window.dispatchEvent(new Event('navigate_to_auth'));
        }
      }
    };

    // Check session status every 10s
    const interval = setInterval(checkDeviceSession, 10000);

    // Check on window focus / tab switch / storage change
    const handleFocus = () => checkDeviceSession();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lastRevokedAt' || e.key === 'user') {
        checkDeviceSession();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user]);

  const login = async (
    username?: string,
    password?: string
  ): Promise<{ success: boolean; mfaRequired?: boolean; mfaToken?: string; mfaType?: string; message?: string }> => {
    try {
      const res = await authService.login({ username, password });
      const result = res?.data || res?.result || res;

      // Handle 2FA Required
      if (result && result.mfaRequired) {
        return {
          success: true,
          mfaRequired: true,
          mfaToken: result.mfaToken,
          mfaType: result.mfaType || 'TOTP',
        };
      }

      if (result && (result.token || result.accessToken)) {
        const accToken = result.token || result.accessToken;
        const rawUser = result.user;
        const fullName = rawUser
          ? `${rawUser.lastName ? rawUser.lastName + ' ' : ''}${rawUser.firstName || ''}`
          : username || 'Người dùng';
        const userData: User = rawUser
          ? {
              id: rawUser.id,
              username: rawUser.email || username,
              email: rawUser.email || '',
              fullName: fullName.trim() || 'Người dùng',
              avatar: rawUser.avatarUrl || '',
            }
          : {
              id: 'u-' + Date.now(),
              username: username || 'user',
              email: (username || 'user') + '@example.com',
              fullName: username || 'Người dùng',
            };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.removeItem('isGuest');
        setUser(userData);
        dispatch(setAccessToken(accToken));
        setIsGuest(false);
        setLoginModalOpen(false);
        refreshUserProfile();
        return { success: true };
      }
      return { success: false, message: 'Đăng nhập thất bại. Email hoặc mật khẩu chưa đúng!' };
    } catch (e: any) {
      console.error('Login failed:', e);
      return { success: false, message: e.response?.data?.message || 'Đăng nhập thất bại' };
    }
  };

  const verifyMfaLogin = async (mfaToken: string, otpCode: string): Promise<boolean> => {
    try {
      const res = await authService.verifyMfa(mfaToken, otpCode);
      const result = res?.data || res?.result || res;
      if (result && (result.accessToken || result.token)) {
        const accToken = result.token || result.accessToken;
        const rawUser = result.user;
        const fullName = rawUser
          ? `${rawUser.lastName ? rawUser.lastName + ' ' : ''}${rawUser.firstName || ''}`
          : 'Người dùng';
        const userData: User = rawUser
          ? {
              id: rawUser.id,
              username: rawUser.email || 'user',
              email: rawUser.email || '',
              fullName: fullName.trim() || 'Người dùng',
              avatar: rawUser.avatarUrl || '',
            }
          : {
              id: 'u-' + Date.now(),
              username: 'user',
              email: 'user@example.com',
              fullName: 'Người dùng',
            };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.removeItem('isGuest');
        setUser(userData);
        dispatch(setAccessToken(accToken));
        setIsGuest(false);
        setLoginModalOpen(false);
        refreshUserProfile();
        return true;
      }
      return false;
    } catch (e) {
      console.error('MFA Login Verification failed:', e);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const res = await authService.register(data);
      if (res?.code === 200 || res?.code === 1000 || res?.data || res?.result || res?.id) {
        const loginRes = await login(data.email, data.password);
        return loginRes.success;
      }
      return false;
    } catch (e: any) {
      console.error('Register failed:', e);
      throw e;
    }
  };

  const loginAsGuest = () => {
    localStorage.setItem('isGuest', 'true');
    setIsGuest(true);
    setUser(null);
    dispatch(clearAuth());
    setLoginModalOpen(false);
  };

  const logout = () => {
    authService.logout().catch(() => null);
    localStorage.removeItem('user');
    localStorage.setItem('isGuest', 'true');
    setUser(null);
    dispatch(clearAuth());
    setIsGuest(true);
    setLoginModalOpen(false);
    window.dispatchEvent(new Event('navigate_to_auth'));
  };

  const openLoginModal = () => {
    setLoginModalOpen(false);
    window.dispatchEvent(new Event('navigate_to_auth'));
  };
  const closeLoginModal = () => setLoginModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: !!user,
        isGuest,
        loginModalOpen,
        login,
        verifyMfaLogin,
        register,
        loginAsGuest,
        logout,
        openLoginModal,
        closeLoginModal,
        refreshUserProfile,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};