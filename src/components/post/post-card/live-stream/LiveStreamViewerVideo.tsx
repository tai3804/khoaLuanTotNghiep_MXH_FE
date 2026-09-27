import React, { useRef, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Loader2 } from 'lucide-react';
import { UserAvatar } from '../../../common/UserAvatar';

interface LiveStreamViewerVideoProps {
  remoteStream: MediaStream | null;
  isMuted: boolean;
  isConnected: boolean;
  hostAvatar?: string;
  hostName: string;
  cleanTitle: string;
  onToggleMute: () => void;
}

export const LiveStreamViewerVideo: React.FC<LiveStreamViewerVideoProps> = ({
  remoteStream,
  isMuted,
  isConnected,
  hostAvatar,
  hostName,
  cleanTitle,
  onToggleMute,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !remoteStream) return;

    video.srcObject = remoteStream;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[LiveStreamViewerVideo] Autoplay policy prevented unmuted play:', err);
      });
    }
  }, [remoteStream]);

  if (!remoteStream || !isConnected) {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-linear-to-tr from-slate-950 via-zinc-900 to-neutral-950 p-6">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.4)_0,transparent_70%)] animate-pulse" />
        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div className="relative">
            <UserAvatar
              src={hostAvatar}
              alt={hostName}
              size="xl"
              className="w-20 h-20 border-2 border-red-500 ring-4 ring-red-500/20 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-red-600 text-white rounded-full shadow-lg">
              <Radio className="w-4 h-4 animate-ping" />
            </div>
          </div>
          <div className="text-center px-4">
            <div className="flex items-center justify-center space-x-1.5 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Đang kết nối luồng phát trực tiếp...</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white max-w-lg truncate">{cleanTitle}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{hostName} đang phát sóng</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className="w-full h-full object-cover bg-black"
      />

      {/* Floating Audio Unmute/Mute Toggle */}
      <div className="absolute top-14 left-3 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={onToggleMute}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg text-xs font-medium backdrop-blur-md transition cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          <span>{isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}</span>
        </button>
      </div>
    </div>
  );
};
