import React, { useRef, useEffect } from 'react';
import { Maximize2, Mic, MicOff, Video, VideoOff, Square, Users } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { LiveComment } from '../../context/LiveStreamContext';

interface HostStudioMiniWidgetProps {
  stream: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  viewerCount: number;
  formattedTime: string;
  userAvatar?: string;
  userName?: string;
  comments: LiveComment[];
  onExpand: () => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onEndBroadcast: () => void;
}

export const HostStudioMiniWidget: React.FC<HostStudioMiniWidgetProps> = ({
  stream,
  isCameraOn,
  isMicOn,
  viewerCount,
  formattedTime,
  userAvatar,
  userName,
  comments,
  onExpand,
  onToggleMic,
  onToggleCamera,
  onEndBroadcast,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    video.srcObject = stream;
    video.play().catch(() => {});
  }, [stream, isCameraOn]);

  const latestComment = comments[comments.length - 1];

  return (
    <div className="fixed bottom-5 right-5 z-50 w-72 sm:w-80 bg-zinc-900 border-2 border-red-500/60 rounded-2xl shadow-2xl overflow-hidden animate-fadeIn select-none">
      {/* 1. Mini Top Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] font-bold text-red-400">TRỰC TIẾP</span>
          <span className="text-[11px] font-mono text-gray-300 ml-1">{formattedTime}</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-[11px] text-blue-400 font-semibold bg-blue-950/60 px-1.5 py-0.5 rounded-md border border-blue-500/20">
            <Users className="w-3 h-3" />
            <span>{viewerCount}</span>
          </div>
          <button
            type="button"
            onClick={onExpand}
            title="Mở rộng Live Studio"
            className="p-1 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-md transition cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Mini Video Preview & Latest Comment Bubble */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        {isCameraOn && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-black"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-2">
            <UserAvatar src={userAvatar} alt={userName} size="md" className="w-12 h-12 mb-1 border border-red-500" />
            <span className="text-[10px] text-gray-400">Camera tắt</span>
          </div>
        )}

        {/* Latest comment bubble popup */}
        {latestComment && (
          <div className="absolute inset-x-2 bottom-2 bg-black/80 backdrop-blur-md rounded-lg p-1.5 text-white border border-white/10 shadow-md text-[11px] flex items-start space-x-1.5 animate-fadeIn">
            <span className="font-bold text-blue-400 shrink-0 truncate max-w-[70px]">{latestComment.authorName}:</span>
            <span className="text-gray-200 truncate">{latestComment.content}</span>
          </div>
        )}
      </div>

      {/* 3. Mini Quick Action Controls */}
      <div className="flex items-center justify-between p-2 bg-zinc-950">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={onToggleMic}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              isMicOn ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-600 text-white'
            }`}
          >
            {isMicOn ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={onToggleCamera}
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              isCameraOn ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-red-600 text-white'
            }`}
          >
            {isCameraOn ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <VideoOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={onExpand}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition cursor-pointer"
          >
            Studio
          </button>
          <button
            type="button"
            onClick={onEndBroadcast}
            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer flex items-center space-x-1"
          >
            <Square className="w-2.5 h-2.5 fill-current" />
            <span>Dừng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
