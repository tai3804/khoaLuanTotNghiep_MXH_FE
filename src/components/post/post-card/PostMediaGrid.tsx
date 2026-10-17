import React from 'react';
import { Play } from 'lucide-react';
import { isVideo, VideoPlayer } from './PostCardContent';

interface PostMediaGridProps {
  mediaUrls: string[];
  mediaList?: Array<{ fileUrl: string; mediaType?: string }>;
  onMediaClick: (index: number) => void;
}

export const PostMediaGrid: React.FC<PostMediaGridProps> = ({
  mediaUrls,
  mediaList,
  onMediaClick,
}) => {
  if (!mediaUrls || mediaUrls.length === 0) return null;

  const count = mediaUrls.length;

  // Single media item
  if (count === 1) {
    const url = mediaUrls[0];
    const itemMediaType = mediaList?.[0]?.mediaType;
    if (isVideo(url, itemMediaType)) {
      return (
        <div className="w-full bg-black/5 dark:bg-black/40 overflow-hidden">
          <VideoPlayer src={url} />
        </div>
      );
    }
    return (
      <div className="w-full bg-black/5 dark:bg-black/40 overflow-hidden">
        <img
          src={url}
          loading="lazy"
          decoding="async"
          alt="Post media"
          className="w-full max-h-[560px] object-cover hover:opacity-95 transition cursor-pointer"
          onClick={() => onMediaClick(0)}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Helper to render media cell in grid
  const renderCell = (
    url: string,
    index: number,
    className: string,
    overlayContent?: React.ReactNode
  ) => {
    const itemMediaType = mediaList?.[index]?.mediaType;
    const isVid = isVideo(url, itemMediaType);

    return (
      <div
        key={index}
        onClick={() => onMediaClick(index)}
        className={`relative overflow-hidden group cursor-pointer bg-black/20 ${className}`}
      >
        {isVid ? (
          <div className="w-full h-full relative flex items-center justify-center bg-black">
            <video
              src={url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              muted
              playsInline
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
              <div className="p-3 rounded-full bg-black/60 text-white backdrop-blur-xs group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              </div>
            </div>
          </div>
        ) : (
          <img
            src={url}
            loading="lazy"
            decoding="async"
            alt={`Media ${index}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        )}

        {/* Hover overlay shimmer */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

        {/* Additional Overlay (e.g. +N photos) */}
        {overlayContent}
      </div>
    );
  };

  // 2 items: 50% - 50% split
  if (count === 2) {
    return (
      <div className="w-full h-72 sm:h-80 md:h-96 grid grid-cols-2 gap-1 bg-black/5 dark:bg-black/40 overflow-hidden">
        {renderCell(mediaUrls[0], 0, 'h-full')}
        {renderCell(mediaUrls[1], 1, 'h-full')}
      </div>
    );
  }

  // 3 items: 1 large left (50%), 2 stacked right (50% each vertically)
  if (count === 3) {
    return (
      <div className="w-full h-80 sm:h-96 grid grid-cols-2 gap-1 bg-black/5 dark:bg-black/40 overflow-hidden">
        {renderCell(mediaUrls[0], 0, 'h-full')}
        <div className="grid grid-rows-2 gap-1 h-full">
          {renderCell(mediaUrls[1], 1, 'h-full')}
          {renderCell(mediaUrls[2], 2, 'h-full')}
        </div>
      </div>
    );
  }

  // 4 items: Balanced 2x2 grid
  if (count === 4) {
    return (
      <div className="w-full h-80 sm:h-96 grid grid-cols-2 grid-rows-2 gap-1 bg-black/5 dark:bg-black/40 overflow-hidden">
        {renderCell(mediaUrls[0], 0, 'h-full')}
        {renderCell(mediaUrls[1], 1, 'h-full')}
        {renderCell(mediaUrls[2], 2, 'h-full')}
        {renderCell(mediaUrls[3], 3, 'h-full')}
      </div>
    );
  }

  // 5+ items: 1 large on top/left, or 4 visible cells with 4th having +N overlay
  const remainingCount = count - 4;
  return (
    <div className="w-full h-80 sm:h-96 grid grid-cols-2 grid-rows-2 gap-1 bg-black/5 dark:bg-black/40 overflow-hidden">
      {renderCell(mediaUrls[0], 0, 'h-full')}
      {renderCell(mediaUrls[1], 1, 'h-full')}
      {renderCell(mediaUrls[2], 2, 'h-full')}
      {renderCell(
        mediaUrls[3],
        3,
        'h-full',
        <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex flex-col items-center justify-center text-white select-none">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            +{remainingCount}
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-white/90">
            ảnh khác
          </span>
        </div>
      )}
    </div>
  );
};
