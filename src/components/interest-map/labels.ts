import { InterestAction, InterestRecommendation } from '../../services/interestMapService';

/** Lý do một bài được bảng tin ưu tiên, dùng chung cho sơ đồ và danh sách. */
export const recommendReason = (r: InterestRecommendation) =>
  r.source === 'SEARCH'
    ? `Vì bạn vừa tìm “${r.query}” · độ giống ${r.similarity.toFixed(3)}`
    : `Gần vector sở thích · độ giống ${r.similarity.toFixed(3)} · ${r.boost > 0 ? `cộng ${(r.boost * 100).toFixed(0)}% điểm nội dung` : 'dưới ngưỡng cộng điểm'}`;

export const ACTION_LABEL: Record<InterestAction, string> = {
  REACTION: 'Thích',
  COMMENT: 'Bình luận',
  SHARE: 'Chia sẻ',
  SEARCH: 'Tìm kiếm',
};

export const timeAgo = (iso: string | null | undefined) => {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return `${Math.floor(s / 86400)} ngày trước`;
};
