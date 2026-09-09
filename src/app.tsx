import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { StoriesBar } from './components/StoriesBar';
import { CreatePostBox } from './components/CreatePostBox';
import { PostCard } from './components/PostCard';
import { LoginModal } from './components/LoginModal';
import { ChatBox, ChatUser } from './components/ChatBox';
import { SettingsView } from './components/SettingsView';
import { FriendsView } from './components/FriendsView';
import { ProfileView } from './components/ProfileView';
import { AuthPage } from './components/AuthPage';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { postService } from './services/api';
import { Post } from './types';
import { Home, Tv, Store, Users, Flame, Clock, Sparkles, RefreshCw, AlertTriangle, FileQuestion, LogIn, Gamepad2 } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [viewMode, setViewMode] = useState<'app' | 'auth'>('app');
  const [activeNavTab, setActiveNavTab] = useState<string>('home');
  const [activeSidebarFilter, setActiveSidebarFilter] = useState<string>('all');
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [feedCategory, setFeedCategory] = useState<'all' | 'recent' | 'popular'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);

  const fetchFeed = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setBackendError(null);
    }
    try {
      const feedData = await postService.getFeed();
      if (Array.isArray(feedData) && feedData.length > 0) {
        setPosts((prevPosts) => {
          if (prevPosts.length === 0) return feedData;
          // Merge in-place to preserve scroll position and update like/comment counts in real-time
          const prevMap = new Map(prevPosts.map((p) => [p.id, p]));
          const merged = feedData.map((newP) => {
            const existing = prevMap.get(newP.id);
            if (!existing) return newP;
            return {
              ...existing,
              likesCount: newP.likesCount,
              commentsCount: newP.commentsCount,
              sharesCount: newP.sharesCount,
              content: newP.content,
              authorName: newP.authorName || existing.authorName,
              authorAvatar: newP.authorAvatar || existing.authorAvatar,
            };
          });
          // Also include any optimistic posts created locally that haven't appeared in feedData yet
          const newIds = new Set(feedData.map((p) => p.id));
          const localOnly = prevPosts.filter((p) => !newIds.has(p.id) && String(p.id).startsWith('post-'));
          return [...localOnly, ...merged];
        });
      }
    } catch (e: any) {
      if (!isBackground) {
        console.error('Error fetching feed:', e);
        setPosts([]);
        if (e?.response?.status !== 401 && e?.response?.status !== 403) {
          setBackendError('Chưa kết nối được máy chủ Backend API Gateway (port 8080). Hãy bật Backend để tải dữ liệu thật!');
        }
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFeed();

    // Real-time Feed Sync every 4 seconds in the background
    const realtimeTimer = setInterval(() => {
      fetchFeed(true);
    }, 4000);

    return () => clearInterval(realtimeTimer);
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && viewMode === 'auth') {
      setViewMode('app');
      setActiveNavTab('home');
    }
  }, [isAuthenticated, viewMode]);

  // If user navigated to explicit Auth page
  if (viewMode === 'auth') {
    return (
      <AuthPage
        onGoHome={() => {
          setViewMode('app');
          setActiveNavTab('home');
        }}
      />
    );
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleSelectChatUser = (chatUser: ChatUser) => {
    setActiveChatUser(chatUser);
  };

  const handleTabChange = (tab: string) => {
    setViewMode('app');
    setActiveNavTab(tab);
    if (tab === 'home') {
      setActiveSidebarFilter('all');
      setProfileUserId(null);
    } else if (tab === 'friends') {
      setActiveSidebarFilter('friends');
      setProfileUserId(null);
    }
  };

  const handleViewProfile = (userId?: string) => {
    setViewMode('app');
    setProfileUserId(userId || null);
    setActiveNavTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter posts based on active category
  let displayedPosts = [...posts];
  if (feedCategory === 'recent') {
    displayedPosts = [...posts].reverse();
  } else if (feedCategory === 'popular') {
    displayedPosts = [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
  }

  const isFriendsView = activeNavTab === 'friends' || activeSidebarFilter === 'friends' || activeNavTab === 'groups';

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-[#050505] dark:text-[#e4e6eb] transition-colors duration-150 pb-16 md:pb-0">
      {/* Top Fixed Header */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onSelectChatUser={handleSelectChatUser}
        onNavigateSettings={() => {
          setViewMode('app');
          setActiveNavTab('settings');
        }}
        onNavigateProfile={(uid) => handleViewProfile(uid)}
        onNavigateAuth={() => setViewMode('auth')}
      />

      {activeNavTab === 'settings' ? (
        <div className="pt-14">
          <SettingsView />
        </div>
      ) : activeNavTab === 'profile' ? (
        <div className="pt-14">
          <ProfileView
            userId={profileUserId}
            onSelectChatUser={handleSelectChatUser}
            onViewProfile={handleViewProfile}
          />
        </div>
      ) : isFriendsView ? (
        <div className="pt-14 w-full min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">
          <FriendsView
            onSelectChatUser={handleSelectChatUser}
            onViewProfile={handleViewProfile}
          />
        </div>
      ) : (
        <div className="flex pt-14 justify-center lg:justify-between w-full max-w-[1920px] mx-auto">
          {/* Left Sidebar - Only rendered if authenticated */}
          {isAuthenticated && (
            <SidebarLeft
              activeFilter={activeSidebarFilter}
              onFilterChange={(filter) => {
                if (filter === 'friends') {
                  handleTabChange('friends');
                } else if (filter === 'watch') {
                  handleTabChange('watch');
                } else if (filter === 'marketplace') {
                  handleTabChange('marketplace');
                } else if (filter === 'groups') {
                  handleTabChange('groups');
                } else if (filter === 'gaming') {
                  handleTabChange('gaming');
                } else if (filter === 'settings') {
                  setViewMode('app');
                  setActiveNavTab('settings');
                } else {
                  setActiveSidebarFilter(filter);
                  setActiveNavTab('home');
                }
              }}
              onNavigateProfile={() => handleViewProfile()}
              onNavigateSettings={() => {
                setViewMode('app');
                setActiveNavTab('settings');
              }}
            />
          )}

          {/* Main Feed Center Content with Facebook proportions */}
          <main className="flex-1 min-w-0 max-w-[680px] px-2 sm:px-4 py-4 mx-auto w-full space-y-4">
            {/* Non-authenticated Guest Welcome Bar */}
            {!isAuthenticated && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 mb-4 text-white shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                    👋
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      Chào mừng bạn đến với KLTN Social!
                    </h4>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Bạn có thể xem thông tin bài viết công khai. Đăng nhập để thích, bình luận và tạo bài viết mới!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewMode('auth')}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex-shrink-0 cursor-pointer flex items-center space-x-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('login') || 'Đăng nhập'}</span>
                </button>
              </div>
            )}

            {/* Backend Connection Warning Notice */}
            {backendError && (
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 mb-4 flex items-center justify-between text-amber-800 dark:text-amber-200 text-xs font-semibold shadow-sm">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>{backendError}</span>
                </div>
                <button
                  onClick={() => fetchFeed(false)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex-shrink-0 transition cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            )}

            {activeNavTab === 'home' && (
              <>
                {/* 1. Stories Bar (Tạo tin & hiển thị tin thật) */}
                <StoriesBar />

                {/* 2. Create Post Box on Top */}
                <CreatePostBox onPostCreated={handlePostCreated} />

                {/* 3. Feed Filter Pill Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 bg-white dark:bg-[#242526] p-1.5 sm:p-2 rounded-xl border border-gray-200 dark:border-[#393a3b] shadow-sm">
                  <div className="flex items-center space-x-1 overflow-x-auto">
                    <button
                      onClick={() => setFeedCategory('all')}
                      className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        feedCategory === 'all'
                          ? 'bg-[#1877f2] text-white shadow-sm'
                          : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tất cả</span>
                    </button>
                    <button
                      onClick={() => setFeedCategory('recent')}
                      className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        feedCategory === 'recent'
                          ? 'bg-[#1877f2] text-white shadow-sm'
                          : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mới nhất</span>
                    </button>
                    <button
                      onClick={() => setFeedCategory('popular')}
                      className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        feedCategory === 'popular'
                          ? 'bg-[#1877f2] text-white shadow-sm'
                          : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Nổi bật</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Trực tiếp</span>
                    </span>
                    <span className="text-[11px] sm:text-xs text-gray-500 dark:text-[#b0b3b8] font-semibold bg-gray-100 dark:bg-[#3a3b3c] px-2.5 py-1 rounded-full">
                      {displayedPosts.length} bài viết
                    </span>
                    <button
                      onClick={() => fetchFeed(false)}
                      className="p-1.5 text-gray-400 hover:text-[#1877f2] dark:hover:text-[#e4e6eb] transition rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
                      title="Làm mới bảng tin từ API"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Feed Posts Listing */}
                {loading ? (
                  <div className="flex items-center justify-center py-16 space-x-3 text-gray-500 dark:text-[#b0b3b8] text-sm">
                    <div className="w-6 h-6 border-3 border-[#1877f2] border-t-transparent rounded-full animate-spin" />
                    <span className="font-semibold">Đang tải bảng tin từ Backend API...</span>
                  </div>
                ) : displayedPosts.length === 0 ? (
                  <div className="bg-white dark:bg-[#242526] p-10 rounded-2xl text-center border border-gray-200 dark:border-[#393a3b] shadow-sm space-y-3">
                    <FileQuestion className="w-12 h-12 text-gray-400 dark:text-[#b0b3b8] mx-auto" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb]">Chưa có bài viết nào</h3>
                    <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-sm mx-auto">
                      Hiện tại bảng tin chưa có dữ liệu từ Backend. Hãy là người đầu tiên tạo bài viết!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onDeletePost={handlePostDeleted}
                        onViewProfile={handleViewProfile}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeNavTab === 'watch' && (
              <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl text-center border border-gray-200 dark:border-[#393a3b] shadow-sm my-4">
                <Tv className="w-16 h-16 text-[#1877f2] mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">Kênh Watch & Video</h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1 max-w-md mx-auto">
                  Khám phá các video ngắn, livestream và chương trình giải trí hấp dẫn.
                </p>
              </div>
            )}

            {activeNavTab === 'marketplace' && (
              <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl text-center border border-gray-200 dark:border-[#393a3b] shadow-sm my-4">
                <Store className="w-16 h-16 text-[#1877f2] mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">Chợ Mua Bán Marketplace</h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1 max-w-md mx-auto">
                  Mua bán đồ dùng, thiết bị điện tử trong khu vực của bạn.
                </p>
              </div>
            )}

            {activeNavTab === 'groups' && (
              <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl text-center border border-gray-200 dark:border-[#393a3b] shadow-sm my-4">
                <Users className="w-16 h-16 text-[#1877f2] mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">Cộng Đồng & Nhóm</h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1 max-w-md mx-auto">
                  Gia nhập các nhóm sở thích và học tập.
                </p>
              </div>
            )}

            {activeNavTab === 'gaming' && (
              <div className="bg-white dark:bg-[#242526] p-8 rounded-2xl text-center border border-gray-200 dark:border-[#393a3b] shadow-sm my-4">
                <Gamepad2 className="w-16 h-16 text-[#1877f2] mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">Trò Chơi & Giải Trí</h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1 max-w-md mx-auto">
                  Chơi game cùng bạn bè và kết nối với cộng đồng.
                </p>
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <SidebarRight onSelectChatUser={handleSelectChatUser} />
        </div>
      )}

      {/* Floating Active ChatBox */}
      {activeChatUser && (
        <ChatBox friend={activeChatUser} onClose={() => setActiveChatUser(null)} />
      )}

      {/* Global Login Modal */}
      <LoginModal />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 h-14 flex items-center justify-around md:hidden z-40 shadow-lg">
        <button
          onClick={() => handleTabChange('home')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeNavTab === 'home' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Trang chủ</span>
        </button>
        <button
          onClick={() => handleTabChange('watch')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeNavTab === 'watch' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Watch</span>
        </button>
        <button
          onClick={() => handleTabChange('marketplace')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeNavTab === 'marketplace' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Chợ</span>
        </button>
        <button
          onClick={() => handleTabChange('groups')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeNavTab === 'groups' ? 'text-blue-600' : 'text-gray-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Nhóm</span>
        </button>
      </nav>
    </div>
  );
};

export default App;