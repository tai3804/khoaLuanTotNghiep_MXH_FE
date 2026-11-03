import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Radio, Eye, Users, Settings2, Share2, Maximize, Minimize2, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLiveStream } from '../context/LiveStreamContext';
import { postService } from '../services/api';
import { callService } from '../services/callService';
import { liveStreamWebSocketService } from '../services/liveStreamWebSocket';
import { Post } from '../types';
import { UserAvatar } from '../components/common/UserAvatar';
import { HostStudioVideoArea } from '../components/live-studio/HostStudioVideoArea';
import { HostStudioChatPanel } from '../components/live-studio/HostStudioChatPanel';
import { HostStudioControlsBar } from '../components/live-studio/HostStudioControlsBar';
import { LiveStreamViewerVideo } from '../components/post/post-card/live-stream/LiveStreamViewerVideo';
import { LiveStreamFloatingReactions } from '../components/post/post-card/live-stream/LiveStreamFloatingReactions';
import { LiveStreamEndedView } from '../components/post/post-card/live-stream/LiveStreamEndedView';
import { useLiveViewerStream } from '../components/post/post-card/live-stream/useLiveViewerStream';
import { HostStudioChatInput } from '../components/live-studio/chat/HostStudioChatInput';
import { HostStudioPinnedComment } from '../components/live-studio/chat/HostStudioPinnedComment';
import { formatElapsed } from '../utils/timeAgo';

