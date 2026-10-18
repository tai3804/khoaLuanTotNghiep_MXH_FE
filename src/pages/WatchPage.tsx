import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { PostCard } from '../components/post/post-card';
import { ChatBox, ChatUser } from '../components/chat/chat-box';
import { Post } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { postService } from '../services/api';
import { withoutHiddenPosts } from '../utils/hiddenPosts';
import { SeenTracker } from '../components/post/SeenTracker';
import { FileQuestion, Loader2, CheckCircle2, PlaySquare } from 'lucide-react';
import { WatchFilterBar, WatchTabType } from '../components/watch/WatchFilterBar';

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
  // Mặc định chỉ có video chưa xem; bấm "Xem lại video đã xem" để lấy cả video đã xem
  const [includeSeen, setIncludeSeen] = useState(false);

  const fetchWatchFeed = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await postService.getWatchFeed(1, 10, isLoadMore ? cursor : null, !includeSeen);
      // Video người dùng đã chọn "Ẩn bài viết" cũng không hiện lại ở trang Video
      const visible = withoutHiddenPosts(res.posts);
      if (isLoadMore) {
        setPosts((prev) => {
          const newPosts = visible.filter((p) => !prev.some((exist) => exist.id === p.id));
          return [...prev, ...newPosts];
        });
      } else {
        setPosts(visible);
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
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    fetchWatchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeSeen]);

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
    let result = [...posts];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.content?.toLowerCase().includes(q) ||
          (p as any).user?.name?.toLowerCase().includes(q) ||
          p.authorName?.toLowerCase().includes(q)
      );
    }

    if (activeWatchTab === 'trending') {
      // Ưu tiên video thịnh hành: video được gắn mác Trending hoặc có tổng điểm tương tác (like, comment, share) cao nhất
      result.sort((a, b) => {
        if (a.isTrending && !b.isTrending) return -1;
        if (!a.isTrending && b.isTrending) return 1;
        const scoreA = (a.likesCount || 0) + (a.commentsCount || 0) * 2 + (a.sharesCount || 0) * 3;
        const scoreB = (b.likesCount || 0) + (b.commentsCount || 0) * 2 + (b.sharesCount || 0) * 3;
        return scoreB - scoreA;
      });
    } else if (activeWatchTab === 'recent') {
      // Mới nhất: Sắp xếp theo mốc thời gian đăng gần nhất
      result.sort((a, b) => {
        const timeA = new Date(a.createdAtRaw || a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAtRaw || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    }
    // 'for_you': Giữ nguyên thứ tự đề xuất tự nhiên của luồng video từ hệ thống

    return result;
  }, [posts, searchTerm, activeWatchTab]);

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
          
          {/* Watch Navigation Option Pills & Search Filter */}
          <WatchFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onClearSearch={() => setSearchTerm('')}
            loading={loading}
            onRefresh={() => fetchWatchFeed()}
            activeWatchTab={activeWatchTab}
            onSelectTab={setActiveWatchTab}
          />

          {loading && posts.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
            </div>
) : displayedPosts.length === 0 && posts.length === 0 && !includeSeen ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 text-center border border-gray-200 dark:border-[#393a3b] shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center text-green-500 mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-base text-gray-800 dark:text-[#e4e6eb]">Bạn đã xem hết video mới</h4>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto">
                Chưa có video nào chưa xem. Hãy quay lại sau hoặc xem lại những video bạn đã xem.
              </p>
              <button
                onClick={() => setIncludeSeen(true)}
                className="px-4 py-2 rounded-lg bg-[#1877f2] text-white text-xs font-bold hover:bg-[#166fe5] transition cursor-pointer"
              >
                Xem lại video đã xem
              </button>
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
                <SeenTracker key={post.id} postId={post.id}>
                  <PostCard
                    post={post}
                    onDeletePost={handleDeletePost}
                    onViewProfile={onViewProfile}
                  />
                </SeenTracker>
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
                  {!includeSeen && (
                    <button
                      onClick={() => setIncludeSeen(true)}
                      className="mt-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] text-[11px] font-bold hover:bg-gray-200 dark:hover:bg-[#4e4f50] transition cursor-pointer"
                    >
                      Xem lại video đã xem
                    </button>
                  )}
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
