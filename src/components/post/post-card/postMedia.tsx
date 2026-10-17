import React, { useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { getKnownRatio, rememberRatio, clampRatio, DEFAULT_VIDEO_RATIO } from '../../../utils/mediaRatio';

export const isVideo = (url: string, mediaType?: string) => {
  if (mediaType && (mediaType.toUpperCase() === 'VIDEO' || mediaType.toLowerCase() === 'video')) return true;
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  if (url.match(/\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i) !== null) return true;
  if (url.includes('/video/') || url.includes('format=mp4') || url.includes('mediaType=VIDEO')) return true;
  return false;
};

/** Nút phát tròn phủ lên video đang dừng / ảnh đại diện video. */
export const PlayBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span
    aria-hidden="true"
    className={`flex items-center justify-center w-14 h-14 rounded-full bg-black/55 text-white shadow-lg backdrop-blur-[2px] ${className}`}
  >
    <Play className="w-6 h-6 translate-x-0.5" fill="currentColor" />
  </span>
);

interface VideoPlayerProps {
  src: string;
  className?: string;
  autoPlayOnScroll?: boolean;
  /** Giữ chỗ theo khung tỉ lệ cố định (rộng / cao) để video tải xong không làm bài bên dưới xô lệch. */
  reserveSpace?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className,
  autoPlayOnScroll = true,
  reserveSpace = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [paused, setPaused] = useState(true);
  const frameRatio = reserveSpace ? clampRatio(getKnownRatio(src) ?? DEFAULT_VIDEO_RATIO) : undefined;

  useEffect(() => {
    if (!autoPlayOnScroll) return;
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => {
      observer.unobserve(video);
    };
  }, [autoPlayOnScroll]);

  if (hasError) {
    return (
      <div
        className="w-full h-48 bg-gray-900 flex flex-col items-center justify-center text-gray-400 text-xs p-4 text-center"
        style={frameRatio ? { height: 'auto', aspectRatio: frameRatio } : undefined}
      >
        <span>Không thể phát video</span>
        <a href={src} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline mt-1 text-[11px]">
          Mở liên kết video
        </a>
      </div>
    );
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = false; // người dùng chủ động bấm phát nên bật tiếng như Facebook
    video.play().catch(() => {});
  };

  return (
    <div
      className="relative w-full bg-black flex items-center justify-center overflow-hidden"
      style={frameRatio ? { aspectRatio: frameRatio } : undefined}
    >
      <video
        ref={videoRef}
        src={src}
        controls
        loop
        muted
        playsInline
        preload="metadata"
        onError={() => setHasError(true)}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        onLoadedMetadata={(e) => rememberRatio(src, e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
        className={
          reserveSpace
            ? 'w-full h-full object-contain bg-black'
            : className || 'w-full max-h-[550px] object-contain bg-black'
        }
        onClick={(e) => e.stopPropagation()}
      />
      {paused && (
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label="Phát video"
          className="absolute inset-0 m-auto w-14 h-14 rounded-full cursor-pointer hover:scale-105 transition-transform"
        >
          <PlayBadge />
        </button>
      )}
    </div>
  );
};
