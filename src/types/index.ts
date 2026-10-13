export type Theme = 'light' | 'dark';
export type Language = 'vi' | 'en';
export type FeedMode = 'relevance' | 'recent' | 'trending';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  coverUrl?: string;
  bio?: string;
  createdAt?: string;
  roles?: string[];
  isProfessionalMode?: boolean;
  creatorCategory?: string;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  website?: string;
  followerCount?: number;
  followingCount?: number;
  friendCount?: number;
  isProfessionalMode?: boolean;
  creatorCategory?: string;
  profileViewCount?: number;
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
  /** Thời điểm bình luận gốc (ISO) để hiển thị "5 phút trước" */
  createdAtRaw?: string;
  likesCount?: number;
  isLiked?: boolean;
  parentCommentId?: string;
  replies?: Comment[];
  taggedUserIds?: string[];
  isTopFan?: boolean;
}

export interface PostMediaItem {
  id?: string;
  fileUrl: string;
  fileKey?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'OTHER' | string;
  fileSize?: number;
  sortOrder?: number;
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorAvatar?: string;
  authonAvatar?: string;
  content: string;
  /** Bản tóm tắt do AI tạo cho bài viết dài (hơn 1000 ký tự); không có với bài ngắn. */
  summary?: string;
  mediaUrls?: string[];
  mediaList?: PostMediaItem[];
  createdAt: string;
  /** Thời điểm đăng gốc (ISO) từ máy chủ, dùng để tính "5 phút trước"; createdAt chỉ là chuỗi ngày đã định dạng. */
  createdAtRaw?: string;
  /** Lý do bài xuất hiện trong bảng tin xếp hạng: friend, following, group, interacted, popular, trending, own, recent. */
  relevanceReason?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isTrending?: boolean;
  scheduledPublishAt?: string;
  status?: 'PUBLISHED' | 'SCHEDULED' | 'PENDING_APPROVAL' | 'REJECTED' | 'PROCESSING' | 'FAILED' | string;
  privacy?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' | string;
  groupId?: string;
  groupName?: string;
  groupAvatar?: string;
  groupCover?: string;
  groupPrivacy?: 'PUBLIC' | 'PRIVATE' | string;
  originalPostId?: string;
  sharedPost?: Post;
  comments?: Comment[];
  isLive?: boolean;
  liveStatus?: 'LIVE' | 'ENDED' | string;
  isOptimistic?: boolean;
  taggedUserIds?: string[];
  hashtags?: string[];
}

export interface ProfileVisitor {
  id?: string;
  viewerId: string;
  viewerUsername?: string;
  viewerFullName?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  avatarUrl?: string;
  viewerAvatarUrl?: string;
  lastViewedAt: string;
  isFriend?: boolean;
  isFollowing?: boolean;
}

export interface AudienceDemographics {
  totalAudience: number;
  genderBreakdown: {
    malePercentage: number;
    femalePercentage: number;
    otherPercentage: number;
  };
  ageRanges: Array<{
    range: string;
    percentage: number;
  }>;
  topCities: Array<{
    city: string;
    percentage: number;
  }>;
  hourlyActivity: Array<{
    hour: string;
    activePercentage: number;
  }>;
}

export interface PostInsights {
  postId: string;
  contentSnippet: string;
  publishedAt: string;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
  avgWatchRetention: number;
  trafficSources: Record<string, number>;
  audienceGender: Record<string, number>;
  hourlyViews: Array<{
    hour: string;
    views: number;
    engagements: number;
  }>;
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
  t: (key: string, fallback?: string) => string;
}

export interface RegisterData {
  email: string;
  password: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  dateOfBirth: string;
  gender?: string;
  registerSessionToken?: string;
}

export interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  loginModalOpen: boolean;
  login: (username?: string, password?: string) => Promise<{ success: boolean; message?: string; mfaRequired?: boolean; mfaToken?: string; mfaType?: string }>;
  verifyMfaLogin: (mfaToken: string, otpCode: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  loginAsGuest: () => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  refreshUserProfile: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}
