import React, { useRef, useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Maximize2,
  Minimize2,
  Minus,
  Sparkles,
} from 'lucide-react';
import { useCall } from '../../context/CallContext';
import { UserAvatar } from '../common/UserAvatar';

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const ActiveCallModal: React.FC = () => {
  const {
    callState,
    remoteUser,
    mediaType,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    isScreenSharing,
    callDuration,
    isMinimized,
    endCall,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    setIsMinimized,
  } = useCall();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Attach local media stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoMuted, isScreenSharing]);

  // Attach remote media stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Toggle browser native fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  if (callState !== 'calling' && callState !== 'connected' && callState !== 'ended') {
    return null;
  }

  const isVideo = mediaType === 'VIDEO';
  const hasRemoteVideo = remoteStream && remoteStream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live');

  // 1. Minimized Floating PiP Mode (Allows navigating the social network while in call)
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-[100] w-72 bg-gray-900/95 border border-gray-700/60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-fade-in text-white transition-all duration-200">
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {isVideo && hasRemoteVideo ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center">
              <UserAvatar src={remoteUser?.avatar} alt={remoteUser?.name || 'User'} size="md" />
              <span className="text-xs font-semibold mt-1 truncate max-w-[150px]">{remoteUser?.name}</span>
            </div>
          )}

          {/* Top overlay in PiP */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[11px] bg-black/40 px-2 py-1 rounded-full backdrop-blur-md">
            <span className="text-green-400 font-mono font-medium">
              {callState === 'connected' ? formatDuration(callDuration) : 'Đang kết nối...'}
            </span>
            <button
              onClick={() => setIsMinimized(false)}
              className="hover:text-blue-400 transition cursor-pointer p-0.5"
              title="Mở rộng"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom control bar in PiP */}
        <div className="flex items-center justify-around px-3 py-2 bg-gray-800/80">
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-full transition cursor-pointer ${
              isAudioMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/60 text-white hover:bg-gray-600'
            }`}
          >
            {isAudioMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          {isVideo && (
            <button
              onClick={toggleVideo}
              className={`p-2 rounded-full transition cursor-pointer ${
                isVideoMuted ? 'bg-red-500/20 text-red-400' : 'bg-gray-700/60 text-white hover:bg-gray-600'
              }`}
            >
              {isVideoMuted ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={endCall}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition cursor-pointer"
            title="Kết thúc"
          >
            <PhoneOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Full Active Call Window
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-6 animate-fade-in">
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl h-[88vh] bg-gradient-to-b from-gray-900 to-gray-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-gray-800"
      >
        {/* Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
          <div className="flex items-center space-x-3">
            <UserAvatar src={remoteUser?.avatar} alt={remoteUser?.name || 'User'} size="sm" />
            <div>
              <h4 className="text-white font-bold text-sm md:text-base leading-tight">
                {remoteUser?.name}
              </h4>
              <p className="text-xs font-mono text-gray-300">
                {callState === 'calling' && 'Đang đổ chuông...'}
                {callState === 'connected' && (
                  <span className="text-green-400 font-semibold">{formatDuration(callDuration)}</span>
                )}
                {callState === 'ended' && <span className="text-red-400">Cuộc gọi kết thúc</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-white/80">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer backdrop-blur-md"
              title="Thu nhỏ thành cửa sổ nổi"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleFullscreen}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer backdrop-blur-md"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Video / Audio Canvas */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {isVideo && hasRemoteVideo ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (
            // Audio-only or Camera-off Avatar View
            <div className="flex flex-col items-center justify-center text-center p-6 select-none">
              <div className="relative mb-6">
                {callState === 'connected' && (
                  <div className="absolute -inset-4 rounded-full border-2 border-blue-500/30 animate-pulse" />
                )}
                <UserAvatar
                  src={remoteUser?.avatar}
                  alt={remoteUser?.name || 'User'}
                  size="xl"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-blue-500/50 shadow-2xl object-cover relative z-10"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                {remoteUser?.name}
              </h3>
              <p className="text-sm text-gray-400 font-medium">
                {callState === 'calling' && 'Đang đổ chuông...'}
                {callState === 'connected' && (
                  <span className="flex items-center space-x-1.5 text-blue-400">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Đang kết nối âm thanh bảo mật P2P</span>
                  </span>
                )}
                {callState === 'ended' && 'Cuộc gọi đã ngắt kết nối'}
              </p>
            </div>
          )}

          {/* Local Camera Preview (Picture-in-Picture) */}
          {isVideo && (
            <div className="absolute bottom-24 right-4 md:right-6 w-32 md:w-44 aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-900 z-20 backdrop-blur-md transition-all hover:scale-105">
              {!isVideoMuted && localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400 text-xs font-semibold">
                  <VideoOff className="w-5 h-5 mr-1" />
                  <span>Cam tắt</span>
                </div>
              )}
              {isScreenSharing && (
                <span className="absolute top-1 left-1 bg-blue-600 text-[9px] px-1.5 py-0.5 rounded font-bold text-white">
                  Màn hình
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Controls Dock */}
        <div className="relative z-20 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center space-x-3 md:space-x-5">
          {/* Mute Mic Toggle */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition duration-200 cursor-pointer shadow-lg ${
              isAudioMuted
                ? 'bg-red-500/30 text-red-400 border border-red-500/50 hover:bg-red-500/40'
                : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-md'
            }`}
            title={isAudioMuted ? 'Bật Mic' : 'Tắt Mic'}
          >
            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Video Toggle (Only for Video call) */}
          {isVideo && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition duration-200 cursor-pointer shadow-lg ${
                isVideoMuted
                  ? 'bg-red-500/30 text-red-400 border border-red-500/50 hover:bg-red-500/40'
                  : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-md'
              }`}
              title={isVideoMuted ? 'Bật Camera' : 'Tắt Camera'}
            >
              {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          {/* Screen Sharing Toggle */}
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition duration-200 cursor-pointer shadow-lg ${
              isScreenSharing
                ? 'bg-blue-600 text-white shadow-blue-500/50'
                : 'bg-white/15 text-white hover:bg-white/25 backdrop-blur-md'
            }`}
            title={isScreenSharing ? 'Dừng chia sẻ màn hình' : 'Chia sẻ màn hình'}
          >
            <Monitor className="w-6 h-6" />
          </button>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white transition duration-200 cursor-pointer shadow-xl shadow-red-600/40"
            title="Kết thúc cuộc gọi"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
