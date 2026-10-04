import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthTokens, AuthContextType, RegisterData } from '../types';
import { authService, userService } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, store } from '../store/store';
import { setAccessToken, clearAuth } from '../store/slices/authSlice';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const parseTokenPayload = (token: string): any => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export const rolesFromToken = (token: string): string[] => {
  try {
    const decoded = parseTokenPayload(token);
    if (!decoded) return [];
    if (Array.isArray(decoded.roles)) return decoded.roles;
    if (Array.isArray(decoded.authorities)) return decoded.authorities;
    if (typeof decoded.scope === 'string') return decoded.scope.split(' ');
    if (typeof decoded.role === 'string') return [decoded.role];
    if (Array.isArray(decoded.role)) return decoded.role;
    return [];
  } catch {
    return [];
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && !localStorage.getItem('isGuest')) {
        return JSON.parse(storedUser);
      }
    } catch {}
    return null;
  });

  const [initializing, setInitializing] = useState<boolean>(true);

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
          const currentToken = store.getState().auth.accessToken || '';
          const currentRoles = (prev?.roles && prev.roles.length > 0)
            ? prev.roles
            : rolesFromToken(currentToken);

          const updated: User = {
            id: profile.userId || profile.id || prev?.id || 'me',
            username: profile.email || prev?.username || 'user',
            email: profile.email || prev?.email || '',
            fullName: fullName || prev?.fullName || 'Người dùng',
            avatar: profile.avatarUrl || prev?.avatar || '',
            bio: profile.bio || prev?.bio || '',
            roles: currentRoles,
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
    const initAuth = async () => {
      const isGuestUser = localStorage.getItem('isGuest') === 'true';

      if (!isGuestUser) {
        try {
          const token = await authService.refreshToken();
          if (token) {
            dispatch(setAccessToken(token));
            setIsGuest(false);
            if (!user) {
              const payload = parseTokenPayload(token);
              if (payload) {
                const initialUser: User = {
                  id: payload.sub || 'me',
                  username: payload.email || 'user',
                  email: payload.email || '',
                  fullName: payload.fullName || 'Người dùng',
                  avatar: '',
                  roles: rolesFromToken(token),
                };
                setUser(initialUser);
                localStorage.setItem('user', JSON.stringify(initialUser));
              }
            }
            await refreshUserProfile();
          } else {
            // No valid session cookie
            localStorage.removeItem('user');
            try { localStorage.removeItem('refreshToken'); } catch {}
            setUser(null);
            dispatch(clearAuth());
            setIsGuest(true);
          }
        } catch {
          localStorage.removeItem('user');
          try { localStorage.removeItem('refreshToken'); } catch {}
          setUser(null);
          dispatch(clearAuth());
          setIsGuest(true);
        }
      } else {
        setIsGuest(true);
      }
      setInitializing(false);
    };

    initAuth();

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

  // Proactive background silent refresh timer: renew access token before it expires without reload
  useEffect(() => {
    if (!accessToken) return;

    const payload = parseTokenPayload(accessToken);
    if (!payload || !payload.exp) return;

    const expiresAtMs = payload.exp * 1000;
    const now = Date.now();
    const timeRemaining = expiresAtMs - now;

    // Refresh 2 minutes before expiry, or at 75% of remaining lifetime
    const bufferMs = Math.min(120000, Math.max(10000, timeRemaining * 0.25));
    const delayMs = Math.max(timeRemaining - bufferMs, 5000);

    const timer = setTimeout(async () => {
      try {
        const newToken = await authService.refreshToken();
        if (newToken) {
          dispatch(setAccessToken(newToken));
        }
      } catch (err) {
        console.warn('[AuthContext] Background proactive token refresh notice:', err);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [accessToken, dispatch]);

  // Refresh on window focus / tab visibility if token is near expiration or expired (e.g. computer sleep)
  useEffect(() => {
    const handleVisibilityOrFocus = async () => {
      const currentToken = store.getState().auth.accessToken;
      if (!currentToken) return;

      const payload = parseTokenPayload(currentToken);
      if (!payload || !payload.exp) return;

      const timeRemaining = payload.exp * 1000 - Date.now();
      // If token expires in less than 60 seconds (or is already expired)
      if (timeRemaining < 60000) {
        try {
          const newToken = await authService.refreshToken();
          if (newToken) {
            dispatch(setAccessToken(newToken));
          }
        } catch (err) {
          console.warn('[AuthContext] Focus token renewal notice:', err);
        }
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleVisibilityOrFocus();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [dispatch]);

  // Check if current device has been revoked remotely (heartbeat & focus listener)
  useEffect(() => {
    if (!user || !accessToken) return;

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
            localStorage.removeItem('refreshToken');
            dispatch(clearAuth());
            setUser(null);
            setIsGuest(true);
            setLoginModalOpen(false);
            window.dispatchEvent(new Event('navigate_to_auth'));
          }
        }
      } catch (err: any) {
        // Do not purge session on 401/403 here - Axios interceptor handles token refresh/expiry cleanly
        console.warn('[AuthContext] Device heartbeat check notice:', err?.message || err);
      }
    };

    // Check session status every 30s (reduced overhead)
    const interval = setInterval(checkDeviceSession, 30000);

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
  }, [user, accessToken]);

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

        const tokenPayload = parseTokenPayload(accToken);
        const rawUser = result.user;
        const fullName = rawUser
          ? `${rawUser.lastName ? rawUser.lastName + ' ' : ''}${rawUser.firstName || ''}`
          : tokenPayload?.fullName || username || 'Người dùng';
        const userData: User = rawUser
          ? {
              id: rawUser.id,
              username: rawUser.email || username || tokenPayload?.sub,
              email: rawUser.email || tokenPayload?.email || '',
              fullName: fullName.trim() || 'Người dùng',
              avatar: rawUser.avatarUrl || '',
              roles: rolesFromToken(accToken),
            }
          : {
              id: tokenPayload?.sub || '',
              username: tokenPayload?.email || username || '',
              email: tokenPayload?.email || '',
              fullName: fullName.trim() || 'Người dùng',
              avatar: '',
              roles: rolesFromToken(accToken),
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

        const tokenPayload = parseTokenPayload(accToken);
        const rawUser = result.user;
        const fullName = rawUser
          ? `${rawUser.lastName ? rawUser.lastName + ' ' : ''}${rawUser.firstName || ''}`
          : tokenPayload?.fullName || 'Người dùng';
        const userData: User = rawUser
          ? {
              id: rawUser.id,
              username: rawUser.email || tokenPayload?.sub,
              email: rawUser.email || tokenPayload?.email || '',
              fullName: fullName.trim() || 'Người dùng',
              avatar: rawUser.avatarUrl || '',
              roles: rolesFromToken(accToken),
            }
          : {
              id: tokenPayload?.sub || '',
              username: tokenPayload?.email || '',
              email: tokenPayload?.email || '',
              fullName: fullName.trim() || 'Người dùng',
              avatar: '',
              roles: rolesFromToken(accToken),
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
    localStorage.removeItem('refreshToken');
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

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#18191a]">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        isAuthenticated: Boolean(user && !isGuest && accessToken),
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
