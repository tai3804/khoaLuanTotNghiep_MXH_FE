import React, { useEffect, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeAgo';

/** Thẻ trắng dùng chung cho các tab con của nhóm. */
export const TabCard: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <section className={`rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-[#393a3b] dark:bg-[#242526] ${className}`}>
    {children}
  </section>
);

/** Trạng thái rỗng: biểu tượng, tiêu đề, gợi ý. */
export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; hint?: string; action?: React.ReactNode }> = ({ icon, title, hint, action }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-[#3a3b3c] dark:text-[#8a8d91]">{icon}</div>
    <p className="font-bold text-gray-900 dark:text-[#e4e6eb]">{title}</p>
    {hint && <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-[#b0b3b8]">{hint}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/** Lỗi tải dữ liệu kèm nút thử lại. */
export const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div role="alert" className="flex flex-col items-center px-6 py-10 text-center">
    <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
    <p className="text-sm text-red-600 dark:text-red-300">{message}</p>
    <button type="button" onClick={onRetry} className="mt-3 rounded-xl bg-[#1877f2] px-4 py-2 text-sm font-bold text-white hover:bg-[#166fe5] cursor-pointer">
      Thử lại
    </button>
  </div>
);

/** Nút "Xem thêm" dùng khi cuộn vô hạn chưa kích hoạt (hoặc người dùng muốn bấm). */
export const LoadMoreButton: React.FC<{ loading: boolean; onClick: () => void; label?: string }> = ({ loading, onClick, label = 'Xem thêm' }) => (
  <div className="flex justify-center py-3">
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2 text-sm font-bold text-gray-800 hover:bg-gray-200 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  </div>
);

/**
 * Cuộn vô hạn: gắn ref vào một phần tử đặt cuối danh sách, khi nó lọt vào khung nhìn thì gọi onVisible.
 * `enabled=false` (hết dữ liệu hoặc đang tải) thì không quan sát.
 */
export const useInfiniteSentinel = (onVisible: () => void, enabled: boolean) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const callback = useRef(onVisible);
  callback.current = onVisible;

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) callback.current();
    }, { rootMargin: '300px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return ref;
};

/** "Tham gia 5 ngày trước" / "Vừa tham gia" / "Tham gia 9/9/2026". */
export const joinedLabel = (iso?: string): string => {
  const text = formatTimeAgo(iso, 'vi');
  if (!text) return 'Thành viên của nhóm';
  if (text === 'Vừa xong') return 'Vừa tham gia';
  return `Tham gia ${text}`;
};

/** "Gửi 5 phút trước" cho yêu cầu tham gia. */
export const requestedLabel = (iso?: string): string => {
  const text = formatTimeAgo(iso, 'vi');
  if (!text) return 'Đã gửi yêu cầu';
  if (text === 'Vừa xong') return 'Vừa gửi yêu cầu';
  return `Gửi yêu cầu ${text}`;
};

/** Bỏ dấu + chữ thường để so khớp tên không phân biệt dấu (giống tìm kiếm ở máy chủ). */
export const normalizeText = (value: string): string =>
  value.normalize('NFD').replace(/\p{M}+/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
