import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ChatUser } from './components/chat/chat-box';
import { ChatPopupContainer } from './components/chat/ChatPopupContainer';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useSystemConfig } from './context/SystemConfigContext';
import { MaintenanceScreen } from './components/common/MaintenanceScreen';
import { postService } from './services/api';
import { Post, FeedMode } from './types';
import { Home, Tv, Users, UsersRound } from 'lucide-react';
import { CallManager } from './components/call/CallManager';
import { HostLiveStudioModal } from './components/live-studio';
import { AiSocialChatWidget } from './components/ai/AiSocialChatWidget';
import { HashtagFeedModal } from './components/post/hashtag';

// Các trang còn lại được tách thành file riêng và chỉ tải khi người dùng thực sự vào trang đó
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const CreatorDashboardPage = lazy(() => import('./pages/CreatorDashboardPage').then((m) => ({ default: m.CreatorDashboardPage })));
const FriendsPage = lazy(() => import('./pages/FriendsPage').then((m) => ({ default: m.FriendsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then((m) => ({ default: m.AuthPage })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const WatchPage = lazy(() => import('./pages/WatchPage').then((m) => ({ default: m.WatchPage })));
const GroupsPage = lazy(() => import('./pages/GroupsPage').then((m) => ({ default: m.GroupsPage })));
const GroupDetailPage = lazy(() => import('./pages/GroupDetailPage').then((m) => ({ default: m.GroupDetailPage })));
const ModeratorPage = lazy(() => import('./pages/ModeratorPage').then((m) => ({ default: m.ModeratorPage })));
const SupportInboxPage = lazy(() => import('./pages/SupportInboxPage').then((m) => ({ default: m.SupportInboxPage })));
const SavedPage = lazy(() => import('./pages/SavedPage').then((m) => ({ default: m.SavedPage })));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage').then((m) => ({ default: m.PostDetailPage })));

// Tab của bảng tin -> cách xếp hạng ở máy chủ: Tất cả = độ liên quan, Mới nhất = thời gian, Nổi bật = tốc độ tương tác
const FEED_MODE_BY_CATEGORY: Record<'all' | 'recent' | 'popular', FeedMode> = {
  all: 'relevance',
  recent: 'recent',
  popular: 'trending',
};

const RouteFallback: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent dark:border-blue-400" />
  </div>
);

export const App: React.FC = () => {
  const { isAuthenticated, tokens, user } = useAuth();
  const { isMaintenance } = useSystemConfig();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSidebarFilter, setActiveSidebarFilter] = useState<string>('all');
  const [feedCategory, setFeedCategory] = useState<'all' | 'recent' | 'popular'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [activeChatUsers, setActiveChatUsers] = useState<ChatUser[]>([]);

  const handleOpenChatUser = (targetUser: ChatUser | null) => {
    if (!targetUser) return;
    setActiveChatUsers((prev) => {
      const targetId = String(targetUser.userId || targetUser.id || targetUser.conversationId);
      const filtered = prev.filter((u) => String(u.userId || u.id || u.conversationId) !== targetId);
      const maxAllowed = window.innerWidth >= 1440 ? 3 : window.innerWidth >= 960 ? 2 : 1;
      return [targetUser, ...filtered].slice(0, maxAllowed);
    });
  };

  const handleCloseChatUser = (targetId: string) => {
    setActiveChatUsers((prev) => prev.filter((u) => String(u.userId || u.id || u.conversationId) !== String(targetId)));
  };

  useEffect(() => {
    const handleGlobalOpenChat = (e: any) => {
      if (e?.detail) {
        handleOpenChatUser(e.detail);
      }
    };
    window.addEventListener('open_chat_user', handleGlobalOpenChat);
    return () => window.removeEventListener('open_chat_user', handleGlobalOpenChat);
  }, []);

  const activeChatUser = activeChatUsers[0] || null;
  const setActiveChatUser = (u: ChatUser | null) => {
    if (u) handleOpenChatUser(u);
  };

  // Sync activeNavTab from URL path
  const path = location.pathname;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  // Mỗi lần tải lại bảng tin (đổi tab, làm mới) tăng số này; phản hồi của lần tải cũ đến muộn sẽ bị bỏ qua
  const feedRequestRef = useRef(0);

  const isPostHidden = (postId: string) => {
    try {
      return (JSON.parse(localStorage.getItem('kltn_hidden_post_ids') || '[]') as string[]).includes(String(postId));
    } catch {
      return false;
    }
  };

  let activeNavTab = 'home';
  if (path.startsWith('/profile/creator-dashboard')) activeNavTab = 'creator-dashboard';
  else if (path.startsWith('/settings')) activeNavTab = 'settings';
  else if (path.startsWith('/profile')) activeNavTab = 'profile';
  else if (path.startsWith('/friends')) activeNavTab = 'friends';
  else if (path.startsWith('/watch')) activeNavTab = 'watch';
  else if (path.startsWith('/groups')) activeNavTab = 'groups';
  else if (path.startsWith('/saved')) activeNavTab = 'saved';
  else if (path.startsWith('/moderation') || path.startsWith('/admin')) activeNavTab = 'moderation';
  else if (path.startsWith('/support-inbox')) activeNavTab = 'support';

  useEffect(() => {
    if (path === '/') setActiveSidebarFilter('home');
    else if (path.startsWith('/profile/creator-dashboard')) setActiveSidebarFilter('creator-dashboard');
    else if (path.startsWith('/friends')) setActiveSidebarFilter('friends');
    else if (path.startsWith('/groups')) setActiveSidebarFilter('groups');
    else if (path.startsWith('/watch')) setActiveSidebarFilter('watch');
    else if (path.startsWith('/saved')) setActiveSidebarFilter('saved');
    else if (path.startsWith('/support-inbox')) setActiveSidebarFilter('support');
    else if (path.startsWith('/moderation') || path.startsWith('/admin')) setActiveSidebarFilter('moderation');
    else if (path.startsWith('/settings')) setActiveSidebarFilter('settings');
  }, [path]);

  const fetchFeed = async (isBackground = false) => {
    const requestId = ++feedRequestRef.current;
    if (!isBackground) {
      setLoading(true);
      setBackendError(null);
    }
    try {
      // Fetch first page (10 posts) [UC-FE02]
      const pagedRes = await postService.getFeedPaged(1, 10, null, FEED_MODE_BY_CATEGORY[feedCategory]);
      if (requestId !== feedRequestRef.current) return; // đã đổi tab/làm mới trong lúc chờ
      const feedData = pagedRes.posts.filter((post) => !isPostHidden(post.id));

      if (!isBackground) {
        setPosts(feedData);
        setCurrentPage(1);
        setCursor(pagedRes.nextCursor || null);
        setHasMore(!pagedRes.last);
      } else {
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
            // Keep posts from subsequent pages that the user has scrolled to
            const feedIds = new Set(feedData.map((p) => p.id));
            const olderPosts = prevPosts.filter((p) => !feedIds.has(p.id));
            return [...merged, ...olderPosts];
          });
        }
      }
    } catch (e: any) {
      if (requestId !== feedRequestRef.current) return;
      if (!isBackground) {
        console.error('Error fetching feed:', e);
        setPosts([]);
        if (e?.response?.status !== 401 && e?.response?.status !== 403) {
          setBackendError('Chưa kết nối được máy chủ Backend API Gateway (port 8080). Hãy bật Backend để tải dữ liệu thật!');
        }
      }
    } finally {
      if (!isBackground && requestId === feedRequestRef.current) {
        setLoading(false);
      }
    }
  };

  // Infinite Scroll Pagination loader [UC-FE02]
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore || loading) return;

    setLoadingMore(true);
    const requestId = feedRequestRef.current;
    try {
      const nextPage = currentPage + 1;
      const result = await postService.getFeedPaged(nextPage, 10, cursor, FEED_MODE_BY_CATEGORY[feedCategory]);
      if (requestId !== feedRequestRef.current) return; // người dùng đã đổi tab: không trộn bài của tab cũ vào
      if (result.posts && result.posts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const uniqueNew = result.posts.filter((p) => !existingIds.has(p.id) && !isPostHidden(p.id));
          return [...prev, ...uniqueNew];
        });
        setCurrentPage(nextPage);
        if (result.nextCursor) {
          setCursor(result.nextCursor);
        }
        setHasMore(!result.last);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error loading more posts:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Tải lại bảng tin khi đăng nhập và mỗi lần đổi tab Tất cả / Mới nhất / Nổi bật
  useEffect(() => {
    if (isAuthenticated) {
      setPosts([]);
      setCursor(null);
      setHasMore(true);
      fetchFeed();
    }
  }, [isAuthenticated, feedCategory]);

  useEffect(() => {
    const hasToken = !!tokens?.accessToken;
    if (!isAuthenticated && !hasToken && location.pathname !== '/auth') {
      navigate('/auth');
    } else if (isAuthenticated && location.pathname === '/auth') {
      navigate('/');
    }
  }, [isAuthenticated, tokens?.accessToken, location.pathname]);

  useEffect(() => {
    const handleNavigateAuth = () => {
      navigate('/auth');
    };
    window.addEventListener('navigate_to_auth', handleNavigateAuth);
    return () => window.removeEventListener('navigate_to_auth', handleNavigateAuth);
  }, [navigate]);

  useEffect(() => {
    const handleFeedPostCreated = (e: any) => {
      const newPost = e.detail;
      if (newPost && newPost.id) {
        setPosts((prev) => {
          if (prev.some((p) => p.id === newPost.id)) return prev;
          return [newPost, ...prev];
        });
      }
    };

    const handleOptimisticSettled = (e: any) => {
      const { tempId, realPost } = e.detail || {};
      if (!tempId || !realPost) return;
      setPosts((prev) => {
        if (prev.some((p) => p.id === realPost.id)) {
          return prev.filter((p) => p.id !== tempId);
        }
        return prev.map((p) => (p.id === tempId ? realPost : p));
      });
    };

    const handleOptimisticFailed = (e: any) => {
      const { tempId } = e.detail || {};
      if (!tempId) return;
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
    };

    const handlePostModeratedHidden = (e: any) => {
      const postId = e.detail?.postId;
      if (postId) {
        setPosts((prev) => prev.filter((p) => String(p.id) !== String(postId)));
      }
    };

    window.addEventListener('feed_post_created', handleFeedPostCreated);
    window.addEventListener('optimistic_post_settled', handleOptimisticSettled);
    window.addEventListener('optimistic_post_failed', handleOptimisticFailed);
    window.addEventListener('post_moderated_hidden', handlePostModeratedHidden);
    return () => {
      window.removeEventListener('feed_post_created', handleFeedPostCreated);
      window.removeEventListener('optimistic_post_settled', handleOptimisticSettled);
      window.removeEventListener('optimistic_post_failed', handleOptimisticFailed);
      window.removeEventListener('post_moderated_hidden', handlePostModeratedHidden);
    };
  }, []);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => {
      if (prev.some((p) => p.id === newPost.id)) return prev;
      return isPostHidden(newPost.id) ? prev : [newPost, ...prev];
    });
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const TAB_PATHS: Record<string, string> = {
    home: '/',
    friends: '/friends',
    settings: '/settings/profile',
    profile: '/profile',
    watch: '/watch',
    groups: '/groups',
    saved: '/saved',
    moderation: '/moderation',
    'moderation-appeals': '/moderation/appeals',
    support: '/support-inbox',
    'creator-dashboard': '/profile/creator-dashboard',
  };

  const handleTabChange = (tab: string) => {
    const path = TAB_PATHS[tab];
    if (!path) return;

    // Bấm vào tab/logo của trang đang đứng: cuộn mượt lên đầu trang (giống Facebook)
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Chuyển sang trang khác: trang mới luôn bắt đầu từ trên cùng, không giữ vị trí cuộn của trang cũ
    navigate(path);
    window.scrollTo({ top: 0 });
  };

  const handleViewProfile = (userId?: string) => {
    if (userId && userId !== 'me') {
      navigate(`/profile/${userId}`);
    } else {
      navigate('/profile');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Thứ tự bài đã do máy chủ xếp theo từng tab, không sắp xếp lại ở trình duyệt
  const displayedPosts = posts;

  const isAdmin = Array.isArray(user?.roles) && (user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMIN') || user.roles.includes('MODERATOR'));
  if (isMaintenance && !isAdmin) {
    return <MaintenanceScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-[#050505] dark:text-[#e4e6eb] transition-colors duration-150 pb-16 md:pb-0">
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              activeNavTab={activeNavTab}
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              feedCategory={feedCategory}
              setFeedCategory={setFeedCategory}
              posts={displayedPosts}
              loading={loading}
              backendError={backendError}
              fetchFeed={fetchFeed}
              onPostCreated={handlePostCreated}
              onDeletePost={handlePostDeleted}
              onViewProfile={handleViewProfile}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMorePosts}
            />
          }
        />
        <Route
          path="/friends"
          element={
            <FriendsPage
              activeNavTab="friends"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProfilePage
              activeNavTab="profile"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/profile/creator-dashboard"
          element={<CreatorDashboardPage />}
        />
        <Route
          path="/creator/dashboard"
          element={<CreatorDashboardPage />}
        />
        <Route
          path="/profile/:userId"
          element={
            <ProfilePage
              activeNavTab="profile"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/settings/*"
          element={
            <SettingsPage
              activeNavTab="settings"
              setActiveNavTab={handleTabChange}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/auth"
          element={
            <AuthPage
              onGoHome={() => navigate('/')}
            />
          }
        />
        <Route
          path="/search"
          element={
            <SearchPage
              activeNavTab="home"
              setActiveNavTab={handleTabChange}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/watch"
          element={
            <WatchPage
              activeNavTab="watch"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateAuth={() => navigate('/auth')}
              onViewProfile={handleViewProfile}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/groups"
          element={
            <GroupsPage
              activeNavTab="groups"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/groups/:id"
          element={
            <GroupDetailPage
              activeNavTab="groups"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/moderation"
          element={
            <ModeratorPage
              activeNavTab="moderation"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/moderation/appeals"
          element={<Navigate to="/admin" replace />}
        />
        <Route
          path="/admin"
          element={
            <ModeratorPage
              activeNavTab="moderation"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/support-inbox"
          element={
            <SupportInboxPage
              activeNavTab="support"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/saved"
          element={
            <SavedPage
              activeNavTab="saved"
              setActiveNavTab={handleTabChange}
              activeSidebarFilter={activeSidebarFilter}
              setActiveSidebarFilter={setActiveSidebarFilter}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateAuth={() => navigate('/auth')}
              onViewProfile={handleViewProfile}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/posts/:postId"
          element={
            <PostDetailPage
              activeNavTab="home"
              setActiveNavTab={handleTabChange}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/post/:postId"
          element={
            <PostDetailPage
              activeNavTab="home"
              setActiveNavTab={handleTabChange}
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
      </Routes>
      </Suspense>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#393a3b] h-14 flex items-center justify-around md:hidden z-40 shadow-lg">
        <button
          onClick={() => handleTabChange('home')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeNavTab === 'home' ? 'text-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Trang chủ</span>
        </button>
        <button
          onClick={() => handleTabChange('watch')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeNavTab === 'watch' ? 'text-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8]'
          }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Video</span>
        </button>
        <button
          onClick={() => handleTabChange('friends')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeNavTab === 'friends' ? 'text-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8]'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Bạn bè</span>
        </button>
        <button
          onClick={() => handleTabChange('groups')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeNavTab === 'groups' ? 'text-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8]'
          }`}
        >
          <UsersRound className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Nhóm</span>
        </button>
      </nav>

      {/* Global Real-time Audio/Video Call Manager & Modals */}
      <CallManager />

      {/* Dedicated Host Live Stream Studio & Floating Mini Widget */}
      <HostLiveStudioModal />

      {/* Floating AI Social Assistant Widget */}
      <AiSocialChatWidget />

      {/* Global Hashtag Feed Modal */}
      <HashtagFeedModal />

      {/* Multi-Window Chat Popup Container */}
      <ChatPopupContainer
        activeChatUsers={activeChatUsers}
        onCloseChat={handleCloseChatUser}
        onNavigateProfile={handleViewProfile}
      />
    </div>
  );
};

export default App;
