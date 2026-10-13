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

export interface CreatorCategoryItem {
  name: string;
  iconName: string;
  description: string;
  tag: string;
}

export const CREATOR_CATEGORY_DETAILS: CreatorCategoryItem[] = [
  {
    name: 'Người sáng tạo nội dung số',
    iconName: 'Sparkles',
    description: 'Sáng tạo nội dung đa phương tiện, video ngắn & chia sẻ xu hướng',
    tag: 'Phổ biến nhất',
  },
  {
    name: 'Kỹ sư phần mềm / Công nghệ',
    iconName: 'Laptop',
    description: 'Lập trình, review công nghệ, AI & giải pháp kỹ thuật',
    tag: 'Tech & Dev',
  },
  {
    name: 'Game thủ / Streamer',
    iconName: 'Gamepad2',
    description: 'Phát trực tiếp trò chơi, esports & bình luận giải đấu',
    tag: 'Gaming',
  },
  {
    name: 'Nhiếp ảnh gia & Video Creator',
    iconName: 'Camera',
    description: 'Sản xuất hình ảnh nghệ thuật, reels, vlog & hậu kỳ video',
    tag: 'Visual Arts',
  },
  {
    name: 'Blogger / Người viết lách',
    iconName: 'PenTool',
    description: 'Viết bài chia sẻ quan điểm, tản văn, review sách & đời sống',
    tag: 'Content & Story',
  },
  {
    name: 'Doanh nhân & Khởi nghiệp',
    iconName: 'TrendingUp',
    description: 'Kinh doanh, đầu tư, kiến thức quản trị & xây dựng thương hiệu',
    tag: 'Business',
  },
  {
    name: 'Thời trang & Phong cách sống',
    iconName: 'Shirt',
    description: 'Phối đồ, làm đẹp, du lịch trải nghiệm & phong cách hiện đại',
    tag: 'Lifestyle',
  },
  {
    name: 'Giáo dục & Đào tạo',
    iconName: 'GraduationCap',
    description: 'Chia sẻ kiến thức, kỹ năng mềm, ngoại ngữ & học thuật',
    tag: 'Education',
  },
  {
    name: 'Sức khỏe & Thể hình',
    iconName: 'Dumbbell',
    description: 'Gym, yoga, dinh dưỡng lành mạnh & rèn luyện thể chất',
    tag: 'Fitness',
  },
  {
    name: 'Nghệ sĩ / Âm nhạc',
    iconName: 'Music',
    description: 'Sáng tác, ca hát, nhạc cụ, vũ đạo & biểu diễn nghệ thuật',
    tag: 'Music & Art',
  },
  {
    name: 'Ẩm thực & Đầu bếp',
    iconName: 'Utensils',
    description: 'Nấu ăn, công thức ẩm thực, review quán ăn & món ngon',
    tag: 'Food & Cooking',
  },
  {
    name: 'Giải trí & Hài hước',
    iconName: 'Smile',
    description: 'Tiểu phẩm vui nhộn, meme, kịch bản hài & giải trí thư giãn',
    tag: 'Entertainment',
  },
];

export const CREATOR_CATEGORIES = CREATOR_CATEGORY_DETAILS.map((c) => c.name);
