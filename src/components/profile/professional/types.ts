export interface DailyMetric {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  engagements: number;
}

export interface TopPostMetric {
  id: string;
  content: string;
  firstMediaUrl?: string | null;
  createdAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  engagementRate: number;
}

export interface CreatorAnalytics {
  totalViews: number;
  totalReach: number;
  totalEngagements: number;
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  dailyMetrics: DailyMetric[];
  topPosts: TopPostMetric[];
  period: string;
}

export interface ProfessionalModePayload {
  isProfessionalMode: boolean;
  creatorCategory?: string;
}

export const CREATOR_CATEGORIES = [
  'Người sáng tạo nội dung số',
  'Blogger / Người viết lách',
  'Nhiếp ảnh gia & Video Creator',
  'Game thủ / Streamer',
  'Nghệ sĩ / Âm nhạc',
  'Kỹ sư phần mềm / Công nghệ',
  'Doanh nhân & Khởi nghiệp',
  'Thời trang & Phong cách sống',
  'Giáo dục & Đào tạo',
  'Sức khỏe & Thể hình',
] as const;