export const LiveStreamPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const {
    activeBroadcast,
    liveCommentsMap,
    liveReactionsMap,
    stopBroadcast,
    toggleCamera,
    toggleMic,
    sendLiveComment,
    sendLiveReaction,
    loadPostComments,
    setIsStudioMinimized,
    setIsStudioOpen,
  } = useLiveStream();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewerCommentInput, setViewerCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pinnedComment, setPinnedComment] = useState<any | null>(null);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isHost = Boolean(
    activeBroadcast.isBroadcasting &&
    (activeBroadcast.postId === postId || user?.id === post?.userId)
  );

  // Load post details
  useEffect(() => {
    if (!postId) return;
    let active = true;

    postService
      .getPostById(postId)
      .then((p: Post | null) => {
        if (active) {
          setPost(p);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        console.warn('[LiveStreamPage] Failed to fetch post:', err);
        if (active) setLoading(false);
      });

    loadPostComments(postId);

    return () => {
      active = false;
    };
  }, [postId, loadPostComments]);

  // Subscribe to WebSocket room
  useEffect(() => {
    if (!postId) return;
    const unsub = liveStreamWebSocketService.subscribeRoom(postId);
    return () => {
      unsub();
    };
  }, [postId]);

  // Hook for Viewer Media Stream
  const viewerStream = useLiveViewerStream(
    !isHost && postId ? postId : '',
    post?.userId,
    post?.content
  );

  const comments = useMemo(() => {
    return postId ? liveCommentsMap[postId] || [] : [];
  }, [postId, liveCommentsMap]);

  const reactions = useMemo(() => {
    return postId ? liveReactionsMap[postId] || [] : [];
  }, [postId, liveReactionsMap]);

  // Elapsed timer
  useEffect(() => {
    const start = isHost
      ? activeBroadcast.startedAt || Date.now()
      : post?.createdAtRaw
      ? new Date(post.createdAtRaw).getTime()
      : Date.now();

    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [isHost, activeBroadcast.startedAt, post?.createdAtRaw]);

  const formattedTime = useMemo(() => formatElapsed(elapsedSeconds), [elapsedSeconds]);

  // Clean stream title
  const cleanTitle = useMemo(() => {
    const raw = isHost ? activeBroadcast.title : post?.content || '';
    const firstLine = raw.split('\n')[0] || '';
    return (
      firstLine
        .replace(/^🔴\s*\[ĐANG PHÁT TRỰC TIẾP\]\s*/i, '')
        .replace(/^(?:⏹\s*)?\[ĐÃ KẾT THÚC\]\s*/i, '')
        .trim() || 'Phát trực tiếp'
    );
  }, [isHost, activeBroadcast.title, post?.content]);

  const effectiveViewerCount = isHost ? activeBroadcast.viewerCount : viewerStream.viewerCount;

  // Auto scroll chat to bottom
  useEffect(() => {
    if (comments.length > 0 && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  const handleToggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSendViewerComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || !viewerCommentInput.trim()) return;
    sendLiveComment(
      postId,
      viewerCommentInput,
      replyingTo ? { authorName: replyingTo.authorName, content: replyingTo.content } : undefined
    );
    setViewerCommentInput('');
    setReplyingTo(null);
  };

  const handleEndBroadcast = () => {
    if (postId) {
      stopBroadcast(postId);
      navigate('/');
    }
  };

  const handleMinimizeStudio = () => {
    setIsStudioOpen(true);
    setIsStudioMinimized(true);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm text-zinc-400">Đang tải phòng phát trực tiếp...</p>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: HOST STUDIO PRODUCER DASHBOARD PAGE
  // =========================================================================
  if (isHost) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col text-white select-none">
        {/* Top Producer Navigation Bar */}
        <header className="h-14 px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center space-x-3 overflow-hidden">
            <button
              type="button"
              onClick={handleMinimizeStudio}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer flex items-center space-x-1"
              title={t('live.backToFeed', 'Về bảng tin (Thu nhỏ)')}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 bg-red-600/20 border border-red-500/40 text-red-400 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>LIVE STUDIO</span>
            </div>

            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
              {cleanTitle}
            </h1>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Timer Badge */}
            <div className="flex items-center space-x-1.5 bg-black/60 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 border border-white/10">
              <span className="text-red-400 font-bold">⏱</span>
              <span>{formattedTime}</span>
            </div>

            {/* Viewer Count Badge */}
            <div className="flex items-center space-x-1.5 bg-blue-600/20 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-400 border border-blue-500/30">
              <Users className="w-4 h-4" />
              <span>{activeBroadcast.viewerCount} {t('live.viewerCount', 'người xem')}</span>
            </div>

            {/* Minimize / Floating button */}
            <button
              type="button"
              onClick={handleMinimizeStudio}
              className="p-2 text-gray-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer hidden sm:flex items-center space-x-1"
              title="Thu nhỏ thành cửa sổ nổi để lướt bảng tin"
            >
              <Minimize2 className="w-4 h-4" />
              <span className="text-xs font-medium">Thu nhỏ</span>
            </button>
          </div>
        </header>

        {/* Studio Main Workspace (Left Video 70%, Right Panel 30%) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 bg-zinc-950">
          {/* Main Stage Video Canvas */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-0">
            <HostStudioVideoArea
              stream={activeBroadcast.stream}
              isCameraOn={activeBroadcast.isCameraOn}
              isMicOn={activeBroadcast.isMicOn}
              userAvatar={user?.avatar}
              userName={user?.fullName || user?.username}
              comments={comments}
              reactions={reactions}
            />
          </div>

          {/* Real-time Moderation & Chat Panel */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-0">
            <HostStudioChatPanel
              comments={comments}
              commentInput={viewerCommentInput}
              replyingTo={replyingTo}
              chatBottomRef={chatBottomRef}
              inputRef={inputRef}
              postId={postId}
              hostName={user?.fullName || user?.username}
              hostAvatar={user?.avatar}
              viewerCount={activeBroadcast.viewerCount}
              onCommentInputChange={setViewerCommentInput}
              onStartReply={setReplyingTo}
              onCancelReply={() => setReplyingTo(null)}
              onSendComment={handleSendViewerComment}
              onSendReaction={(emoji) => {
                if (postId) sendLiveReaction(postId, emoji);
              }}
            />
          </div>
        </div>

        {/* Bottom Producer Controls Bar */}
        <HostStudioControlsBar
          isMicOn={activeBroadcast.isMicOn}
          isCameraOn={activeBroadcast.isCameraOn}
          showEndConfirm={showEndConfirm}
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onShowEndConfirm={setShowEndConfirm}
          onEndBroadcast={handleEndBroadcast}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: VIEWER THEATER / CINEMA LIVE WATCH PAGE
  // =========================================================================
  const isPostLiveActive = Boolean(post?.isLive || (post?.content && post.content.includes('[ĐANG PHÁT TRỰC TIẾP]')));
  const isLive = isPostLiveActive && !viewerStream.hasEnded;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-white select-none">
      {/* Top Navigation Bar */}
      <header className="h-14 px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center space-x-3 overflow-hidden">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer flex items-center space-x-1"
            title={t('live.backToFeed', 'Về bảng tin')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-semibold hidden sm:inline">{t('live.backToFeed', 'Bảng tin')}</span>
          </button>

          <div className="flex items-center space-x-2 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-black tracking-wider animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>TRỰC TIẾP</span>
          </div>

          <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md">
            {cleanTitle}
          </h1>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="flex items-center space-x-1.5 bg-black/60 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 border border-white/10">
            <span className="text-red-400 font-bold">⏱</span>
            <span>{formattedTime}</span>
          </div>

          <div className="flex items-center space-x-1.5 bg-black/60 px-3 py-1.5 rounded-lg text-xs font-semibold text-white border border-white/10">
            <Eye className="w-3.5 h-3.5 text-red-400" />
            <span>{effectiveViewerCount} {t('live.viewerCount', 'người xem')}</span>
          </div>
        </div>
      </header>

      {/* Main Content: Left Theater Stage (70%), Right Live Chat (30%) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 bg-zinc-950">
        {/* Left: Live Video Canvas & Host Info */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-0 space-y-3">
          {/* Video Player Box */}
          <div
            ref={videoContainerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-zinc-800 shadow-2xl group"
          >
            {viewerStream.isBanned ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="w-14 h-14 rounded-full bg-red-950 border border-red-500/40 flex items-center justify-center mb-3">
                  <Ban className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-base font-bold text-red-400">
                  {t('live.bannedMessage', 'Bạn đã bị chủ phòng cấm khỏi buổi phát trực tiếp này.')}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Bạn không thể tiếp tục xem luồng hoặc tham gia trò chuyện trong phòng này.
                </p>
              </div>
            ) : viewerStream.isConnecting ? (
              <div className="flex flex-col items-center justify-center text-center p-6 select-none">
                <div className="relative flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-full border-2 border-red-500/30 border-t-red-500 animate-spin" />
                  <Radio className="absolute w-5 h-5 text-red-500 animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-zinc-200">
                  {t('live.connecting', 'Đang kết nối vào phòng phát trực tiếp...')}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {t('live.connectingSub', 'Vui lòng chờ trong giây lát')}
                </p>
              </div>
            ) : !isLive ? (
              <LiveStreamEndedView cleanTitle={cleanTitle} authorName={post?.authorName || ''} />
            ) : (
              <LiveStreamViewerVideo
                remoteStream={viewerStream.remoteStream}
                isMuted={viewerStream.isMuted}
                isConnected={viewerStream.isConnected}
                hostAvatar={post?.authorAvatar}
                hostName={post?.authorName || ''}
                cleanTitle={cleanTitle}
                onToggleMute={viewerStream.toggleMute}
                waitingFor={viewerStream.isReconnecting ? 'host' : undefined}
              />
            )}

            {/* Floating Reactions on Video */}
            <LiveStreamFloatingReactions reactions={reactions} />

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition cursor-pointer backdrop-blur-sm z-30"
              title="Toàn màn hình"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

          {/* Host Info & Details Card */}
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <UserAvatar src={post?.authorAvatar} alt={post?.authorName} size="md" className="w-11 h-11 rounded-full ring-2 ring-red-500" />
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-bold text-white truncate">{post?.authorName}</span>
                  <span className="px-1.5 py-0.2 bg-red-600/20 text-red-400 text-[10px] font-bold rounded">HOST</span>
                </div>
                <p className="text-xs text-zinc-400 truncate mt-0.5">{cleanTitle}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white transition cursor-pointer flex items-center space-x-1.5 text-xs font-semibold"
                title="Chia sẻ buổi phát"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Chat Box for Audience */}
        <div className="lg:col-span-4 flex flex-col h-full min-h-0 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {t('live.chat.title', 'Trò chuyện trực tiếp')}
            </span>
            <span className="text-[11px] font-semibold bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          </div>

          {/* Pinned comment if any */}
          {pinnedComment && (
            <HostStudioPinnedComment comment={pinnedComment} onUnpin={() => setPinnedComment(null)} />
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0 divide-y divide-zinc-800/40">
            {comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500">
                <p className="text-xs font-medium">{t('live.chat.noComments', 'Chưa có bình luận nào')}</p>
                <p className="text-[11px] text-zinc-600 mt-1">Hãy là người đầu tiên trò chuyện cùng chủ phòng!</p>
              </div>
            ) : (
              comments.map((c) => {
                const isHostAuthor = Boolean(post?.authorName && c.authorName === post.authorName);
                return (
                  <div key={c.id} className="pt-2 first:pt-0 flex items-start space-x-2.5">
                    <UserAvatar src={c.authorAvatar} alt={c.authorName} size="sm" className="w-7 h-7 shrink-0 mt-0.5 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="text-xs font-bold text-blue-400 truncate">{c.authorName}</span>
                        {isHostAuthor && (
                          <span className="px-1 py-0.2 bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[9px] font-bold rounded">
                            HOST
                          </span>
                        )}
                        <span className="text-[10px] text-zinc-500">{c.time}</span>
                      </div>
                      <p className="text-xs text-gray-200 mt-0.5 break-words leading-relaxed select-text">
                        {c.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Viewer Chat Input */}
          {!viewerStream.isBanned && (
            <HostStudioChatInput
              commentInput={viewerCommentInput}
              replyingTo={replyingTo}
              inputRef={inputRef}
              onCommentInputChange={setViewerCommentInput}
              onCancelReply={() => setReplyingTo(null)}
              onSendComment={handleSendViewerComment}
              onSendReaction={(emoji) => {
                if (postId) sendLiveReaction(postId, emoji);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
