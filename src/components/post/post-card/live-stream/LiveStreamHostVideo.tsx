import React, { useRef, useEffect } from 'react';
import { UserAvatar } from '../../../common/UserAvatar';

interface LiveStreamHostVideoProps {
  stream: MediaStream | null;
  isCameraOn: boolean;
  userAvatar?: string;
  userName?: string;
}

export const LiveStreamHostVideo: React.FC<LiveStreamHostVideoProps> = ({
  stream,
  isCameraOn,
  userAvatar,
  userName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[LiveStreamHostVideo] Video play auto recovery:', err);
      });
    }
  }, [stream, isCameraOn]);

  if (!isCameraOn || !stream) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-6">
        <UserAvatar
          src={userAvatar}
          alt={userName || 'Host'}
          size="xl"
          className="w-24 h-24 border-2 border-red-500 ring-4 ring-red-500/20 shadow-2xl mb-3"
        />
        <span className="text-sm font-semibold text-gray-300">Camera đang tắt</span>
        <span className="text-xs text-gray-500 mt-0.5">Micro vẫn đang truyền âm thanh</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover mirror bg-black"
      style={{ transform: 'scaleX(-1)' }}
    />
  );
};
