import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { PostCard } from '../components/post/post-card';
import { ChatBox, ChatUser } from '../components/chat/chat-box';
import { Post } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { postService } from '../services/api';
import { Bookmark, FileQuestion, Loader2, CheckCircle2, Compass, Image, Video, Sparkles, Search, X, RefreshCw } from 'lucide-react';

interface SavedPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  activeSidebarFilter: string;
  setActiveSidebarFilter: (filter: string) => void;
  onNavigateSettings: () => void;
  onNavigateAuth: () => void;
  onViewProfile: (userId?: string) => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  activeNavTab,
  setActiveNavTab,
  activeSidebarFilter,
  setActiveSidebarFilter,
  onNavigateSettings,
  onNavigateAuth,
  onViewProfile,
  activeChatUser,
  setActiveChatUser,
}) => {
  const { t } = useLanguage();
  const observerRef = useRef<HTMLDivElement | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSavedPosts = useCallback(async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const fetched = await postService.getSavedPosts(pageNum, 15);
      if (isLoadMore) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const unique = fetched.filter((p) => !existingIds.has(p.id));
          return [...prev, ...unique];
        });
      } else {
        setPosts(fetched);
      }
      setHasMore(fetched.length >= 15);
      setPage(pageNum);
    } catch (err) {
      console.error('Fetch saved posts error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedPosts(1, false);
  }, [fetchSavedPosts]);

  // Listen to saved status changes across the app
  useEffect(() => {
    const handleSavedChange = (e: any) => {
      if (!e?.detail) return;
      const { postId, isSaved } = e.detail;
      if (!isSaved) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        // Refetch to sync recently saved post
        fetchSavedPosts(1, false);
      }
    };
    window.addEventListener('saved_posts_changed', handleSavedChange);
    return () => window.removeEventListener('saved_posts_changed', handleSavedChange);
  }, [fetchSavedPosts]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;
    const currentSentinel = observerRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          fetchSavedPosts(page + 1, true);
        }
      },
      { root: null, rootMargin: '250px', threshold: 0.1 }
    );

    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [hasMore, loadingMore, loading, page, fetchSavedPosts]);

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const isVideo = (p as any).video ||
        p.mediaList?.some((m) => m.mediaType === 'VIDEO') ||
        p.mediaUrls?.some((url) => url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i));
      const isImage = (p as any).image ||
        p.mediaList?.some((m) => m.mediaType === 'IMAGE') ||
        p.mediaUrls?.some((url) => !url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i));

      if (mediaFilter === 'video' && !isVideo) {
        return false;
      }
      if (mediaFilter === 'image' && !isImage) {
        return false;
      }

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesContent = p.content?.toLowerCase().includes(q);
        const matchesAuthor =
          p.user?.name?.toLowerCase().includes(q) ||
          p.authorName?.toLowerCase().includes(q);
        if (!matchesContent && !matchesAuthor) return false;
      }

      return true;
    });
  }, [posts, mediaFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      <Header
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab(tab);
          if (tab === 'friends') setActiveSidebarFilter('friends');
        }}
        onSelectChatUser={(u) => setActiveChatUser(u)}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onViewProfile}
        onNavigateAuth={onNavigateAuth}
      />

      <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
        <SidebarLeft
          activeFilter={activeSidebarFilter}
          onFilterChange={(filter) => {
            setActiveSidebarFilter(filter);
            if (filter === 'friends') {
              setActiveNavTab('friends');
            } else if (filter === 'groups') {
              setActiveNavTab('groups');
            } else if (filter === 'watch') {
              setActiveNavTab('watch');
            } else if (filter === 'moderation') {
              setActiveNavTab('moderation');
            } else if (filter === 'support') {
              setActiveNavTab('support');
            } else if (filter === 'saved') {
              setActiveNavTab('saved');
            } else {
              setActiveNavTab('home');
            }
          }}
          onNavigateProfile={() => onViewProfile()}
          onNavigateSettings={onNavigateSettings}
        />

        <main className="flex-1 max-w-[740px] xl:max-w-[800px] 2xl:max-w-[860px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          {/* Saved Navigation Option Pills & Right Search + Reload */}
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setMediaFilter('all')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  mediaFilter === 'all'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Tất cả</span>
                {!loading && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    mediaFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'
                  }`}>
                    {posts.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMediaFilter('image')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  mediaFilter === 'image'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Có hình ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaFilter('video')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  mediaFilter === 'video'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Có video</span>
              </button>
            </div>

            {/* Right side: Compact Soft Capsule Search Bar & Reload Button */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <div className="relative w-36 sm:w-52">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 dark:text-[#b0b3b8]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm bài đã lưu..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] cursor-pointer"
                    title="Xóa tìm kiếm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => fetchSavedPosts(1, false)}
                title="Làm mới bài đã lưu"
                className="p-2 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {loading && posts.length === 0 ? (
            <div className="flex justify-center items-center py-20 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-200 dark:border-[#393a3b] shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1877f2] flex items-center justify-center mx-auto">
                <FileQuestion className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
                  {posts.length === 0 ? 'Chưa có bài viết nào được lưu' : 'Không có bài viết phù hợp'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-md mx-auto leading-relaxed">
                  {posts.length === 0
                    ? 'Khi lướt bảng tin, hãy nhấn vào biểu tượng ba chấm ở góc trên bài viết bất kỳ và chọn "Lưu bài viết" để lưu trữ và xem lại tại đây.'
                    : 'Không tìm thấy bài viết nào trong danh mục đã chọn. Hãy thử chọn mục "Tất cả".'}
                </p>
              </div>

              {posts.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveNavTab('home')}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#1877f2] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Khám phá bảng tin ngay</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMediaFilter('all')}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <span>Xem tất cả bài viết</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDeletePost={handleDeletePost}
                  onViewProfile={onViewProfile}
                />
              ))}

              <div ref={observerRef} className="h-4 w-full pointer-events-none" />

              {loadingMore && (
                <div className="flex items-center justify-center py-6 space-x-2.5 text-gray-500 dark:text-[#b0b3b8] bg-white/40 dark:bg-[#242526]/40 rounded-xl my-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#1877f2]" />
                  <span className="text-xs font-semibold">Đang tải thêm bài viết đã lưu...</span>
                </div>
              )}

              {!hasMore && posts.length > 0 && !loading && (
                <div className="text-center py-8 text-xs text-gray-400 dark:text-[#b0b3b8] flex flex-col items-center justify-center space-y-1.5 select-none border-t border-gray-200/60 dark:border-[#393a3b]/60 mt-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-[#e4e6eb]">
                    Bạn đã xem hết các bài viết đã lưu
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        <SidebarRight onSelectChatUser={(u) => setActiveChatUser(u)} />
      </div>
    </div>
  );
};
