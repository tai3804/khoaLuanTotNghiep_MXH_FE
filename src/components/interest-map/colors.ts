import { InterestAction } from '../../services/interestMapService';

/**
 * Màu theo loại đối tượng trên sơ đồ (một chỗ duy nhất, dùng cho sơ đồ, chú thích và danh sách). Mọi đối tượng đều là chấm
 * tròn cùng cỡ, chỉ khác màu:
 *   vector của bạn: xanh dương · đã thích (×1): vàng · đã bình luận (×2): tím · đã chia sẻ (×3): đỏ · đã tìm kiếm (×1): nâu
 *   bảng tin sẽ ưu tiên: xanh ngọc · bài mới (24 giờ): xanh lá · bài khác: xám · tâm chủ đề: màu mực chữ
 */
export const ACTION_FILL: Record<InterestAction, string> = {
  REACTION: 'fill-[#f2a600] dark:fill-[#e6b800]',
  COMMENT: 'fill-[#8e44ad] dark:fill-[#a855c8]',
  SHARE: 'fill-[#ec4647] dark:fill-[#f06292]',
  SEARCH: 'fill-[#8d6e63] dark:fill-[#a1887f]',
};

export const ACTION_BG: Record<InterestAction, string> = {
  REACTION: 'bg-[#f2a600] dark:bg-[#e6b800]',
  COMMENT: 'bg-[#8e44ad] dark:bg-[#a855c8]',
  SHARE: 'bg-[#ec4647] dark:bg-[#f06292]',
  SEARCH: 'bg-[#8d6e63] dark:bg-[#a1887f]',
};

export const ACTION_TEXT: Record<InterestAction, string> = {
  REACTION: 'text-[#c98a00] dark:text-[#e6b800]',
  COMMENT: 'text-[#8e44ad] dark:text-[#a855c8]',
  SHARE: 'text-[#ec4647] dark:text-[#f06292]',
  SEARCH: 'text-[#8d6e63] dark:text-[#a1887f]',
};

export const ACTION_WEIGHT: Record<InterestAction, number> = { REACTION: 1, COMMENT: 2, SHARE: 3, SEARCH: 1 };

export const USER_FILL = 'fill-[#257de0] dark:fill-[#338ced]';
export const USER_BG = 'bg-[#257de0] dark:bg-[#338ced]';
export const RECOMMEND_FILL = 'fill-[#00b894] dark:fill-[#2bc0d8]';
export const RECOMMEND_BG = 'bg-[#00b894] dark:bg-[#2bc0d8]';
export const RECENT_FILL = 'fill-[#008a17] dark:fill-[#0aac23]';
export const RECENT_BG = 'bg-[#008a17] dark:bg-[#0aac23]';
export const OTHER_BG = 'bg-gray-300 dark:bg-[#4e4f50]';
/** Tâm chủ đề: một màu trung tính đậm (mực chữ), khác hẳn các màu đối tượng */
export const TOPIC_FILL = 'fill-gray-700 dark:fill-[#e4e6eb]';
export const TOPIC_BG = 'bg-gray-700 dark:bg-[#e4e6eb]';
