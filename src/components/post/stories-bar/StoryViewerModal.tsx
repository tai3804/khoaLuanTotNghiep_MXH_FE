import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  ImageOff,
  MoreHorizontal,
  Trash2,
  Users,
  X,
  Volume2,
  VolumeX,
  Pause,
  Play,
} from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { useAuth } from '../../../context/AuthContext';
import { storyService, StoryViewerItem, parseStoryCaption } from '../../../services/storyService';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../context/ConfirmContext';
import { StoryMusicBadge } from './StoryMusicBadge';

interface StoryViewerModalProps {
  selectedStory: any | null;
  onClose: () => void;
  onStoryDeleted?: () => void;
}

const STORY_DURATION_MS = 5500; // 5.5 seconds per story

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  selectedStory,
  onClose,
  onStoryDeleted,
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const stories = useMemo(() => selectedStory?.stories || [], [selectedStory]);

  const [storyIndex, setStoryIndex] = useState(0);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState<StoryViewerItem[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Story Progress & Auto-Advance Timer
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Audio Playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const story = stories[storyIndex];
  const isOwner = String(selectedStory?.userId) === String(user?.id);
  const parsedCaption = useMemo(
    () => parseStoryCaption(story?.caption || story?.content),
    [story?.caption, story?.content]
  );

  const moveTo = useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= stories.length) return;
      setStoryIndex(nextIndex);
      setProgress(0);
      setMediaFailed(false);
      setMediaLoading(true);
      setShowMenu(false);
      setShowViewers(false);
    },
    [stories.length]
  );

  // Reset when a new story group is opened
  useEffect(() => {
    setStoryIndex(0);
    setProgress(0);
    setMediaFailed(false);
    setMediaLoading(true);
    setViewerCount(
      Number(selectedStory?.stories?.[0]?.viewsCount ?? selectedStory?.stories?.[0]?.viewCount ?? 0)
    );
    setViewers([]);
    setIsPaused(false);
  }, [selectedStory]);

  // Audio playback handling
  useEffect(() => {
    if (parsedCaption.audio?.url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(parsedCaption.audio.url);
      } else {
        audioRef.current.src = parsedCaption.audio.url;
      }
      audioRef.current.muted = isMuted;
      audioRef.current.loop = true;
      if (!isPaused) {
        audioRef.current
          .play()
          .then(() => setIsPlayingAudio(true))
          .catch(() => setIsPlayingAudio(false));
      } else {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      }
    };
  }, [parsedCaption.audio?.url, isMuted, isPaused]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-advance progress timer (Facebook Standard)
  useEffect(() => {
    if (isPaused || showViewers || showMenu || mediaLoading) return;

    const intervalStepMs = 50;
    const stepPercent = (intervalStepMs / STORY_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (storyIndex < stories.length - 1) {
            moveTo(storyIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return Math.min(100, prev + stepPercent);
      });
    }, intervalStepMs);

    return () => clearInterval(timer);
  }, [isPaused, showViewers, showMenu, mediaLoading, storyIndex, stories.length, moveTo, onClose]);

  // Keyboard navigation: Left/Right arrows, Space to pause/next, ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (storyIndex > 0) moveTo(storyIndex - 1);
      } else if (e.key === 'ArrowRight') {
        if (storyIndex < stories.length - 1) moveTo(storyIndex + 1);
        else onClose();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [storyIndex, stories.length, moveTo, onClose]);

  // Record view count
  useEffect(() => {
    if (story?.id && !isOwner) {
      void storyService.viewStory(story.id).catch((error) => {
        console.error('[Stories] Could not record story view:', error);
      });
    }
  }, [story?.id, isOwner]);

  // Fetch viewers for owner
  useEffect(() => {
    let cancelled = false;
    if (story?.id && isOwner) {
      void storyService.getViewers(story.id, 1, 50).then((items) => {
        if (!cancelled) {
          setViewers(items);
          setViewerCount(items.length);
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [story?.id, isOwner]);

  if (!selectedStory) return null;

  const authorName =
    selectedStory.fullName || selectedStory.userName || selectedStory.username || 'Người dùng';
  const avatarUrl = selectedStory.avatarUrl || selectedStory.userAvatar || '/default-avatar.png';
  const mediaUrl = story?.mediaUrl || '';
  const isVideo = story?.mediaType === 'VIDEO' || /\.(mp4|webm|mov)(?:$|\?)/i.test(mediaUrl);
  const canGoBack = storyIndex > 0;
  const canGoNext = storyIndex < stories.length - 1;

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  const formatRemainingTime = (expiresAtStr?: string, createdAtStr?: string) => {
    let expiresMs = expiresAtStr ? new Date(expiresAtStr).getTime() : 0;
    if (!expiresMs && createdAtStr) {
      expiresMs = new Date(createdAtStr).getTime() + 24 * 60 * 60 * 1000;
    }
    if (!expiresMs) return null;
    const remainingMs = expiresMs - Date.now();
    if (remainingMs <= 0) return 'Đã hết hạn';
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `Còn ${hours} giờ`;
    return `Còn ${minutes} phút`;
  };

  const remainingText = formatRemainingTime(story?.expiresAt, story?.createdAt);

  const openViewers = async () => {
    if (!story?.id) return;
    setShowMenu(false);
    setShowViewers(true);
    setLoadingViewers(true);
    try {
      const items = await storyService.getViewers(story.id, 1, 50);
      setViewers(items);
      setViewerCount(items.length);
    } finally {
      setLoadingViewers(false);
    }
  };

  const deleteStory = async () => {
    if (!story?.id) return;
    const ok = await confirm({
      title: 'Xóa tin',
      message: 'Bạn có chắc chắn muốn xóa tin này? Tin sẽ không thể khôi phục.',
      confirmText: 'Xóa tin',
      cancelText: 'Hủy bỏ',
      type: 'danger',
    });
    if (!ok) return;
    setDeleting(true);
    try {
      await storyService.deleteStory(story.id);
      onStoryDeleted?.();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) audioRef.current.muted = nextMuted;
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-md p-4 select-none"
    >
      {/* Top Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng tin"
        className="absolute top-5 right-5 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer z-50"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Story Phone Canvas Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="relative max-w-[360px] w-full h-[85vh] max-h-[700px] rounded-3xl overflow-hidden bg-[#18191a] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/10 flex flex-col select-none"
      >
        {/* Story Multi-Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5 pointer-events-none">
          {stories.map((_: unknown, index: number) => (
            <div
              key={index}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/30 backdrop-blur-xs"
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-75"
                style={{
                  width:
                    index < storyIndex ? '100%' : index === storyIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Header Row: User Info & Controls */}
        <div className="absolute top-6 left-3.5 right-3.5 z-30 flex items-center gap-2.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-6 pt-1">
          <UserAvatar src={avatarUrl} alt={authorName} size="md" />
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate drop-shadow-md">{authorName}</p>
            <div className="flex items-center gap-1.5 text-xs text-white/80 drop-shadow-sm">
              <span>{formatRelativeTime(story?.createdAt) || `Tin ${storyIndex + 1}/${stories.length}`}</span>
              {remainingText && (
                <>
                  <span>•</span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      remainingText === 'Đã hết hạn' ? 'text-red-400' : 'text-blue-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {remainingText}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Top Right Action Icons */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Audio Mute / Unmute Button */}
            {parsedCaption.audio && (
              <button
                type="button"
                onClick={toggleMute}
                className="rounded-full bg-black/45 p-1.5 text-white/90 hover:text-white hover:bg-black/70 transition cursor-pointer"
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-pink-400" />}
              </button>
            )}

            {/* Owner Menu Toggle */}
            {isOwner && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Tuỳ chỉnh tin"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="rounded-full bg-black/45 p-1.5 text-white/90 hover:text-white hover:bg-black/70 transition cursor-pointer"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-10 w-48 overflow-hidden rounded-2xl bg-[#242526] py-1.5 shadow-2xl ring-1 ring-white/10 z-40">
                    <button
                      type="button"
                      onClick={openViewers}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-white hover:bg-white/10 transition"
                    >
                      <Users className="h-4 w-4 text-blue-400" />
                      <span>Xem người đã xem ({viewerCount})</span>
                    </button>
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={deleteStory}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-red-400 hover:bg-white/10 disabled:opacity-50 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>{deleting ? 'Đang xoá tin...' : 'Xóa tin này'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Music Badge Overlay */}
        {parsedCaption.audio && (
          <div className="absolute top-20 left-3.5 z-30 pointer-events-auto">
            <StoryMusicBadge
              audio={parsedCaption.audio}
              isPlaying={isPlayingAudio && !isPaused}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              size="sm"
            />
          </div>
        )}

        {/* Hold to Pause Indicator */}
        {isPaused && (
          <div className="absolute top-20 right-3.5 z-30 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/80 font-medium flex items-center gap-1 pointer-events-none">
            <Pause className="w-2.5 h-2.5" />
            <span>Đang tạm dừng</span>
          </div>
        )}

        {/* Story Media Viewer Canvas */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {!mediaUrl || mediaFailed ? (
            <div className="max-w-[80%] text-center text-white p-4">
              <ImageOff className="mx-auto mb-3 h-10 w-10 text-white/60" />
              <p className="font-semibold text-sm">Không thể tải nội dung tin</p>
              <p className="mt-1 text-xs text-white/65">
                File đã bị xoá, URL không hợp lệ hoặc bạn không có quyền xem.
              </p>
            </div>
          ) : isVideo ? (
            <video
              key={mediaUrl}
              src={mediaUrl}
              autoPlay
              playsInline
              muted={isMuted}
              className="h-full w-full object-contain"
              onLoadedData={() => setMediaLoading(false)}
              onError={() => {
                setMediaLoading(false);
                setMediaFailed(true);
              }}
            />
          ) : (
            <img
              key={mediaUrl}
              src={mediaUrl}
              alt={`Tin của ${authorName}`}
              className="h-full w-full object-contain"
              onLoad={() => setMediaLoading(false)}
              onError={() => {
                setMediaLoading(false);
                setMediaFailed(true);
              }}
            />
          )}

          {mediaUrl && mediaLoading && !mediaFailed && (
            <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-[#1877f2]" />
          )}
        </div>

        {/* Caption text overlay if present */}
        {parsedCaption.text && (
          <div className="absolute bottom-14 left-4 right-4 z-30 text-center pointer-events-none">
            <span className="inline-block px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-xs text-white drop-shadow font-medium max-w-full">
              {parsedCaption.text}
            </span>
          </div>
        )}

        {/* Tap Zones for Quick Navigation (Left 25% / Right 25%) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (canGoBack) moveTo(storyIndex - 1);
          }}
          className="absolute inset-y-0 left-0 w-1/4 z-10 cursor-pointer"
          title="Tin trước"
        />
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (canGoNext) moveTo(storyIndex + 1);
            else onClose();
          }}
          className="absolute inset-y-0 right-0 w-1/4 z-10 cursor-pointer"
          title="Tin tiếp theo"
        />

        {/* Arrow Navigation Buttons */}
        {canGoBack && (
          <button
            type="button"
            aria-label="Tin trước"
            onClick={(e) => {
              e.stopPropagation();
              moveTo(storyIndex - 1);
            }}
            className="absolute left-2.5 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75 transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canGoNext && (
          <button
            type="button"
            aria-label="Tin tiếp theo"
            onClick={(e) => {
              e.stopPropagation();
              moveTo(storyIndex + 1);
            }}
            className="absolute right-2.5 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/75 transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Viewers Trigger Button (For story owner) */}
        {isOwner && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openViewers();
            }}
            className="absolute bottom-3.5 left-3.5 z-30 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white hover:bg-black/80 transition cursor-pointer border border-white/10"
          >
            <Eye className="h-3.5 w-3.5 text-blue-400" />
            <span>{viewerCount} lượt xem</span>
          </button>
        )}

        {/* Viewers Drawer */}
        {showViewers && (
          <div className="absolute inset-x-2.5 bottom-2.5 z-40 max-h-[60%] overflow-y-auto rounded-2xl bg-[#242526]/98 p-3.5 shadow-2xl ring-1 ring-white/15 backdrop-blur-md">
            <div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-xs text-white">Người đã xem ({viewerCount})</span>
              <button
                type="button"
                onClick={() => setShowViewers(false)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {loadingViewers ? (
              <p className="py-6 text-center text-xs text-white/60">Đang tải danh sách người xem...</p>
            ) : viewers.length === 0 ? (
              <p className="py-6 text-center text-xs text-white/60">Chưa có ai xem tin này.</p>
            ) : (
              <div className="space-y-1.5 divide-y divide-white/5">
                {viewers.map((viewer) => (
                  <div key={viewer.id} className="flex items-center gap-2.5 pt-1.5">
                    <UserAvatar
                      src={viewer.viewerAvatar || '/default-avatar.png'}
                      alt={viewer.viewerName || 'Người dùng'}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate">
                        {viewer.viewerName || 'Người dùng'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
