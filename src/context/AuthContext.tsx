import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthTokens, AuthContextType } from '../types';
import { authService, userService } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
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
    const storedToken = localStorage.getItem('token');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedGuest = localStorage.getItem('isGuest');

    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setTokens({ accessToken: storedToken, refreshToken: storedRefresh || '' });
      setIsGuest(false);
      refreshUserProfile();
    } else {
      setIsGuest(true);
    }

    const handleExpired = () => {
      setUser(null);
      setTokens(null);
      setIsGuest(true);
      setLoginModalOpen(true);
    };
    window.addEventListener('auth_session_expired', handleExpired);

    return () => {
      window.removeEventListener('auth_session_expired', handleExpired);
    };
  }, []);

  const login = async (username?: string, password?: string): Promise<boolean> => {
    try {
      const res = await authService.login({ username, password });
      const result = res?.data || res?.result || res;
      if (result && (result.token || result.accessToken)) {
        const accessToken = result.token || result.accessToken;
        const refreshToken = result.refreshToken || '';
        const rawUser = result.user;
        const fullName = rawUser ? ((rawUser.lastName ? rawUser.lastName + ' ' : '') + (rawUser.firstName || '')) : (username || 'Người dùng');
        const userData: User = rawUser ? {
          id: rawUser.id,
          username: rawUser.email || username,
          email: rawUser.email || '',
          fullName: fullName.trim() || 'Người dùng',
        } : {
          id: 'u-' + Date.now(),
          username: username || 'user',
          email: (username || 'user') + '@example.com',
          fullName: username || 'Người dùng'
        };
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.removeItem('isGuest');
        setUser(userData);
        setTokens({ accessToken, refreshToken });
        setIsGuest(false);
        setLoginModalOpen(false);
        refreshUserProfile();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login failed:', e);
      return false;
    }
  };

  const register = async (username: string, email: string, password?: string, fullName?: string): Promise<boolean> => {
    try {
      const res = await authService.register({ username, email, password, fullName: fullName || username });
      if (res?.code === 200 || res?.code === 1000 || res?.data || res?.result || res?.id) {
        return await login(email || username, password);
      }
      return false;
    } catch (e) {
      console.error('Register failed:', e);
      return false;
    }
  };

  const loginAsGuest = () => {
    localStorage.setItem('isGuest', 'true');
    setIsGuest(true);
    setUser(null);
    setTokens(null);
    setLoginModalOpen(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.setItem('isGuest', 'true');
    setUser(null);
    setTokens(null);
    setIsGuest(true);
  };

  const openLoginModal = () => setLoginModalOpen(true);
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