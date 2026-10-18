import React, { useEffect, useRef, useState } from 'react';
import { PostMediaItem } from '../../../types';
import { MediaLightbox, LightboxItem } from '../MediaLightbox';
import { PlayBadge, VideoPlayer, isVideo } from './postMedia';
import { clampRatio, getKnownRatio, rememberRatio, DEFAULT_IMAGE_RATIO } from '../../../utils/mediaRatio';

/** Số ô tối đa hiển thị trong lưới; ảnh còn lại gộp vào nhãn "+N" ở ô cuối. */
const MAX_TILES = 5;

interface MediaCellProps {
  item: LightboxItem;
  index: number;
  onOpen: (index: number) => void;
  /** Số ảnh bị ẩn, hiện thành "+N" phủ lên ô này. */
  hiddenCount?: number;
  className?: string;
  /** Ô đứng một mình thì khung theo tỉ lệ ảnh thay vì lấp đầy ô lưới. */
  ratio?: number;
  /** Ghi nhớ tỉ lệ thật của ảnh sau khi tải xong. */
  remember?: boolean;
}

/** Một ô ảnh/video trong bài viết: giữ chỗ cố định, hiệu ứng tải, bấm để mở trình xem ảnh. */
const MediaCell: React.FC<MediaCellProps> = ({
  item,
  index,
  onOpen,
  hiddenCount = 0,
  className = '',
  ratio: initialRatio,
  remember,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [dynamicRatio, setDynamicRatio] = useState<number | undefined>(initialRatio);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const markLoaded = (img: HTMLImageElement) => {
    setLoaded(true);
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      const realRatio = clampRatio(img.naturalWidth / img.naturalHeight);
      setDynamicRatio(realRatio);
      if (remember) rememberRatio(item.url, img.naturalWidth, img.naturalHeight);
    }
  };

  useEffect(() => {
    setDynamicRatio(initialRatio);
  }, [initialRatio, item.url]);

  // Ảnh có sẵn trong cache của trình duyệt có thể đã tải xong trước khi React gắn onLoad
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) markLoaded(img);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.url]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={item.video ? `Xem video ${index + 1}` : `Xem ảnh ${index + 1}`}
      onClick={() => onOpen(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(index);
        }
      }}
      className={`w-full relative overflow-hidden bg-gray-100 dark:bg-[#2d2f31] cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1877f2] ${className}`}
      style={dynamicRatio ? { aspectRatio: dynamicRatio } : undefined}
    >
      {item.video ? (
        <>
          <video
            src={item.url.includes('#') ? item.url : `${item.url}#t=0.1`}
            preload="metadata"
            muted
            playsInline
            tabIndex={-1}
            onLoadedData={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`absolute inset-0 w-full h-full object-cover bg-black pointer-events-none transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!failed && hiddenCount === 0 && (
            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <PlayBadge className="group-hover:scale-105 transition-transform" />
            </span>
          )}
        </>
      ) : (
        <img
          ref={imgRef}
          src={item.url}
          loading="lazy"
          decoding="async"
          draggable={false}
          alt=""
          onLoad={(e) => markLoaded(e.currentTarget)}
          onError={() => setFailed(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-95 ${
            loaded && !failed ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Đang tải: nhấp nháy tại chỗ; lỗi: giữ nguyên khung để không xô lệch bài viết */}
      {!loaded && !failed && <span className="absolute inset-0 animate-pulse bg-gray-300/70 dark:bg-[#4a4b4d]/70" />}
      {failed && (
        <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[11px] text-gray-500 dark:text-[#b0b3b8]">
          {item.video ? 'Không tải được video' : 'Không tải được ảnh'}
        </span>
      )}

      {hiddenCount > 0 && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white text-3xl font-semibold select-none">
          +{hiddenCount}
        </span>
      )}
    </div>
  );
};

interface PostMediaGalleryProps {
  urls: string[];
  mediaList?: PostMediaItem[];
  /** Giới hạn chiều cao ảnh/video đơn (dùng cho bài gốc trong bài chia sẻ). */
  compact?: boolean;
}

/**
 * Hiển thị ảnh/video của bài viết theo bố cục kiểu Facebook:
 * 1 ảnh theo tỉ lệ thật (giới hạn 4:5 đến 16:9) · 2 ảnh cạnh nhau · 3 ảnh (1 lớn + 2 nhỏ) · 4 ảnh lưới 2×2 ·
 * từ 5 ảnh: 2 lớn + 3 nhỏ, ô cuối có nhãn "+N". Mọi khung đều có tỉ lệ cố định nên không xô lệch khi tải ảnh.
 * Bấm vào ảnh/video mở trình xem toàn màn hình.
 */
export const PostMediaGallery: React.FC<PostMediaGalleryProps> = ({ urls, mediaList, compact = false }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!urls || urls.length === 0) return null;

  const items: LightboxItem[] = urls.map((url, i) => ({ url, video: isVideo(url, mediaList?.[i]?.mediaType) }));
  const count = items.length;
  const open = (i: number) => setLightboxIndex(i);

  let body: React.ReactNode;
  if (count === 1) {
    const single = items[0];
    if (single.video) {
      body = (
        <div className={compact ? 'w-full max-h-[480px] overflow-hidden' : 'w-full'}>
          <VideoPlayer src={single.url} reserveSpace />
        </div>
      );
    } else {
      const ratio = clampRatio(getKnownRatio(single.url) ?? DEFAULT_IMAGE_RATIO);
      const cell = (
        <MediaCell
          item={single}
          index={0}
          onOpen={open}
          ratio={ratio}
          remember
          className="w-full"
        />
      );
      body = compact ? (
        <div className="w-full max-h-[520px] overflow-hidden">
          {cell}
        </div>
      ) : (
        cell
      );
    }
  } else {
    const tiles = items.slice(0, MAX_TILES);
    const hidden = count - MAX_TILES;
    let gridClass: string;
    let cellClass = (_i: number) => '';
    if (count === 2) {
      gridClass = 'grid-cols-2 aspect-[2/1]';
    } else if (count === 3) {
      gridClass = 'grid-cols-2 grid-rows-2 aspect-[4/3]';
      cellClass = (i) => (i === 0 ? 'row-span-2' : '');
    } else if (count === 4) {
      gridClass = 'grid-cols-2 grid-rows-2 aspect-[4/3]';
    } else {
      gridClass = 'grid-cols-6 grid-rows-[3fr_2fr] aspect-[4/3]';
      cellClass = (i) => (i < 2 ? 'col-span-3' : 'col-span-2');
    }
    body = (
      <div className={`grid gap-0.5 w-full ${gridClass}`}>
        {tiles.map((item, i) => (
          <MediaCell
            key={`${item.url}-${i}`}
            item={item}
            index={i}
            onOpen={open}
            className={`${cellClass(i)} h-full`}
            hiddenCount={i === MAX_TILES - 1 && hidden > 0 ? hidden : 0}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      {body}
      {lightboxIndex !== null && (
        <MediaLightbox
          items={items}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
};
