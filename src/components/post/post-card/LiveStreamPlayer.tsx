import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Radio, Eye, Video, VideoOff, Mic, MicOff, Square, Send, Heart, Flame, ThumbsUp, Laugh, Sparkles, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Post } from '../../../types';
import { useAuth } from '../../../context/AuthContext';
import { useLiveStream } from '../../../context/LiveStreamContext';
import { UserAvatar } from '../../common/UserAvatar';

interface LiveStreamPlayerProps {
  post: Post;
  setShowCommentModal?: (val: boolean) => void;
}

export const LiveStreamPlayer: React.FC<LiveStreamPlayerProps> = ({ post, setShowCommentModal }) => {
  const { user } = useAuth();
  const {
    activeBroadcast,
    liveCommentsMap,
    liveReactionsMap,
    stopBroadcast,
    toggleCamera,
    toggleMic,
    sendLiveComment,
    sendLiveReaction,
    isPostLive,
  } = useLiveStream();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const isLive = isPostLive(post);
  const isHost = activeBroadcast.isBroadcasting && (activeBroadcast.postId === post.id || user?.id === post.userId);

  const comments = liveCommentsMap[post.id] || [];
  const reactions = liveReactionsMap[post.id] || [];

  // Elapsed time counter
  useEffect(() => {
    if (!isLive) return;
    const start = activeBroadcast.startedAt || Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive, activeBroadcast.startedAt]);

  // Format seconds to mm:ss or hh:mm:ss
  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Connect broadcaster stream to video element
  useEffect(() => {
    if (isHost && activeBroadcast.stream && videoRef.current) {
      videoRef.current.srcObject = activeBroadcast.stream;
    }
  }, [isHost, activeBroadcast.stream]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    sendLiveComment(post.id, commentInput);
    setCommentInput('');
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Clean title display (remove prefix tags if any)
  const cleanTitle = useMemo(() => {
    const lines = post.content.split('\n');
    const firstLine = lines[0] || '';
    return firstLine.replace(/^🔴\s*\[ĐANG PHÁT TRỰC TIẾP\]\s*/i, '').trim() || 'Phát trực tiếp';
  }, [post.content]);

  if (!isLive) {
    return (
      <div className="w-full bg-linear-to-b from-gray-900 to-black text-white p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3 rounded-lg my-1 border border-gray-800">
        <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500/30 flex items-center justify-center text-red-500">
          <Radio className="w-7 h-7 opacity-75" />
        </div>
        <div>
          <h4 className="font-bold text-base text-gray-200">Buổi phát trực tiếp đã kết thúc</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-md">
            Chủ phòng đã dừng phát sóng. Bạn vẫn có thể thích và thảo luận ở phần bình luận bên dưới.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs text-gray-500 pt-1">
          <span>Tiêu đề: <strong className="text-gray-300">{cleanTitle}</strong></span>
          <span>•</span>
          <span>Người phát: <strong className="text-gray-300">{post.authorName}</strong></span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video sm:max-h-[480px] bg-black overflow-hidden flex items-center justify-center group select-none border-y border-gray-800"
    >
      {/* Video Content */}
      {isHost && activeBroadcast.stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-linear-to-tr from-slate-950 via-zinc-900 to-neutral-950">
          {/* Animated Waveform / Ambient Live Pulse */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.4)_0,transparent_70%)] animate-pulse" />

          <div className="relative z-10 flex flex-col items-center space-y-3">
            <div className="relative">
              <UserAvatar src={post.authorAvatar} alt={post.authorName} size="xl" className="w-20 h-20 border-2 border-red-500 ring-4 ring-red-500/20 shadow-xl" />
              <div className="absolute -bottom-1 -right-1 p-1.5 bg-red-600 text-white rounded-full shadow-lg">
                <Radio className="w-4 h-4 animate-ping" />
              </div>
            </div>
            <div className="text-center px-4">
              <span className="text-xs font-semibold text-red-400 uppercase tracking-wider block">Đang phát trực tiếp</span>
              <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 max-w-lg truncate">{cleanTitle}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{post.authorName} đang trò chuyện trực tiếp</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Animated Reactions */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%` }}
            className="absolute bottom-12 text-2xl sm:text-3xl animate-floatUp opacity-90 drop-shadow-lg"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top Header Overlay */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-30 pointer-events-auto">
        <div className="flex items-center space-x-2">
          {/* Live Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-black tracking-wider shadow-lg">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>TRỰC TIẾP</span>
          </div>

          {/* Duration */}
          <div className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-md text-xs font-mono font-semibold shadow-md">
            {formattedTime}
          </div>

          {/* Viewers count */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-md text-xs font-semibold shadow-md">
            <Eye className="w-3.5 h-3.5 text-red-400" />
            <span>{isHost ? activeBroadcast.viewerCount : Math.floor(activeBroadcast.viewerCount * 0.8) + 15} người xem</span>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white transition cursor-pointer backdrop-blur-sm"
            title="Toàn màn hình"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Host Controls Banner (Only visible to the broadcaster) */}
      {isHost && (
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between bg-black/70 backdrop-blur-md p-2.5 rounded-xl z-30 border border-white/10 pointer-events-auto">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={toggleMic}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                activeBroadcast.isMicOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white'
              }`}
            >
              {activeBroadcast.isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{activeBroadcast.isMicOn ? 'Micro: Bật' : 'Micro: Tắt'}</span>
            </button>

            <button
              type="button"
              onClick={toggleCamera}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                activeBroadcast.isCameraOn ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-red-600 text-white'
              }`}
            >
              {activeBroadcast.isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{activeBroadcast.isCameraOn ? 'Camera: Bật' : 'Camera: Tắt'}</span>
            </button>
          </div>

          <div>
            {!showEndConfirm ? (
              <button
                type="button"
                onClick={() => setShowEndConfirm(true)}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer shadow-md"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Kết thúc Live</span>
              </button>
            ) : (
              <div className="flex items-center space-x-1.5 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => setShowEndConfirm(false)}
                  className="px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => stopBroadcast(post.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Dừng phát sóng ngay
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Viewer Live Comments & Reactions Overlay (When not host) */}
      {!isHost && (
        <div className="absolute inset-x-3 bottom-3 flex flex-col justify-end pointer-events-none z-30">
          {/* Chat Stream Bubbles (Max 3 visible) */}
          <div className="space-y-1.5 mb-2 max-w-xs sm:max-w-sm pointer-events-auto">
            {comments.slice(-3).map((c) => (
              <div
                key={c.id}
                className="bg-black/60 backdrop-blur-md rounded-xl p-2 text-white border border-white/10 shadow-lg animate-fadeIn text-xs flex items-start space-x-2"
              >
                <span className="font-bold text-blue-400 shrink-0">{c.authorName}:</span>
                <span className="text-gray-100 break-words leading-tight">{c.content}</span>
              </div>
            ))}
          </div>

          {/* Viewer Reaction bar & inline comment */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            <form onSubmit={handleSendComment} className="flex-1 flex items-center bg-black/60 backdrop-blur-md rounded-full px-3 py-1 border border-white/20">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Bình luận trực tiếp..."
                className="flex-1 bg-transparent text-white text-xs placeholder-gray-400 outline-none pr-2"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="text-blue-400 hover:text-blue-300 disabled:opacity-30 cursor-pointer transition p-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Reaction Emojis */}
            <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/20">
              {['❤️', '👍', '🔥', '😂', '🎉'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => sendLiveReaction(post.id, emoji)}
                  className="w-7 h-7 flex items-center justify-center hover:scale-125 transition-transform text-sm cursor-pointer rounded-full active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
