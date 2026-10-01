import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Reply } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { LiveComment, LiveReaction } from '../../context/LiveStreamContext';
import { LiveStreamFloatingReactions } from '../post/post-card/live-stream/LiveStreamFloatingReactions';

interface HostStudioVideoAreaProps {
  stream: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  userAvatar?: string;
  userName?: string;
  comments: LiveComment[];
  reactions: LiveReaction[];
}

export const HostStudioVideoArea: React.FC<HostStudioVideoAreaProps> = ({
  stream,
  isCameraOn,
  isMicOn,
  userAvatar,
  userName,
  comments,
  reactions,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[HostStudioVideoArea] Autoplay play recovery:', err);
      });
    }
  }, [stream, isCameraOn]);

  return (
    <div className="relative w-full h-full min-h-[320px] sm:min-h-[460px] bg-black overflow-hidden flex items-center justify-center select-none rounded-xl border border-zinc-800">
      {/* 1. Host Camera Stream / Avatar fallback */}
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
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 p-6">
          <UserAvatar
            src={userAvatar}
            alt={userName || 'Host'}
            size="xl"
            className="w-24 h-24 border-2 border-red-500 ring-4 ring-red-500/20 shadow-2xl mb-3"
          />
          <span className="text-sm font-semibold text-gray-300">Camera của bạn đang tắt</span>
          <span className="text-xs text-gray-500 mt-0.5">
            {isMicOn ? 'Micro vẫn đang truyền giọng nói của bạn' : 'Micro và Camera đều đang tắt'}
          </span>
        </div>
      )}

      {/* 2. Floating Animated Reactions Overlay */}
      <LiveStreamFloatingReactions reactions={reactions} />

      {/* 3. Real-time Live Comments Speech Bubbles on Host Screen */}
      <div className="absolute inset-x-3 bottom-3 flex flex-col justify-end pointer-events-none z-30">
        <div className="space-y-1.5 max-w-xs sm:max-w-sm pointer-events-auto">
          {comments.slice(-4).map((c) => {
            const isHostComment =
              Boolean(userName && c.authorName === userName) ||
              c.authorName.includes('Admin') ||
              c.authorName.includes('Host');
            const targetReplyUser = c.replyToAuthor;

            return (
              <div
                key={c.id}
                className="backdrop-blur-md rounded-xl p-2 text-white shadow-lg animate-fadeIn text-xs bg-black/80 border border-white/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="font-bold text-blue-400 truncate max-w-[140px]">{c.authorName}</span>
                    {isHostComment && (
                      <span className="px-1.5 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[9px] font-bold rounded">
                        HOST
                      </span>
                    )}
                  </div>

                  {/* Reply Reference Pill */}
                  {targetReplyUser && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded w-fit my-1 border border-zinc-700/50">
                      <Reply className="w-2.5 h-2.5 text-blue-400" />
                      <span>
                        Đã trả lời <span className="text-blue-400 font-medium">@{targetReplyUser}</span>
                      </span>
                      {c.replyToContent && (
                        <span className="text-zinc-400 truncate max-w-[140px] italic">: "{c.replyToContent}"</span>
                      )}
                    </div>
                  )}

                  <p className="text-gray-100 break-words leading-tight mt-0.5">{c.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Top Device Status Badges */}
      <div className="absolute top-3 left-3 flex items-center space-x-2 z-30 pointer-events-none">
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
            isMicOn
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
              : 'bg-red-950/80 text-red-400 border-red-500/30'
          }`}
        >
          {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
          <span>{isMicOn ? 'Mic Bật' : 'Mic Tắt'}</span>
        </div>

        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
            isCameraOn
              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30'
              : 'bg-red-950/80 text-red-400 border-red-500/30'
          }`}
        >
          {isCameraOn ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
          <span>{isCameraOn ? 'Cam Bật' : 'Cam Tắt'}</span>
        </div>
      </div>
    </div>
  );
};
