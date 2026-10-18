import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface LightboxItem {
  url: string;
  video: boolean;
}

interface MediaLightboxProps {
  items: LightboxItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const SWIPE_MIN_PX = 50;

/**
 * Trình xem ảnh/video toàn màn hình: mũi tên hoặc phím ← → để chuyển, Esc hoặc bấm nền để đóng,
 * vuốt ngang trên màn hình cảm ứng. Tải trước ảnh kế bên để chuyển tức thì.
 */
export const MediaLightbox: React.FC<MediaLightboxProps> = ({ items, index, onIndexChange, onClose }) => {
  const count = items.length;
  const item = items[index];
  // Theo URL (không phải boolean) để đổi ảnh không bị nháy ảnh mới ở độ mờ của ảnh cũ
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => {
      if (count < 2) return;
      onIndexChange((index + delta + count) % count);
    },
    [count, index, onIndexChange]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [go, onClose]);

  // Tải trước ảnh trước/sau
  useEffect(() => {
    if (count < 2) return;
    [(index + 1) % count, (index - 1 + count) % count].forEach((i) => {
      if (!items[i].video) new Image().src = items[i].url;
    });
  }, [index, count, items]);

  if (!item) return null;

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh và video"
      className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center"
      onClick={(e) => {
        e.stopPropagation(); // sự kiện React nổi bọt qua portal lên thẻ bài viết bên dưới
        onClose();
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(dx) >= SWIPE_MIN_PX) go(dx < 0 ? 1 : -1);
      }}
    >
      <button
        type="button"
        aria-label="Đóng"
        onClick={(e) => {
          stop(e);
          onClose();
        }}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition"
      >
        <X className="w-5 h-5" />
      </button>

      {count > 1 && (
        <div className="absolute top-5 left-5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold select-none">
          {index + 1} / {count}
        </div>
      )}

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Ảnh trước"
            onClick={(e) => {
              stop(e);
              go(-1);
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            aria-label="Ảnh sau"
            onClick={(e) => {
              stop(e);
              go(1);
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="max-w-[94vw] max-h-[92vh] flex items-center justify-center" onClick={stop}>
        {item.video ? (
          <video
            key={item.url}
            src={item.url}
            controls
            autoPlay
            playsInline
            className="max-w-[94vw] max-h-[92vh] bg-black rounded-lg outline-none"
          />
        ) : (
          failedUrl === item.url ? (
            <div className="px-6 py-10 rounded-lg bg-white/10 text-white/80 text-sm">Không tải được ảnh này</div>
          ) : (
            <img
              key={item.url}
              src={item.url}
              alt={`Ảnh ${index + 1}`}
              draggable={false}
              onLoad={() => setLoadedUrl(item.url)}
              onError={() => setFailedUrl(item.url)}
              className={`max-w-[94vw] max-h-[92vh] object-contain select-none rounded-lg transition-opacity duration-200 ${
                loadedUrl === item.url ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )
        )}
      </div>
    </div>,
    document.body
  );
};
