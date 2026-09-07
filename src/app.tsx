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
import { AuthPage } from './components/AuthPage';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { postService } from './services/api';
import { Post } from './types';
import { Home, Tv, Store, Users, Flame, Clock, Sparkles, RefreshCw, AlertTriangle, FileQuestion, LogIn } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [viewMode, setViewMode] = useState<'app' | 'auth'>('app');
  const [activeNavTab, setActiveNavTab] = useState<string>('home');
  const [activeSidebarFilter, setActiveSidebarFilter] = useState<string>('all');
  const [feedCategory, setFeedCategory] = useState<'all' | 'recent' | 'popular'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);

  const fetchFeed = async () => {
    setLoading(true);
    setBackendError(null);
    try {
      const feedData = await postService.getFeed();
      setPosts(feedData);
    } catch (e: any) {
      console.error('Error fetching feed:', e);
      setPosts([]);
      setBackendError('Chưa kết nối được máy chủ Backend API Gateway (port 8080). Hãy bật Backend để tải dữ liệu thật!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  // If user navigated to explicit Auth page
  if (viewMode === 'auth') {
    return <AuthPage onGoHome={() => setViewMode('app')} />;
  }

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleSelectChatUser = (chatUser: ChatUser) => {
    setActiveChatUser(chatUser);
  };

  const handleTabChange = (tab: string) => {
    setViewMode('app');
    setActiveNavTab(tab);
  };

  // Filter posts based on active category
  let displayedPosts = [...posts];
  if (feedCategory === 'recent') {
    displayedPosts = [...posts].reverse();
  } else if (feedCategory === 'popular') {
    displayedPosts = [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-slate-100 transition-colors duration-200 pb-16 md:pb-0">
      {/* Top Fixed Header */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onSelectChatUser={handleSelectChatUser}
        onNavigateSettings={() => {
          setViewMode('app');
          setActiveNavTab('settings');
        }}
        onNavigateAuth={() => setViewMode('auth')}
      />

      {activeNavTab === 'settings' ? (
        <div className="pt-14">
          <SettingsView />
        </div>
      ) : (
        <div className="flex pt-14 justify-between max-w-7xl mx-auto px-0 md:px-4">
          {/* Left Sidebar - Only rendered if authenticated */}
          {isAuthenticated && (
            <SidebarLeft
              activeFilter={activeSidebarFilter}
              onFilterChange={(filter) => setActiveSidebarFilter(filter)}
            />
          )}

          {/* Main Feed Center Content */}
          <main className="flex-1 max-w-2xl px-3 sm:px-4 py-6 mx-auto w-full">
            {/* Non-authenticated Guest Welcome Bar */}
            {!isAuthenticated && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 mb-4 text-white shadow-lg flex items-center justify-between">
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
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 mb-4 flex items-center justify-between text-amber-800 dark:text-amber-200 text-xs font-semibold shadow-sm">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span>{backendError}</span>
                </div>
                <button
                  onClick={fetchFeed}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex-shrink-0 transition cursor-pointer"
                >
                  Thử lại
                </button>
              </div>
            )}

            {activeNavTab === 'home' && (
              <>
                {/* Stories Carousel */}
                <StoriesBar />

                {/* Create Post Box */}
                <div className="mt-4">
                  <CreatePostBox onPostCreated={handlePostCreated} />
                </div>

                {/* Feed Filter Pill Buttons */}
                <div className="flex items-center justify-between mb-4 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setFeedCategory('all')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        feedCategory === 'all'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Tất cả</span>
                    </button>
                    <button
                      onClick={() => setFeedCategory('recent')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        feedCategory === 'recent'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mới nhất</span>
                    </button>
                    <button
                      onClick={() => setFeedCategory('popular')}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        feedCategory === 'popular'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Nổi bật</span>
                    </button>
                  </div>

                  <button
                    onClick={fetchFeed}
                    className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-slate-200 transition"
                    title="Làm mới bảng tin từ API"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Feed Posts Listing */}
                {loading ? (
                  <div className="flex items-center justify-center py-16 space-x-3 text-gray-500 dark:text-slate-400 text-sm">
                    <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="font-semibold">Đang tải bảng tin từ Backend API...</span>
                  </div>
                ) : displayedPosts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl text-center border border-gray-200 dark:border-slate-700 shadow-sm space-y-3">
                    <FileQuestion className="w-12 h-12 text-gray-300 mx-auto" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-slate-200">Chưa có bài viết nào</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                      Hiện tại bảng tin chưa có dữ liệu từ Backend. Hãy là người đầu tiên tạo bài viết!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeNavTab === 'watch' && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center border border-gray-200 dark:border-slate-700 shadow-sm my-6">
                <Tv className="w-16 h-16 text-blue-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Kênh Watch & Video</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Khám phá các video ngắn, livestream và chương trình giải trí hấp dẫn.
                </p>
              </div>
            )}

            {activeNavTab === 'marketplace' && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center border border-gray-200 dark:border-slate-700 shadow-sm my-6">
                <Store className="w-16 h-16 text-blue-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Chợ Mua Bán Marketplace</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Mua bán đồ dùng, thiết bị điện tử trong khu vực của bạn.
                </p>
              </div>
            )}

            {activeNavTab === 'groups' && (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl text-center border border-gray-200 dark:border-slate-700 shadow-sm my-6">
                <Users className="w-16 h-16 text-blue-600 mx-auto mb-3 animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100">Cộng Đồng & Nhóm</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Gia nhập các nhóm sở thích và học tập.
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