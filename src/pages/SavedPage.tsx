import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { PostCard } from '../components/post/post-card';
import { ChatBox, ChatUser } from '../components/chat/chat-box';
import { Post } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { postService } from '../services/api';
import { Bookmark, FileQuestion, Loader2, CheckCircle2, Compass, Image, Video, Sparkles } from 'lucide-react';

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

      if (mediaFilter === 'video') {
        return Boolean(isVideo);
      }
      if (mediaFilter === 'image') {
        return Boolean(isImage);
      }
      return true;
    });
  }, [posts, mediaFilter]);

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

        <main className="flex-1 max-w-[680px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          {/* Header Banner Card */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm p-4 sm:p-5 mb-4 border border-gray-200 dark:border-[#393a3b] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 shrink-0">
                  <Bookmark className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight">
                    {t('saved') || 'Mục đã lưu'}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                    Tất cả các bài viết bạn đã lưu để xem lại sau
                  </p>
                </div>
              </div>

              {!loading && (
                <div className="px-3 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-full text-xs font-semibold shrink-0">
                  {posts.length} bài viết
                </div>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-100 dark:border-[#393a3b]">
              <button
                type="button"
                onClick={() => setMediaFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                  mediaFilter === 'all'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                    : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-200 dark:hover:bg-[#4e4f50]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tất cả</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('image')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                  mediaFilter === 'image'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                    : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-200 dark:hover:bg-[#4e4f50]'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Có hình ảnh</span>
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('video')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                  mediaFilter === 'video'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                    : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-200 dark:hover:bg-[#4e4f50]'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Có video</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          {loading && posts.length === 0 ? (
            <div className="flex justify-center items-center py-20 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-200 dark:border-[#393a3b] shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center mx-auto">
                <FileQuestion className="w-8 h-8" />
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
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
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
            <>
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
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
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
            </>
          )}
        </main>

        <SidebarRight onSelectChatUser={(u) => setActiveChatUser(u)} />
      </div>
    </div>
  );
};
