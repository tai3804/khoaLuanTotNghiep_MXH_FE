import { useEffect, useRef, useState } from 'react';
import { LiveComment } from '../../../../context/LiveStreamContext';

/** Bình luận nổi trên video hiện trong bao lâu (ms) rồi mờ dần và biến mất. */
export const LIVE_BUBBLE_TTL_MS = 8000;
const FADE_MS = 700;

/**
 * Bình luận nổi trên khung video kiểu Facebook/TikTok Live: mỗi bình luận hiện ~8 giây kể từ lúc xuất hiện rồi tự ẩn.
 * Danh sách đầy đủ vẫn nằm ở khung trò chuyện, ở đây chỉ là lớp phủ lên video.
 */
export const useFadingComments = (comments: LiveComment[], max = 4, ttlMs = LIVE_BUBBLE_TTL_MS) => {
  const firstSeen = useRef(new Map<string, number>());
  const [now, setNow] = useState(() => Date.now());

  const stamp = Date.now();
  for (const c of comments) {
    if (!firstSeen.current.has(c.id)) firstSeen.current.set(c.id, stamp);
  }

  const alive = comments
    .map((c) => ({ comment: c, age: now - (firstSeen.current.get(c.id) ?? now) }))
    .filter((x) => x.age < ttlMs)
    .slice(-max);

  const hasAlive = alive.length > 0;
  useEffect(() => {
    if (!hasAlive) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [hasAlive]);

  // Có bình luận mới thì cập nhật đồng hồ ngay để nó hiện tức thì
  useEffect(() => {
    setNow(Date.now());
  }, [comments.length]);

  return alive.map(({ comment, age }) => ({ comment, fading: age > ttlMs - FADE_MS }));
};
