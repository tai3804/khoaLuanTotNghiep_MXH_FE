import React, { useRef, useEffect, useState } from 'react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { PostCard } from '../components/post/post-card';
import { ChatBox, ChatUser } from '../components/chat/chat-box';
import { Post } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { postService } from '../services/api';
import { FileQuestion, Loader2, CheckCircle2, PlaySquare } from 'lucide-react';

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
            if (filter === 'friends' || filter === 'groups') {
              setActiveNavTab('friends');
            } else if (filter === 'watch') {
              setActiveNavTab('watch');
            } else {
              setActiveNavTab('home');
            }
          }}
          onNavigateProfile={() => onViewProfile()}
          onNavigateSettings={onNavigateSettings}
        />

        <main className="flex-1 max-w-[680px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          
          <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm p-4 mb-4 border border-gray-200 dark:border-[#393a3b] flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#1877f2]">
              <PlaySquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">Watch</h2>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">Video mới nhất dành cho bạn</p>
            </div>
          </div>

          {loading && posts.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 text-center border border-gray-200 dark:border-[#393a3b] shadow-sm space-y-3">
              <FileQuestion className="w-12 h-12 text-gray-400 mx-auto" />
              <h4 className="font-bold text-base text-gray-800 dark:text-[#e4e6eb]">Chưa có video nào</h4>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto">
                Hiện tại không có bài viết nào chứa video trên hệ thống.
              </p>
            </div>
          ) : (
            <>
              {posts.map((post) => (
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

      {activeChatUser && (
        <ChatBox
          key={activeChatUser.userId || activeChatUser.id}
          friend={activeChatUser}
          onClose={() => setActiveChatUser(null)}
          onNavigateProfile={onViewProfile}
        />
      )}
    </div>
  );
};
