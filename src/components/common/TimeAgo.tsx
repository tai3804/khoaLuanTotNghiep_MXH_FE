import React, { useSyncExternalStore } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { formatFullDateTime, formatTimeAgo, justNowLabel } from '../../utils/timeAgo';

// Một bộ đếm dùng chung cho mọi <TimeAgo/> trên trang: chỉ chạy khi còn ít nhất một nơi đang hiển thị,
// nên bảng tin có hàng chục bài vẫn chỉ cần một timer.
const TICK_MS = 30_000;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let tick = 0;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      tick += 1;
      listeners.forEach((l) => l());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
};
const getSnapshot = () => tick;

interface TimeAgoProps {
  /** Thời điểm đăng dạng ISO (createdAtRaw của bài viết) */
  iso?: string;
  /** Hiển thị khi không có/không đọc được `iso` (vd bài cũ chỉ có chuỗi ngày đã định dạng) */
  fallback?: string;
  className?: string;
}

/** Hiển thị "5 phút trước", "7 giờ trước", "2 ngày trước"... và tự cập nhật theo thời gian; rê chuột để xem ngày giờ đầy đủ. */
export const TimeAgo: React.FC<TimeAgoProps> = ({ iso, fallback, className }) => {
  const { language } = useLanguage();
  const lang = language === 'en' ? 'en' : 'vi';
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const text = formatTimeAgo(iso, lang) ?? fallback ?? justNowLabel(lang);
  const title = formatFullDateTime(iso, lang);

  return (
    <time dateTime={iso} title={title} className={className}>
      {text}
    </time>
  );
};
