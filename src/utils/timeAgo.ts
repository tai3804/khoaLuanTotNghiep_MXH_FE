/**
 * Thời gian đăng dạng tương đối, giống mạng xã hội:
 *   < 1 phút  : "Vừa xong"
 *   < 1 giờ   : "5 phút trước"
 *   < 24 giờ  : "7 giờ trước"
 *   < 7 ngày  : "2 ngày trước"
 *   < 30 ngày : "2 tuần trước"
 *   từ 30 ngày: ngày đầy đủ (vd 9/9/2026)
 */
export type TimeLanguage = 'vi' | 'en';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const justNowLabel = (lang: TimeLanguage = 'vi') => (lang === 'en' ? 'Just now' : 'Vừa xong');

/** Ngày giờ đầy đủ, dùng làm tooltip khi rê chuột. Trả về undefined nếu thời gian không hợp lệ. */
export function formatFullDateTime(iso: string | null | undefined, lang: TimeLanguage = 'vi'): string | undefined {
  const t = iso ? new Date(iso).getTime() : NaN;
  if (Number.isNaN(t)) return undefined;
  return new Date(t).toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN');
}

/**
 * @returns chuỗi thời gian tương đối, hoặc null nếu `iso` không hợp lệ (để nơi gọi tự dùng giá trị dự phòng)
 */
export function formatTimeAgo(
  iso: string | null | undefined,
  lang: TimeLanguage = 'vi',
  now: number = Date.now(),
): string | null {
  const t = iso ? new Date(iso).getTime() : NaN;
  if (Number.isNaN(t)) return null;

  const diff = now - t;
  // Dưới 1 phút (kể cả giờ máy khách lệch nhẹ so với máy chủ khiến diff âm)
  if (diff < MINUTE) return justNowLabel(lang);

  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return lang === 'en' ? `${m} ${m === 1 ? 'minute' : 'minutes'} ago` : `${m} phút trước`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return lang === 'en' ? `${h} ${h === 1 ? 'hour' : 'hours'} ago` : `${h} giờ trước`;
  }
  if (diff < 7 * DAY) {
    const d = Math.floor(diff / DAY);
    return lang === 'en' ? `${d} ${d === 1 ? 'day' : 'days'} ago` : `${d} ngày trước`;
  }
  if (diff < 30 * DAY) {
    const w = Math.floor(diff / (7 * DAY));
    return lang === 'en' ? `${w} ${w === 1 ? 'week' : 'weeks'} ago` : `${w} tuần trước`;
  }
  return new Date(t).toLocaleDateString(lang === 'en' ? 'en-US' : 'vi-VN');
}
