import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { PostCard } from '../components/post/post-card';
import { ChatBox, ChatUser } from '../components/chat/chat-box';
import { Post } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { postService } from '../services/api';
import { FileQuestion, Loader2, CheckCircle2, PlaySquare, Flame, Clock, RefreshCw, Search, X } from 'lucide-react';

interface WatchPageProps {
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

export const WatchPage: React.FC<WatchPageProps> = ({
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [activeWatchTab, setActiveWatchTab] = useState<'for_you' | 'trending' | 'recent'>('for_you');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchWatchFeed = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await postService.getWatchFeed(1, 10, isLoadMore ? cursor : null);
      if (isLoadMore) {
        setPosts((prev) => {
          const newPosts = res.posts.filter((p) => !prev.some((exist) => exist.id === p.id));
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(res.posts);
      }
      setHasMore(!res.last);
      setCursor(res.nextCursor || null);
    } catch (err) {
      console.error('Fetch watch error:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchWatchFeed();
  }, []);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;
    const currentSentinel = observerRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          fetchWatchFeed(true);
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
  }, [hasMore, loadingMore, loading, cursor]);

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((p) => p.id !== postId));
  };

  const displayedPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const q = searchTerm.toLowerCase();
    return posts.filter(
      (p) =>
        p.content?.toLowerCase().includes(q) ||
        p.user?.name?.toLowerCase().includes(q) ||
        p.authorName?.toLowerCase().includes(q)
    );
  }, [posts, searchTerm]);

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
            } else if (filter === 'saved') {
              setActiveNavTab('saved');
            } else {
              setActiveNavTab('home');
            }
          }}
          onNavigateProfile={() => onViewProfile()}
          onNavigateSettings={onNavigateSettings}
        />

        <main className="flex-1 min-w-0 max-w-[740px] xl:max-w-[800px] 2xl:max-w-[860px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          
          {/* Watch Navigation Option Pills & Right Search + Reload */}
          <div className="mb-4 space-y-2.5">
            {/* Row 1: Search Bar on Left, Reload Button alongside on the same row */}
            <div className="flex items-center gap-2">
              <div className="relative w-64 sm:w-80 max-w-[calc(100%-3rem)]">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 dark:text-[#b0b3b8]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm video..."
                  className="w-full pl-8 pr-7 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition"
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
                onClick={() => fetchWatchFeed()}
                title="Làm mới video"
                className="p-2 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Row 2: Option Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveWatchTab('for_you')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  activeWatchTab === 'for_you'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <PlaySquare className="w-4 h-4" />
                <span>Dành cho bạn</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWatchTab('trending')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  activeWatchTab === 'trending'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Thịnh hành</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveWatchTab('recent')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  activeWatchTab === 'recent'
                    ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                    : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Mới nhất</span>
              </button>
            </div>
          </div>

          {loading && posts.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 text-center border border-gray-200 dark:border-[#393a3b] shadow-sm space-y-3">
              <FileQuestion className="w-12 h-12 text-gray-400 mx-auto" />
              <h4 className="font-bold text-base text-gray-800 dark:text-[#e4e6eb]">
                {searchTerm ? 'Không tìm thấy video phù hợp' : 'Chưa có video nào'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto">
                {searchTerm
                  ? 'Hãy thử tìm kiếm với từ khóa khác.'
                  : 'Hiện tại không có bài viết nào chứa video trên hệ thống.'}
              </p>
            </div>
          ) : (
            <>
              {displayedPosts.map((post) => (
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
                  <Loader2 className="w-5 h-5 border-[#2d88ff] animate-spin text-[#2d88ff]" />
                  <span className="text-xs font-semibold">Đang tải thêm video...</span>
                </div>
              )}

              {!hasMore && posts.length > 0 && !loading && (
                <div className="text-center py-8 text-xs text-gray-400 dark:text-[#b0b3b8] flex flex-col items-center justify-center space-y-1.5 select-none border-t border-gray-200/60 dark:border-[#393a3b]/60 mt-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-[#e4e6eb]">Bạn đã xem hết video</p>
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
