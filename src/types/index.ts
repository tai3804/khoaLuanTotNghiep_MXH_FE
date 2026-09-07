export type Theme = 'light' | 'dark';
export type Language = 'vi' | 'en';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isGuest: boolean;
}

export interface LoginRequest {
  username?: string;
  email?: string;
  password?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
  fullName: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  authonAvatar?: string;
  content: string;
  mediaUrls?: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  comments?: Comment[];
}

export interface ApiResponse<T = any> {
  code?: number;
  message?: string;
  result?: T;
  data?: T;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loginModalOpen: boolean;
  login: (username?: string, password?: string) => Promise<boolean>;
  register: (username: string, email: string, password?: string, fullName?: string) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}