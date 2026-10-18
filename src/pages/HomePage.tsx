import React, { useRef, useEffect } from 'react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { StoriesBar } from '../components/post/stories-bar';
import { CreatePostBox } from '../components/post/CreatePostBox';
import { PostCard } from '../components/post/post-card';
import { PostCardSkeleton } from '../components/post/post-card/PostCardSkeleton';
import { SeenTracker } from '../components/post/SeenTracker';
import { ChatBox, ChatUser } from '../components/chat/chat-box';
import { Post } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Flame, Clock, Sparkles, RefreshCw, AlertTriangle, FileQuestion, Loader2, CheckCircle2 } from 'lucide-react';
import { SystemAnnouncementBanner } from '../components/common/SystemAnnouncementBanner';

interface HomePageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  activeSidebarFilter: string;
  setActiveSidebarFilter: (filter: string) => void;
  feedCategory: 'all' | 'recent' | 'popular';
  setFeedCategory: (cat: 'all' | 'recent' | 'popular') => void;
  posts: Post[];
  loading: boolean;
  backendError: string | null;
  fetchFeed: (isBackground?: boolean) => void;
  onPostCreated: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onViewProfile: (userId?: string) => void;
  onNavigateSettings: () => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** Bảng tin đang gồm cả bài đã xem (mặc định chỉ có bài chưa xem). */
  includeSeen?: boolean;
  onShowSeen?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  activeNavTab,
  setActiveNavTab,
  activeSidebarFilter,
  setActiveSidebarFilter,
  feedCategory,
  setFeedCategory,
  posts,
  loading,
  backendError,
  fetchFeed,
  onPostCreated,
  onDeletePost,
  onViewProfile,
  onNavigateSettings,
  onNavigateAuth,
  activeChatUser,
  setActiveChatUser,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  includeSeen = false,
  onShowSeen,
}) => {
  const { t } = useLanguage();
  const { isAuthenticated, openLoginModal } = useAuth();
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Infinite Scroll Intersection Observer [UC-FE02]
  useEffect(() => {
    if (!onLoadMore || !hasMore || loadingMore || loading) return;

    const currentSentinel = observerRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '250px', // Pre-fetch 250px before the user hits the exact bottom
        threshold: 0.1,
      }
    );

    observer.observe(currentSentinel);

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [onLoadMore, hasMore, loadingMore, loading]);

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      {/* Fixed Header */}
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

      {/* Main Container Layout: Left Sidebar - Main Feed - Right Sidebar */}
      <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
        {/* Left Sidebar */}
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

        {/* Center Main Feed Stream */}
        <main className="flex-1 max-w-[740px] xl:max-w-[800px] 2xl:max-w-[860px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          {/* Global System Announcement Banner */}
          <SystemAnnouncementBanner />

          {/* Stories 24h Bar */}
          <StoriesBar />

          {/* Create Post Action Box */}
          <CreatePostBox onPostCreated={onPostCreated} />

          {/* Backend Error Banner if any */}
          {backendError && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl p-3.5 mb-4 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{backendError}</span>
              </div>
              <button
                onClick={() => fetchFeed(false)}
                className="px-2.5 py-1 bg-amber-600 text-white rounded-md font-bold hover:bg-amber-700 transition cursor-pointer shrink-0"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Posts Feed Stream */}
          {loading && posts.length === 0 ? (
            <div>
              {[0, 1, 2].map((i) => (
                <PostCardSkeleton key={i} withMedia={i !== 1} />
              ))}
            </div>
          ) : posts.length === 0 && !includeSeen && !backendError ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 text-center border border-gray-200 dark:border-[#393a3b] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-500 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-gray-800 dark:text-[#e4e6eb]">Bạn đã xem hết bài viết mới</h4>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto">
                Chưa có bài viết nào chưa xem. Hãy quay lại sau hoặc xem lại những bài bạn đã xem.
              </p>
              {onShowSeen && (
                <button
                  onClick={onShowSeen}
                  className="px-4 py-2 rounded-lg bg-[#1877f2] text-white text-xs font-bold hover:bg-[#166fe5] transition cursor-pointer"
                >
                  Xem lại bài đã xem
                </button>
              )}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 text-center border border-gray-200 dark:border-[#393a3b] shadow-sm space-y-3">
              <FileQuestion className="w-12 h-12 text-gray-400 mx-auto" />
              <h4 className="font-bold text-base text-gray-800 dark:text-[#e4e6eb]">Chưa có bài viết nào</h4>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto">
                Hãy là người đầu tiên chia sẻ suy nghĩ hoặc hình ảnh lên bảng tin!
              </p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <SeenTracker key={post.id} postId={post.id}>
                  <PostCard
                    post={post}
                    onDeletePost={onDeletePost}
                    onViewProfile={onViewProfile}
                  />
                </SeenTracker>
              ))}

              {/* Sentinel trigger element for infinite scrolling */}
              <div ref={observerRef} className="h-4 w-full pointer-events-none" />

              {/* Loading More Indicator */}
              {loadingMore && <PostCardSkeleton withMedia />}

              {/* End of Feed Message */}
              {!hasMore && posts.length > 0 && !loading && (
                <div className="text-center py-8 text-xs text-gray-400 dark:text-[#b0b3b8] flex flex-col items-center justify-center space-y-1.5 select-none border-t border-gray-200/60 dark:border-[#393a3b]/60 mt-4 mb-8">
                  <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-gray-700 dark:text-[#e4e6eb]">Bạn đã xem hết bài viết mới nhất</p>
                  <p className="text-[11px] text-gray-400 dark:text-[#8a8d91]">Hãy kết bạn thêm hoặc tạo bài viết mới để bảng tin thêm sôi động!</p>
                  {!includeSeen && onShowSeen && (
                    <button
                      onClick={onShowSeen}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] text-[11px] font-bold hover:bg-gray-200 dark:hover:bg-[#4e4f50] transition cursor-pointer"
                    >
                      Xem lại bài đã xem
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </main>

        {/* Right Contacts & Requests Sidebar */}
        <SidebarRight onSelectChatUser={(u) => setActiveChatUser(u)} />
      </div>
    </div>
  );
};
