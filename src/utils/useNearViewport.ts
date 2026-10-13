import { useEffect, useRef, useState } from 'react';

/**
 * Trả về [ref, near]: `near` chuyển thành true (và giữ nguyên) khi phần tử đến gần vùng nhìn thấy
 * (cách màn hình tối đa `rootMargin`). Dùng để chỉ nạp dữ liệu phụ của các thẻ bài viết khi người dùng
 * sắp cuộn tới, thay vì gọi API cho cả chục bài nằm rất xa phía dưới ngay khi mở trang.
 *
 * Trình duyệt không hỗ trợ IntersectionObserver thì coi như luôn "gần" để không làm mất dữ liệu.
 */
export function useNearViewport<T extends Element>(rootMargin = '900px 0px') {
  const ref = useRef<T | null>(null);
  const [near, setNear] = useState<boolean>(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (near) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  return [ref, near] as const;
}
