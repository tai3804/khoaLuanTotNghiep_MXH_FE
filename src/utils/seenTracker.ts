import { useEffect, useRef } from 'react';
import { api } from '../services/axiosClient';
import { store } from '../store/store';

// Ghi nhận bài viết người dùng đã thực sự xem trên bảng tin (đủ lớn trên màn hình và đủ lâu) để lần tải sau
// máy chủ không đưa lại những bài này (GET /posts?unseenOnly=true), giống cách Facebook không bắt lướt lại bài cũ.

/** Phải thấy ít nhất nửa bài (hoặc nửa chiều cao màn hình với bài rất dài) trong chừng này mili giây. */
const SEEN_DWELL_MS = 1000;
/** Gom các bài mới xem rồi gửi một lần cho đỡ tốn request. */
const FLUSH_DELAY_MS = 4000;
const MAX_BATCH = 50;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const recorded = new Set<string>(); // đã đưa vào hàng đợi trong phiên này, khỏi gửi lại
let queue: string[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let listenersAttached = false;

function takeBatch(): string[] {
  const batch = queue.slice(0, MAX_BATCH);
  queue = queue.slice(MAX_BATCH);
  return batch;
}

async function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = undefined;
  }
  while (queue.length > 0) {
    const batch = takeBatch();
    try {
      await api.post('/posts/seen', { postIds: batch });
    } catch {
      // lỗi mạng/đăng nhập hết hạn: bỏ qua lô này, không làm phiền người dùng; bài sẽ được ghi lại nếu họ xem lại
      batch.forEach((id) => recorded.delete(id));
      return;
    }
  }
}

/** Gửi nốt khi người dùng đóng tab/chuyển trang (fetch keepalive vẫn chạy sau khi trang đã đóng). */
function flushOnLeave() {
  if (queue.length === 0) return;
  const token = store.getState().auth.accessToken;
  if (!token) return;
  while (queue.length > 0) {
    const batch = takeBatch();
    try {
      void fetch(`${API_BASE_URL}/posts/seen`, {
        method: 'POST',
        keepalive: true,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ postIds: batch }),
      });
    } catch {
      // trang đang đóng, không còn gì để làm
    }
  }
}

function attachListeners() {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushOnLeave();
  });
  window.addEventListener('pagehide', flushOnLeave);
}

export function markPostSeen(postId: string) {
  if (!postId || !UUID_RE.test(postId) || recorded.has(postId)) return;
  if (!store.getState().auth.accessToken) return;
  recorded.add(postId);
  queue.push(postId);
  attachListeners();
  if (queue.length >= MAX_BATCH) {
    void flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(() => void flush(), FLUSH_DELAY_MS);
  }
}

/**
 * Trả về ref gắn vào phần tử bài viết; khi bài được xem đủ lâu thì tự ghi nhận "đã xem".
 * Bài cao hơn màn hình không bao giờ đạt 50% diện tích nên cũng tính khi phần thấy được ≥ nửa chiều cao cửa sổ.
 */
export function useSeenOnView<T extends Element>(postId: string, enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled || !postId || recorded.has(postId) || typeof IntersectionObserver === 'undefined') return;
    const el = ref.current;
    if (!el) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visibleEnough =
            entry.isIntersecting &&
            (entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= window.innerHeight * 0.5);
          if (visibleEnough) {
            if (timer === undefined) {
              timer = setTimeout(() => {
                markPostSeen(postId);
                observer.disconnect();
              }, SEEN_DWELL_MS);
            }
          } else if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
          }
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    observer.observe(el);
    return () => {
      if (timer !== undefined) clearTimeout(timer);
      observer.disconnect();
    };
  }, [postId, enabled]);

  return ref;
}
