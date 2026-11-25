import { useEffect, useState } from 'react';

interface Options {
  /** Cuộn lệch ít hơn ngưỡng này (px) thì bỏ qua, tránh nhấp nháy khi tay rung hoặc cuộn rất chậm. */
  minDelta?: number;
  /** Ở gần đầu trang (px) thì luôn hiện. */
  topOffset?: number;
  /** Chỉ áp dụng khi media query này khớp; mặc định là điện thoại. Không khớp thì luôn trả về false. */
  query?: string;
}

/**
 * Trả về true khi người dùng đang cuộn xuống (nên ẩn thành phần nổi đang che nội dung), false khi cuộn lên
 * hoặc đang ở gần đầu trang. Chỉ hoạt động trên màn hình hẹp; trên máy tính luôn false.
 */
export const useHideOnScrollDown = ({ minDelta = 8, topOffset = 120, query = '(max-width: 767px)' }: Options = {}): boolean => {
  const [enabled, setEnabled] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setEnabled(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  useEffect(() => {
    if (!enabled) return;
    let lastY = window.scrollY;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (y <= topOffset) setHidden(false);
        else if (delta > minDelta) setHidden(true);
        else if (delta < -minDelta) setHidden(false);
        // Chỉ dời mốc khi đã vượt ngưỡng: cuộn từng chút một vẫn cộng dồn được tới ngưỡng
        if (Math.abs(delta) > minDelta || y <= topOffset) lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled, minDelta, topOffset]);

  return enabled && hidden;
};
