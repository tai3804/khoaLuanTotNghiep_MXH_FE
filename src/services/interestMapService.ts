import { api } from './axiosClient';

export interface InterestPostPoint {
  id: string;
  x: number;
  y: number;
  topic: number;
  snippet: string;
  /** bài đăng trong 24 giờ gần đây */
  recent: boolean;
}

export interface InterestTopic {
  id: number;
  label: string;
  hashtags: string[];
  posts: number;
  x: number;
  y: number;
  /** cosine giữa vector sở thích và tâm chủ đề */
  affinity: number;
  /** tỉ trọng (theo trọng số) các tương tác (kể cả tìm kiếm) thuộc chủ đề này */
  share: number;
}

/** Loại tương tác góp vào vector sở thích; trọng số: thích 1, bình luận 2, chia sẻ 3, tìm kiếm 1 */
export type InterestAction = 'REACTION' | 'COMMENT' | 'SHARE' | 'SEARCH';

/** Tương tác với một bài viết (không gồm tìm kiếm) */
export type PostAction = Exclude<InterestAction, 'SEARCH'>;

export interface InterestInteractedPost {
  id: string;
  x: number;
  y: number;
  topic: number;
  action: PostAction;
  count: number;
  weight: number;
  snippet: string;
  lastAt: string | null;
}

export interface InterestSearchPoint {
  query: string;
  x: number;
  y: number;
  topic: number;
  weight: number;
  at: string;
}

export interface InterestTrailPoint {
  x: number;
  y: number;
  at: string;
  action: InterestAction;
  /** có khi bước này là tương tác với bài */
  postId: string | null;
  /** có khi bước này là tìm kiếm */
  query: string | null;
}

export interface InterestRecommendation {
  id: string;
  snippet: string;
  similarity: number;
  boost: number;
  topic: number;
  /** SEARCH: gần câu tìm gần nhất (24 giờ); INTEREST: gần vector sở thích */
  source: 'SEARCH' | 'INTEREST';
  query: string | null;
}

export interface InterestMap {
  dimensions: number;
  explainedX: number;
  explainedY: number;
  posts: InterestPostPoint[];
  topics: InterestTopic[];
  hasProfile: boolean;
  interactionCount: number;
  vectorizedPosts: number;
  minPosts: number;
  userX: number | null;
  userY: number | null;
  vector: number[] | null;
  interacted: InterestInteractedPost[];
  searches: InterestSearchPoint[];
  trail: InterestTrailPoint[];
  recommendations: InterestRecommendation[];
  computedAt: string;
}

export const interestMapService = {
  getMyInterestMap: async (): Promise<InterestMap> => {
    const res = await api.get('/posts/interest-map');
    return (res.data?.data || res.data) as InterestMap;
  },
};
