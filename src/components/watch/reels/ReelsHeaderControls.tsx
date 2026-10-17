import React from 'react';
import { X, Volume2, VolumeX } from 'lucide-react';

interface ReelsHeaderControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
}

export const ReelsHeaderControls: React.FC<ReelsHeaderControlsProps> = ({
  isMuted,
  onToggleMute,
  onClose,
}) => {
  return (
    <>
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer backdrop-blur-xs"
        title="Đóng (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Mute button */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleMute}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer backdrop-blur-xs"
          title={isMuted ? 'Bật âm thanh (M)' : 'Tắt âm thanh (M)'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>
    </>
  );
};
