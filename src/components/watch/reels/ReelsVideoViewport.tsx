import React, { RefObject, ReactNode } from 'react';
import { Heart, Play } from 'lucide-react';

interface ReelsVideoViewportProps {
  videoUrl: string;
  isPlaying: boolean;
  isMuted: boolean;
  showHeartAnim: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  onTogglePlay: () => void;
  onDoubleTap: (e: React.MouseEvent) => void;
  children: ReactNode;
}

export const ReelsVideoViewport: React.FC<ReelsVideoViewportProps> = ({
  videoUrl,
  isPlaying,
  isMuted,
  showHeartAnim,
  videoRef,
  onTogglePlay,
  onDoubleTap,
  children,
}) => {
  return (
    <div
      onClick={onTogglePlay}
      onDoubleClick={onDoubleTap}
      className="relative w-full max-w-[420px] h-[92vh] max-h-[840px] bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center cursor-pointer border border-white/10 group"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        muted={isMuted}
        playsInline
        autoPlay
        className="w-full h-full object-contain bg-black"
      />

      {/* Big Heart Animation on Double Click */}
      {showHeartAnim && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping">
          <Heart className="w-28 h-28 text-red-500 fill-red-500 drop-shadow-2xl opacity-90" />
        </div>
      )}

      {/* Play / Pause Overlay Icon */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30 z-20">
          <div className="p-4 rounded-full bg-black/60 text-white backdrop-blur-xs">
            <Play className="w-10 h-10 fill-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Embedded overlays (Info + Action buttons) */}
      {children}
    </div>
  );
};
