import React, { useRef, useState, useEffect } from 'react';
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  X,
  Upload,
  Loader2,
  Trash2,
  Eye,
  Play,
  Pause,
  Send,
  Heart,
  Type,
  Sparkles,
  Smile,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { storyService, authorProfileCache, chatService } from '../../services/api';
import { mediaService } from '../../services/mediaService';
import { UserAvatar } from '../common/UserAvatar';

const GRADIENT_THEMES = [
  { id: 'sunset', label: 'Hoàng hôn', bg: 'from-pink-500 via-rose-500 to-amber-500', color: '#ec4899' },
  { id: 'ocean', label: 'Đại dương', bg: 'from-blue-600 via-indigo-600 to-cyan-500', color: '#2563eb' },
  { id: 'neon', label: 'Tím Neon', bg: 'from-purple-600 via-fuchsia-600 to-pink-500', color: '#9333ea' },
  { id: 'emerald', label: 'Ngọc lục bảo', bg: 'from-emerald-500 via-teal-600 to-cyan-600', color: '#059669' },
  { id: 'midnight', label: 'Đêm huyền bí', bg: 'from-gray-900 via-purple-950 to-slate-900', color: '#1e1b4b' },
  { id: 'fire', label: 'Ngọn lửa', bg: 'from-red-600 via-orange-500 to-yellow-500', color: '#dc2626' },
];

