import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, ImageOff, MoreHorizontal, Trash2, Users, X } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { useAuth } from '../../../context/AuthContext';
import { storyService, StoryViewerItem } from '../../../services/storyService';
import { useToast } from '../../../context/ToastContext';

interface StoryViewerModalProps {
  selectedStory: any | null;
  onClose: () => void;
  onStoryDeleted?: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({ selectedStory, onClose, onStoryDeleted }) => {
  const { user } = useAuth();
  const toast = useToast();
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

  useEffect(() => {
    setStoryIndex(0);
    setMediaFailed(false);
    setMediaLoading(true);
    setViewerCount(Number(selectedStory?.stories?.[0]?.viewsCount ?? selectedStory?.stories?.[0]?.viewCount ?? 0));
    setViewers([]);
  }, [selectedStory]);

  const story = stories[storyIndex];
  const isOwner = String(selectedStory?.userId) === String(user?.id);

  useEffect(() => {
    if (story?.id && !isOwner) {
      void storyService.viewStory(story.id).catch((error) => {
        console.error('[Stories] Could not record story view:', error);
        toast.showError('Không thể ghi nhận lượt xem tin. Vui lòng thử lại.');
      });
    }
  }, [story?.id, isOwner, toast]);

  // A story owner needs fresh data: their StoriesBar was loaded before
  // another user opened the story, so its embedded count can be outdated.
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
    return () => { cancelled = true; };
  }, [story?.id, isOwner]);

  if (!selectedStory) return null;

  const authorName = selectedStory.fullName || selectedStory.userName || selectedStory.username || 'Người dùng';
  const avatarUrl = selectedStory.avatarUrl || selectedStory.userAvatar || '/default-avatar.png';
  const mediaUrl = story?.mediaUrl || '';
  const isVideo = story?.mediaType === 'VIDEO' || /\.(mp4|webm|mov)(?:$|\?)/i.test(mediaUrl);
  const canGoBack = storyIndex > 0;
  const canGoNext = storyIndex < stories.length - 1;

  const moveTo = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= stories.length) return;
    setStoryIndex(nextIndex);
    setMediaFailed(false);
    setMediaLoading(true);
  };

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
    if (!story?.id || !window.confirm('Xoá tin này? Tin sẽ không thể khôi phục.')) return;
    setDeleting(true);
    try {
      await storyService.deleteStory(story.id);
      onStoryDeleted?.();
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <button type="button" onClick={onClose} aria-label="Đóng tin" className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition">
        <X className="w-6 h-6" />
      </button>

      <div onClick={(event) => event.stopPropagation()} className="relative max-w-sm w-full h-[80vh] rounded-2xl overflow-hidden bg-[#18191a] shadow-2xl">
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1">
          {stories.map((_: unknown, index: number) => (
            <div key={index} className="h-1 flex-1 overflow-hidden rounded bg-white/35">
              <div className={`h-full bg-white transition-all ${index <= storyIndex ? 'w-full' : 'w-0'}`} />
            </div>
          ))}
        </div>

        <div className="absolute top-7 left-4 right-4 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent pb-5">
          <UserAvatar src={avatarUrl} alt={authorName} size="md" />
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">{authorName}</p>
            <p className="text-xs text-white/75">Tin {storyIndex + 1}/{stories.length || 1}</p>
          </div>
          {isOwner && (
            <div className="relative ml-auto">
              <button type="button" aria-label="Tuỳ chỉnh tin" onClick={() => setShowMenu((value) => !value)} className="rounded-full bg-black/35 p-2 text-white hover:bg-black/60"><MoreHorizontal className="h-5 w-5" /></button>
              {showMenu && <div className="absolute right-0 top-11 w-48 overflow-hidden rounded-xl bg-[#242526] py-1 shadow-xl ring-1 ring-white/10">
                <button type="button" onClick={openViewers} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white hover:bg-white/10"><Users className="h-4 w-4" />Xem người đã xem</button>
                <button type="button" disabled={deleting} onClick={deleteStory} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10 disabled:opacity-50"><Trash2 className="h-4 w-4" />{deleting ? 'Đang xoá...' : 'Xoá tin'}</button>
              </div>}
            </div>
          )}
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          {!mediaUrl || mediaFailed ? (
            <div className="max-w-[80%] text-center text-white">
              <ImageOff className="mx-auto mb-3 h-10 w-10 text-white/60" />
              <p className="font-semibold">Không thể tải nội dung tin</p>
              <p className="mt-1 text-sm text-white/65">File đã bị xoá, URL không hợp lệ hoặc bạn không có quyền xem.</p>
            </div>
          ) : isVideo ? (
            <video key={mediaUrl} src={mediaUrl} controls autoPlay playsInline className="h-full w-full object-contain" onLoadedData={() => setMediaLoading(false)} onError={() => { setMediaLoading(false); setMediaFailed(true); }} />
          ) : (
            <img key={mediaUrl} src={mediaUrl} alt={`Tin của ${authorName}`} className="h-full w-full object-contain" onLoad={() => setMediaLoading(false)} onError={() => { setMediaLoading(false); setMediaFailed(true); }} />
          )}
          {mediaUrl && mediaLoading && !mediaFailed && <div className="absolute h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-[#1877f2]" />}
        </div>

        {story?.content && <p className="absolute bottom-5 left-5 right-5 z-20 text-center text-sm text-white drop-shadow">{story.content}</p>}
        {canGoBack && <button type="button" aria-label="Tin trước" onClick={() => moveTo(storyIndex - 1)} className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/70"><ChevronLeft /></button>}
        {canGoNext && <button type="button" aria-label="Tin tiếp theo" onClick={() => moveTo(storyIndex + 1)} className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/70"><ChevronRight /></button>}
        {isOwner && <button type="button" onClick={openViewers} className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/70"><Eye className="h-4 w-4" />{viewerCount} lượt xem</button>}

        {showViewers && <div className="absolute inset-x-3 bottom-3 z-30 max-h-[55%] overflow-y-auto rounded-xl bg-[#242526]/95 p-3 shadow-2xl ring-1 ring-white/10 backdrop-blur">
          <div className="mb-2 flex items-center justify-between"><span className="font-semibold text-white">Người đã xem</span><button type="button" onClick={() => setShowViewers(false)} className="text-white/70 hover:text-white"><X className="h-4 w-4" /></button></div>
          {loadingViewers ? <p className="py-5 text-center text-sm text-white/60">Đang tải...</p> : viewers.length === 0 ? <p className="py-5 text-center text-sm text-white/60">Chưa có ai xem tin này.</p> : viewers.map((viewer) => <div key={viewer.id} className="flex items-center gap-2 border-t border-white/10 py-2"><UserAvatar src={viewer.viewerAvatar || '/default-avatar.png'} alt={viewer.viewerName || 'Người dùng'} size="sm" /><span className="text-sm text-white">{viewer.viewerName || 'Người dùng'}</span></div>)}
        </div>}
      </div>
    </div>
  );
};
