import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { FriendsPage } from './pages/FriendsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { SearchPage } from './pages/SearchPage';
import { WatchPage } from './pages/WatchPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { ModeratorPage } from './pages/ModeratorPage';
import { SupportInboxPage } from './pages/SupportInboxPage';
import { SavedPage } from './pages/SavedPage';
import { ChatUser } from './components/chat/chat-box';
import { ChatPopupContainer } from './components/chat/ChatPopupContainer';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { useSystemConfig } from './context/SystemConfigContext';
import { MaintenanceScreen } from './components/common/MaintenanceScreen';
import { postService } from './services/api';
import { Post } from './types';
import { Home, Tv, Store, Users } from 'lucide-react';
import { CallManager } from './components/call/CallManager';
import { HostLiveStudioModal } from './components/live-studio';
import { AiSocialChatWidget } from './components/ai/AiSocialChatWidget';
import { HashtagFeedModal } from './components/post/hashtag';

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

  const isPostHidden = (postId: string) => {
    try {
      return (JSON.parse(localStorage.getItem('kltn_hidden_post_ids') || '[]') as string[]).includes(String(postId));
    } catch {
      return false;
    }
  };

  let activeNavTab = 'home';
  if (path.startsWith('/settings')) activeNavTab = 'settings';
  else if (path.startsWith('/profile')) activeNavTab = 'profile';
  else if (path.startsWith('/friends')) activeNavTab = 'friends';
  else if (path.startsWith('/watch')) activeNavTab = 'watch';
  else if (path.startsWith('/groups')) activeNavTab = 'groups';
  else if (path.startsWith('/saved')) activeNavTab = 'saved';
  else if (path.startsWith('/moderation') || path.startsWith('/admin')) activeNavTab = 'moderation';
  else if (path.startsWith('/support-inbox')) activeNavTab = 'support';

  const fetchFeed = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setBackendError(null);
    }
    try {
      // Fetch first page (10 posts) [UC-FE02]
      const pagedRes = await postService.getFeedPaged(1, 10);
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

  // Infinite Scroll Pagination loader [UC-FE02]
  const loadMorePosts = async () => {
    if (loadingMore || !hasMore || loading) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const result = await postService.getFeedPaged(nextPage, 10, cursor);
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchFeed();
    }
  }, [isAuthenticated]);

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

  const handleTabChange = (tab: string) => {
    if (tab === 'home') navigate('/');
    else if (tab === 'friends') navigate('/friends');
    else if (tab === 'settings') navigate('/settings/profile');
    else if (tab === 'profile') navigate('/profile');
    else if (tab === 'watch') navigate('/watch');
    else if (tab === 'groups') navigate('/groups');
    else if (tab === 'saved') navigate('/saved');
    else if (tab === 'moderation') navigate('/moderation');
    else if (tab === 'moderation-appeals') navigate('/moderation/appeals');
    else if (tab === 'support') navigate('/support-inbox');
  };

  const handleViewProfile = (userId?: string) => {
    if (userId && userId !== 'me') {
      navigate(`/profile/${userId}`);
    } else {
      navigate('/profile');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter posts based on active category
  let displayedPosts = [...posts];
  if (feedCategory === 'recent') {
    displayedPosts = [...posts].sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || 0).getTime() || 0;
      return timeB - timeA;
    });
  } else if (feedCategory === 'popular') {
    const engagement = (post: Post) => (post.likesCount || 0) + (post.commentsCount || 0) * 2 + (post.sharesCount || 0) * 3;
    displayedPosts = [...posts].sort((a, b) => engagement(b) - engagement(a));
  }

  const isAdmin = Array.isArray(user?.roles) && (user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMIN') || user.roles.includes('MODERATOR'));
  if (isMaintenance && !isAdmin) {
    return <MaintenanceScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-[#050505] dark:text-[#e4e6eb] transition-colors duration-150 pb-16 md:pb-0">
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
              onNavigateSettings={() => navigate('/settings/profile')}
              onNavigateProfile={(uid) => handleViewProfile(uid)}
              onNavigateAuth={() => navigate('/auth')}
              activeChatUser={activeChatUser}
              setActiveChatUser={setActiveChatUser}
            />
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <ProfilePage
              activeNavTab="profile"
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
          element={<SupportInboxPage activeNavTab="support" setActiveNavTab={handleTabChange} onNavigateSettings={() => navigate('/settings/profile')} onNavigateProfile={(uid) => handleViewProfile(uid)} onNavigateAuth={() => navigate('/auth')} activeChatUser={activeChatUser} setActiveChatUser={setActiveChatUser} />}
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
      </Routes>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 h-14 flex items-center justify-around md:hidden z-40 shadow-lg">
        <button
          onClick={() => handleTabChange('home')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${activeNavTab === 'home' ? 'text-blue-600' : 'text-gray-400'
            }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Trang chủ</span>
        </button>
        <button
          onClick={() => handleTabChange('watch')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${activeNavTab === 'watch' ? 'text-blue-600' : 'text-gray-400'
            }`}
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Watch</span>
        </button>
        <button
          onClick={() => handleTabChange('marketplace')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${activeNavTab === 'marketplace' ? 'text-blue-600' : 'text-gray-400'
            }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Chợ</span>
        </button>
        <button
          onClick={() => handleTabChange('groups')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${activeNavTab === 'groups' ? 'text-blue-600' : 'text-gray-400'
            }`}
        >
          <Users className="w-5 h-5" />
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
