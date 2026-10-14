import React from 'react';
import { Music, Disc3, X, Volume2, VolumeX } from 'lucide-react';
import { StoryAudioMeta } from '../../../services/storyService';

interface StoryMusicBadgeProps {
  audio: StoryAudioMeta;
  isPlaying?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export const StoryMusicBadge: React.FC<StoryMusicBadgeProps> = ({
  audio,
  isPlaying = true,
  isMuted = false,
  onToggleMute,
  onRemove,
  size = 'md',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all select-none ${
        size === 'sm' ? 'text-xs py-1 px-2.5' : 'text-xs'
      }`}
    >
      {/* Spinning Disc / Music Icon */}
      <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
        <Disc3
          className={`w-4 h-4 text-pink-400 ${
            isPlaying && !isMuted ? 'animate-[spin_4s_linear_infinite]' : ''
          }`}
        />
      </div>

      {/* Title & Artist */}
      <div className="flex flex-col min-w-0 max-w-[150px] leading-tight">
        <span className="font-bold truncate text-white drop-shadow-sm">{audio.title}</span>
        <span className="text-[10px] text-white/70 truncate">{audio.artist}</span>
      </div>

      {/* Animated Equalizer Bars */}
      {isPlaying && !isMuted ? (
        <div className="flex items-end gap-[2px] h-3 shrink-0 ml-1">
          <span className="w-[2px] h-3 bg-pink-400 rounded-full animate-pulse" />
          <span className="w-[2px] h-2 bg-pink-300 rounded-full animate-bounce" />
          <span className="w-[2px] h-3.5 bg-pink-400 rounded-full animate-pulse" />
        </div>
      ) : (
        <Music className="w-3.5 h-3.5 text-white/50 shrink-0 ml-1" />
      )}

      {/* Mute / Unmute Button if provided */}
      {onToggleMute && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Remove button if editing */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 -mr-1 rounded-full hover:bg-white/20 text-white/70 hover:text-red-400 transition"
          title="Xóa âm thanh"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