export const StoriesBar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();

  const scrollRef = useRef<HTMLDivElement>(null);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const [userStoriesList, setUserStoriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Create Story Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState<'media' | 'text'>('media');
  const [imageUrl, setImageUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(GRADIENT_THEMES[0]);
  const [creating, setCreating] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Story Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // My Story Management (Viewers Drawer & Delete)
  const [showViewersDrawer, setShowViewersDrawer] = useState(false);
  const [viewersList, setViewersList] = useState<any[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingStory, setDeletingStory] = useState(false);
  const [reactionFloating, setReactionFloating] = useState<string | null>(null);

  // Facebook scroll navigation state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
    }
  };

  useEffect(() => {
    const timer = setTimeout(checkScrollState, 300);
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollState);
      window.addEventListener('resize', checkScrollState);
      return () => {
        clearTimeout(timer);
        el.removeEventListener('scroll', checkScrollState);
        window.removeEventListener('resize', checkScrollState);
      };
    }
    return () => clearTimeout(timer);
  }, [userStoriesList]);

  // Decode JWT sub/userId to guarantee exact agreement with backend getCurrentUserId()
  const getAuthUserId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.sub) return String(payload.sub).toLowerCase();
        if (payload.userId) return String(payload.userId).toLowerCase();
      } catch {}
    }
    if (user?.id) return String(user.id).toLowerCase();
    if ((user as any)?.userId) return String((user as any).userId).toLowerCase();
    return '';
  };

  const currentUserId = getAuthUserId();

  const loadStories = async () => {
    if (!isAuthenticated) {
      setUserStoriesList([]);
      return;
    }
    setLoading(true);
    try {
      const data = await storyService.getStories();
      setUserStoriesList(Array.isArray(data) ? data : []);
    } catch {
      setUserStoriesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadStories();
    } else {
      setUserStoriesList([]);
    }
  }, [isAuthenticated]);

  // Find My Stories vs Friends Stories
  const myStoryGroup = userStoriesList.find(
    (item) => String(item.userId).toLowerCase() === currentUserId
  );
  const friendStoryGroups = userStoriesList.filter(
    (item) => String(item.userId).toLowerCase() !== currentUserId
  );

  // Current active story in Viewer
  const activeGroup = userStoriesList[currentGroupIndex];
  const activeStories = activeGroup?.stories || [];
  const activeStory = activeStories[currentStoryIndex];
  const isMyStory = activeGroup && String(activeGroup.userId).toLowerCase() === currentUserId;

  const currentAuthorName =
    (isMyStory ? 'Tin của bạn' : '') ||
    activeGroup?.fullName ||
    authorProfileCache[String(activeGroup?.userId)]?.name ||
    (activeGroup?.lastName || activeGroup?.firstName
      ? `${activeGroup?.lastName || ''} ${activeGroup?.firstName || ''}`.trim()
      : 'Người dùng');

  const currentAuthorAvatar =
    activeGroup?.avatarUrl ||
    authorProfileCache[String(activeGroup?.userId)]?.avatar ||
    '/default-avatar.png';

  const storyViewsCount = Math.max(
    Number(activeStory?.viewsCount ?? 0),
    Number(activeStory?.viewCount ?? 0),
    viewersList.length
  );

  // Real-time 5s progress bar for active story
  useEffect(() => {
    if (!viewerOpen || !activeStory || isPaused || showViewersDrawer || showDeleteConfirm) return;

    const interval = 50; // Update every 50ms
    const step = (interval / 5000) * 100; // 5000ms = 5s total duration

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [viewerOpen, activeStory, isPaused, currentGroupIndex, currentStoryIndex, showViewersDrawer, showDeleteConfirm]);

  // Record view and load viewers when active story changes
  useEffect(() => {
    if (viewerOpen && activeStory?.id) {
      setProgress(0);
      if (!isMyStory) {
        storyService.viewStory(activeStory.id).catch(() => {});
      } else {
        fetchViewers(activeStory.id);
      }
    }
  }, [viewerOpen, activeStory?.id, isMyStory]);

  const fetchViewers = async (storyId: string) => {
    setLoadingViewers(true);
    try {
      const viewers = await storyService.getViewers(storyId);
      setViewersList(Array.isArray(viewers) ? viewers : []);
    } catch {
      setViewersList([]);
    } finally {
      setLoadingViewers(false);
    }
  };

  const handleNextStory = () => {
    if (!activeGroup) return;
    if (currentStoryIndex < activeStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else if (currentGroupIndex < userStoriesList.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      setViewerOpen(false);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prev) => prev - 1);
      const prevStories = userStoriesList[currentGroupIndex - 1]?.stories || [];
      setCurrentStoryIndex(Math.max(0, prevStories.length - 1));
      setProgress(0);
    }
  };

  const handleOpenViewer = (groupIndex: number) => {
    setCurrentGroupIndex(groupIndex);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
    setShowViewersDrawer(false);
    setViewerOpen(true);
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      setTimeout(checkScrollState, 350);
    }
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      setTimeout(checkScrollState, 350);
    }
  };

  const handleStoryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMedia(true);
    toast.showInfo('Đang tải file story lên AWS S3...');
    try {
      const uploaded = await mediaService.uploadMedia(file, 'stories');
      setImageUrl(uploaded.fileUrl);
      toast.showSuccess('Tải media lên AWS S3 thành công!');
    } catch (err: any) {
      toast.showError('Tải file thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingMedia(false);
    }
  };

  // Generate image data URL from text and gradient theme
  const generateTextImage = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 720, 1280);
    if (selectedTheme.id === 'sunset') {
      gradient.addColorStop(0, '#ec4899');
      gradient.addColorStop(0.5, '#f43f5e');
      gradient.addColorStop(1, '#f59e0b');
    } else if (selectedTheme.id === 'ocean') {
      gradient.addColorStop(0, '#2563eb');
      gradient.addColorStop(0.5, '#4f46e5');
      gradient.addColorStop(1, '#06b6d4');
    } else if (selectedTheme.id === 'neon') {
      gradient.addColorStop(0, '#9333ea');
      gradient.addColorStop(0.5, '#c026d3');
      gradient.addColorStop(1, '#ec4899');
    } else if (selectedTheme.id === 'emerald') {
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(0.5, '#0d9488');
      gradient.addColorStop(1, '#0891b2');
    } else if (selectedTheme.id === 'fire') {
      gradient.addColorStop(0, '#dc2626');
      gradient.addColorStop(0.5, '#f97316');
      gradient.addColorStop(1, '#eab308');
    } else {
      gradient.addColorStop(0, '#111827');
      gradient.addColorStop(0.5, '#312e81');
      gradient.addColorStop(1, '#0f172a');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 720, 1280);

    // Text configuration
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

    // Word wrap
    const words = textContent.trim().split(' ');
    let line = '';
    const lines: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > 600 && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const lineHeight = 60;
    const startY = 640 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, index) => {
      ctx.fillText(l.trim(), 360, startY + index * lineHeight);
    });

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleCreateStorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalMediaUrl = imageUrl.trim();

    if (createMode === 'text') {
      if (!textContent.trim()) {
        toast.showError('Vui lòng nhập nội dung tin');
        return;
      }
      finalMediaUrl = generateTextImage();
    } else if (!finalMediaUrl) {
      toast.showError('Vui lòng chọn hoặc tải ảnh/video lên');
      return;
    }

    setCreating(true);
    try {
      const isVideo = finalMediaUrl.endsWith('.mp4') || finalMediaUrl.endsWith('.webm');
      await storyService.createStory(
        finalMediaUrl,
        isVideo ? 'VIDEO' : 'IMAGE',
        createMode === 'text' ? textContent.trim() : undefined
      );
      setImageUrl('');
      setTextContent('');
      setShowCreateModal(false);
      await loadStories();
      toast.showSuccess('Đã đăng tin mới lên Bảng tin 24h!');
    } catch (err: any) {
      toast.showError('Không thể tạo tin: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  // Delete current story (My Story Management)
  const handleDeleteCurrentStory = async () => {
    if (!activeStory?.id) return;
    setDeletingStory(true);
    try {
      await storyService.deleteStory(activeStory.id);
      toast.showSuccess('Đã xóa tin thành công');
      setShowDeleteConfirm(false);

      // Refresh stories
      await loadStories();

      // If active group has more stories, advance or close
      if (activeStories.length > 1) {
        if (currentStoryIndex >= activeStories.length - 1) {
          setCurrentStoryIndex((prev) => Math.max(0, prev - 1));
        }
      } else {
        setViewerOpen(false);
      }
    } catch (err: any) {
      toast.showError('Xóa tin thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeletingStory(false);
    }
  };

  // Quick reply to friend's story
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeGroup?.userId) return;
    setSendingReply(true);
    try {
      const friendId = String(activeGroup.userId);
      const conv = await chatService.createDirectChat(friendId);
      const convId = conv?.conversationId || conv?.id;
      if (convId) {
        const msg = `[Đã phản hồi tin của bạn]: ${replyText.trim()}`;
        await chatService.sendMessage(String(convId), msg);
        window.dispatchEvent(new CustomEvent('chat_conversation_updated'));
        setReplyText('');
        toast.showSuccess('Đã gửi phản hồi vào tin nhắn!');
      }
    } catch (err: any) {
      toast.showError('Không thể gửi phản hồi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSendingReply(false);
    }
  };

  // Quick emoji reaction
  const handleQuickReaction = (emoji: string) => {
    setReactionFloating(emoji);
    setTimeout(() => setReactionFloating(null), 1500);

    if (activeGroup?.userId && !isMyStory) {
      const friendId = String(activeGroup.userId);
      chatService
        .createDirectChat(friendId)
        .then((conv) => {
          const convId = conv?.conversationId || conv?.id;
          if (convId) {
            chatService
              .sendMessage(String(convId), `[Đã bày tỏ cảm xúc ${emoji} về tin của bạn]`)
              .then(() => {
                window.dispatchEvent(new CustomEvent('chat_conversation_updated'));
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
    }
  };

  return (
    <div className="relative group/bar mb-4">
      {/* Scroll Left Button: Only rendered when scrolled right (Facebook logic) */}
      {canScrollLeft && (
        <button
          onClick={handleScrollLeft}
          className="w-11 h-11 rounded-full bg-[#3a3b3c]/95 hover:bg-[#4e4f50] text-white shadow-2xl border border-white/10 hidden sm:flex items-center justify-center absolute -left-2 top-1/2 -translate-y-1/2 z-30 cursor-pointer transition transform hover:scale-105 active:scale-95"
          title="Xem tin trước"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Horizontal Story Cards Carousel */}
      <div
        ref={scrollRef}
        className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-none select-none scroll-smooth"
      >
        {/* CARD 1: My Story (If active stories exist) OR Create Story Card */}
        {myStoryGroup && myStoryGroup.stories && myStoryGroup.stories.length > 0 ? (
          <div
            onClick={() => {
              const myIdx = userStoriesList.findIndex(
                (item) => String(item.userId).toLowerCase() === currentUserId
              );
              handleOpenViewer(myIdx >= 0 ? myIdx : 0);
            }}
            className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-gray-900 transition border-2 border-[#1877f2]"
          >
            {/* Background latest story */}
            <img
              src={myStoryGroup.stories[0]?.mediaUrl || user?.avatar || '/default-avatar.png'}
              alt="Tin của bạn"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300 brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />

            {/* My Story Avatar with Blue Story Ring */}
            <div className="absolute top-2.5 left-2.5 z-10">
              <div className="p-[2.5px] bg-[#1877f2] rounded-full shadow-md">
                <UserAvatar src={user?.avatar || ''} alt="Tôi" size="sm" className="w-8 h-8 rounded-full border-2 border-white dark:border-[#242526]" />
              </div>
            </div>

            {/* Quick Add Story Plus Button on Top Right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCreateModal(true);
              }}
              className="absolute top-2.5 right-2.5 w-7 h-7 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110 cursor-pointer z-10"
              title="Thêm tin mới"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Footer Label: Tin của bạn + số lượng */}
            <div className="absolute bottom-2 inset-x-2 z-10">
              <span className="text-[12px] font-bold text-white drop-shadow-md truncate block">
                Tin của bạn
              </span>
              <span className="text-[10px] text-blue-200 font-medium">
                {myStoryGroup.stories.length} tin hoạt động
              </span>
            </div>
          </div>
        ) : (
          /* Facebook Default Create Story Card */
          <div
            onClick={() => setShowCreateModal(true)}
            className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] transition flex flex-col justify-between"
          >
            <div className="h-[72%] w-full overflow-hidden bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-gray-100 dark:from-[#1877f2]/25 dark:via-blue-900/10 dark:to-[#3a3b3c] flex items-center justify-center relative">
              <div className="w-14 h-14 rounded-full ring-4 ring-white dark:ring-[#242526] shadow-md overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] group-hover:scale-105 transition duration-300">
                <img
                  src={user?.avatar || '/default-avatar.png'}
                  alt={user?.fullName || 'Tạo tin'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
              </div>
            </div>
            <div className="h-[28%] bg-white dark:bg-[#242526] flex flex-col items-center justify-end pb-2.5 relative">
              <div className="w-9 h-9 rounded-full bg-[#1877f2] border-4 border-white dark:border-[#242526] flex items-center justify-center text-white shadow-md absolute -top-4.5 group-hover:bg-[#166fe5] group-hover:scale-110 transition">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[12px] font-semibold text-gray-900 dark:text-[#e4e6eb] leading-tight">
                {t('createStory') || 'Tạo tin'}
              </span>
            </div>
          </div>
        )}

        {/* Friends Stories Cards */}
        {friendStoryGroups.map((group) => {
          const authorId = String(group.userId);
          const cached = authorProfileCache[authorId];
          const authorName =
            group.fullName ||
            cached?.name ||
            (group.lastName || group.firstName
              ? `${group.lastName || ''} ${group.firstName || ''}`.trim()
              : 'Thành viên KLTN');

          const avatarSrc = group.avatarUrl || cached?.avatar || '/default-avatar.png';
          const stories = group.stories || [];
          const firstStory = stories[0] || {};
          const bgImage = firstStory.mediaUrl || null;

          const groupIdx = userStoriesList.findIndex((item) => String(item.userId) === authorId);

          return (
            <div
              key={authorId}
              onClick={() => handleOpenViewer(groupIdx >= 0 ? groupIdx : 0)}
              className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-gray-900 transition border border-gray-200/40 dark:border-transparent"
            >
              {bgImage ? (
                <img
                  src={bgImage}
                  alt={authorName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90 group-hover:brightness-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-3 text-center">
                  <span className="text-[11px] font-bold text-white line-clamp-3 leading-snug">
                    {firstStory.content || 'Tin mới 24h'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

              {/* Story Ring: Gradient (unviewed) vs Grey (viewed) */}
              <div className="absolute top-2.5 left-2.5 z-10">
                <div
                  className={`rounded-full transition-all duration-300 ${
                    group.hasUnviewedStories !== false
                      ? 'p-[2.5px] bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 shadow-md'
                      : 'p-[2px] bg-gray-400 dark:bg-gray-600 shadow-sm'
                  }`}
                  title={group.hasUnviewedStories !== false ? 'Tin chưa xem' : 'Đã xem'}
                >
                  <img
                    src={avatarSrc}
                    alt={authorName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-[#242526]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                  />
                </div>
              </div>

              {/* Author Name */}
              <div className="absolute bottom-2 inset-x-2 z-10">
                <span className="text-[12px] font-semibold text-white drop-shadow-md truncate block">
                  {authorName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scroll Right Button: Facebook style round button on the right */}
      {canScrollRight && (
        <button
          onClick={handleScrollRight}
          className="w-11 h-11 rounded-full bg-[#3a3b3c]/95 hover:bg-[#4e4f50] text-white shadow-2xl border border-white/10 flex items-center justify-center absolute -right-2 top-1/2 -translate-y-1/2 z-30 cursor-pointer transition transform hover:scale-105 active:scale-95"
          title="Xem thêm tin"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}

      {/* ========================================================================= */}
      {/* 2. FULL FACEBOOK STORY VIEWER & MANAGEMENT MODAL                          */}
      {/* ========================================================================= */}
      {viewerOpen && activeStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none"
          onClick={() => setViewerOpen(false)}
        >
          {/* Close Story Button */}
          <button
            onClick={() => setViewerOpen(false)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Đóng xem tin"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows (Prev / Next) */}
          {(currentGroupIndex > 0 || currentStoryIndex > 0) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevStory();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white shadow-2xl transition cursor-pointer"
              title="Tin trước"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white shadow-2xl transition cursor-pointer"
            title="Tin tiếp theo"
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Floating Emoji Reaction Animation */}
          {reactionFloating && (
            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
              <span className="text-8xl animate-bounce drop-shadow-2xl">{reactionFloating}</span>
            </div>
          )}

          {/* Main Story Container (Vertical 9:16 Aspect Ratio) */}
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative w-full max-w-sm sm:max-w-md h-[90vh] rounded-2xl overflow-hidden bg-[#18191a] shadow-2xl flex flex-col justify-between border border-white/10"
          >
            {/* Top Area: Segmented Progress Bars & Story Header */}
            <div className="absolute top-0 inset-x-0 z-30 p-3.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent space-y-2.5">
              {/* Segmented Progress Bars */}
              <div className="flex space-x-1 w-full">
                {activeStories.map((s: any, idx: number) => {
                  let fillPercent = 0;
                  if (idx < currentStoryIndex) fillPercent = 100;
                  else if (idx === currentStoryIndex) fillPercent = progress;

                  return (
                    <div key={s.id || idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-75"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Author Info Bar + Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <img
                    src={currentAuthorAvatar}
                    alt={currentAuthorName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-avatar.png';
                    }}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {isMyStory ? 'Tin của bạn' : currentAuthorName}
                    </h4>
                    <div className="flex items-center space-x-1.5 text-[11px] text-white/80 font-medium">
                      <span>
                        {activeStory.createdAt
                          ? new Date(activeStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Vừa xong'}
                      </span>
                      {isMyStory && (
                        <>
                          <span>•</span>
                          <span className="flex items-center space-x-0.5 text-blue-200">
                            <Eye className="w-3 h-3 inline mr-0.5" />
                            <span>{storyViewsCount} người xem</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header Controls: Play/Pause, Delete (if my story) */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="p-1.5 rounded-full hover:bg-white/20 text-white/90 transition cursor-pointer"
                    title={isPaused ? 'Tiếp tục phát' : 'Tạm dừng'}
                  >
                    {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
                  </button>

                  {/* UC-ST03: Delete Story Button (For Story Author) */}
                  {isMyStory && (
                    <button
                      onClick={() => {
                        setIsPaused(true);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-1.5 rounded-full hover:bg-red-500/30 text-white/90 hover:text-red-400 transition cursor-pointer"
                      title="Xóa tin này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Media Area: Image / Video with Left & Right Tap Zones */}
            <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black">
              {activeStory.mediaUrl?.endsWith('.mp4') || activeStory.mediaUrl?.endsWith('.webm') ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  loop
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={activeStory.mediaUrl}
                  alt="Story content"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Click left 35% to go prev, click right 35% to go next */}
              <div
                onClick={handlePrevStory}
                className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer"
              />
              <div
                onClick={handleNextStory}
                className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer"
              />
            </div>

            {/* Bottom Footer: My Story Management OR Friend Reaction/Reply */}
            <div className="relative z-30 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              {isMyStory ? (
                /* UC-ST03: QUẢN LÝ TIN CỦA TÔI (MY STORY) */
                <div className="flex items-center justify-between bg-white/15 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/20">
                  <div
                    onClick={() => {
                      setIsPaused(true);
                      setShowViewersDrawer(true);
                      if (activeStory?.id) {
                        fetchViewers(activeStory.id);
                      }
                    }}
                    className="flex items-center space-x-2.5 cursor-pointer group"
                    title="Bấm để xem danh sách người xem tin"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:underline">
                        {storyViewsCount} người xem
                      </span>
                      <p className="text-[10px] text-white/80">Bấm để xem danh sách chi tiết</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setViewerOpen(false);
                      setShowCreateModal(true);
                    }}
                    className="flex items-center space-x-1.5 bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm tin</span>
                  </button>
                </div>
              ) : (
                /* FRIEND STORY: Quick Reply & Reactions */
                <div className="space-y-2">
                  {/* Floating Reactions Bar */}
                  <div className="flex items-center justify-around py-1 bg-black/40 backdrop-blur-sm rounded-full px-2 border border-white/10">
                    {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleQuickReaction(emoji)}
                        className="text-xl hover:scale-130 transition transform active:scale-95 cursor-pointer p-1"
                        title={`Bày tỏ ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Reply Input Form */}
                  <form onSubmit={handleSendReply} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Gửi phản hồi cho ${currentAuthorName}...`}
                      className="flex-1 bg-white/20 text-white placeholder-white/70 text-xs px-3.5 py-2 rounded-full border border-white/20 focus:outline-none focus:bg-white/30 transition"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || sendingReply}
                      className="p-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full disabled:opacity-40 transition cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* VIEWERS LIST DRAWER (UC-ST03: Danh sách người xem tin của tôi)            */}
            {/* ========================================================================= */}
            {showViewersDrawer && (
              <div
                onClick={() => setShowViewersDrawer(false)}
                className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-fade-in"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#242526] rounded-t-2xl max-h-[60vh] flex flex-col p-4 border-t border-white/15 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-gray-700 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-bold text-white">
                        Người xem tin ({viewersList.length || storyViewsCount})
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowViewersDrawer(false)}
                      className="p-1 rounded-full text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="overflow-y-auto space-y-2 flex-1 pr-1">
                    {loadingViewers ? (
                      <div className="py-6 text-center text-xs text-gray-400 flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span>Đang tải người xem...</span>
                      </div>
                    ) : viewersList.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400">
                        Chưa có ai xem tin này. Hãy chia sẻ thêm để bạn bè nhìn thấy nhé!
                      </div>
                    ) : (
                      viewersList.map((viewer) => (
                        <div
                          key={viewer.id || viewer.viewerId}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#3a3b3c]/60 transition"
                        >
                          <div className="flex items-center space-x-2.5">
                            <UserAvatar
                              src={viewer.viewerAvatar || '/default-avatar.png'}
                              alt={viewer.viewerName || 'Người xem'}
                              size="sm"
                              className="w-9 h-9 rounded-full"
                            />
                            <div>
                              <p className="text-xs font-bold text-white">
                                {viewer.viewerName || 'Thành viên KLTN'}
                              </p>
                              <span className="text-[10px] text-gray-400">
                                {viewer.viewedAt ? new Date(viewer.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xem'}
                              </span>
                            </div>
                          </div>
                          <span className="text-base">👁️</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DELETE STORY CONFIRMATION MODAL */}
            {showDeleteConfirm && (
              <div
                onClick={() => setShowDeleteConfirm(false)}
                className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#242526] p-5 rounded-2xl border border-gray-700 max-w-xs w-full text-center space-y-3 shadow-2xl"
                >
                  <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Xóa tin này?</h4>
                  <p className="text-xs text-gray-400">
                    Tin này sẽ bị xóa vĩnh viễn và bạn bè sẽ không còn nhìn thấy nữa.
                  </p>
                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleDeleteCurrentStory}
                      disabled={deletingStory}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      {deletingStory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Xóa</span>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FACEBOOK CREATE STORY MODAL (Tạo tin Ảnh/Video hoặc Tin Văn Bản)      */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 cursor-pointer animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#242526] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-[#393a3b] space-y-4 cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-[#393a3b]">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-[#e4e6eb]">Tạo tin 24h</h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">Chia sẻ khoảnh khắc sẽ tự động biến mất sau 24 giờ</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs (Tin Ảnh/Video vs Tin Văn Bản chuẩn Facebook) */}
            <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-[#18191a] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setCreateMode('media')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer ${
                  createMode === 'media'
                    ? 'bg-white dark:bg-[#242526] text-[#1877f2] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Tạo tin ảnh/video</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('text')}
                className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer ${
                  createMode === 'text'
                    ? 'bg-white dark:bg-[#242526] text-[#1877f2] shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Type className="w-4 h-4" />
                <span>Tạo tin văn bản</span>
              </button>
            </div>

            <form onSubmit={handleCreateStorySubmit} className="space-y-4">
              {/* MODE 1: MEDIA STORY */}
              {createMode === 'media' ? (
                <>
                  <div>
                    <input
                      type="file"
                      ref={storyFileInputRef}
                      onChange={handleStoryFileSelect}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => storyFileInputRef.current?.click()}
                      disabled={uploadingMedia}
                      className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-[#4e4f50] hover:border-[#1877f2] bg-gray-50 dark:bg-[#18191a] hover:bg-blue-50/50 text-gray-700 dark:text-[#e4e6eb] font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50"
                    >
                      {uploadingMedia ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#1877f2]" />
                          <span>Đang nén & tải file lên AWS S3...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-[#1877f2]" />
                          <span>Chọn ảnh / video từ thiết bị tải lên AWS S3</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#e4e6eb] mb-1">
                      Hoặc dán URL media trực tiếp
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 text-xs bg-gray-100 dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                    />
                  </div>

                  {imageUrl.trim() && (
                    <div className="w-full h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      {imageUrl.endsWith('.mp4') || imageUrl.endsWith('.webm') ? (
                        <video src={imageUrl.trim()} controls className="w-full h-full object-contain" />
                      ) : (
                        <img src={imageUrl.trim()} alt="Preview" className="w-full h-full object-contain" />
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* MODE 2: FACEBOOK TEXT STORY WITH GRADIENT THEMES */
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#e4e6eb] mb-1">
                      Nhập văn bản tin
                    </label>
                    <textarea
                      rows={3}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Bắt đầu nhập nội dung tin của bạn..."
                      className="w-full px-3 py-2.5 text-xs bg-gray-100 dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
                    />
                  </div>

                  {/* Gradient Colors Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
                      Chọn phông nền màu sắc
                    </label>
                    <div className="flex space-x-2">
                      {GRADIENT_THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setSelectedTheme(theme)}
                          className={`w-8 h-8 rounded-full bg-gradient-to-tr ${theme.bg} cursor-pointer transition transform hover:scale-110 ${
                            selectedTheme.id === theme.id ? 'ring-3 ring-offset-2 ring-[#1877f2]' : ''
                          }`}
                          title={theme.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Live Text Story Preview */}
                  <div
                    className={`w-full h-48 rounded-xl bg-gradient-to-tr ${selectedTheme.bg} flex items-center justify-center p-4 text-center shadow-inner`}
                  >
                    <span className="text-white font-bold text-base leading-relaxed break-words line-clamp-4 drop-shadow-md">
                      {textContent.trim() || 'Nội dung tin của bạn sẽ hiển thị ở đây'}
                    </span>
                  </div>
                </div>
              )}

              {/* Form Footer */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-[#393a3b]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={
                    creating ||
                    (createMode === 'media' && !imageUrl.trim()) ||
                    (createMode === 'text' && !textContent.trim())
                  }
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-50 rounded-xl shadow transition cursor-pointer"
                >
                  {creating ? 'Đang chia sẻ tin...' : 'Chia sẻ lên tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
