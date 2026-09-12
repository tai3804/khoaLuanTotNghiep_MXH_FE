import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { FriendsPage } from './pages/FriendsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { ChatUser } from './components/chat/ChatBox';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { postService } from './services/api';
import { Post } from './types';
import { Home, Tv, Store, Users } from 'lucide-react';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeSidebarFilter, setActiveSidebarFilter] = useState<string>('all');
  const [feedCategory, setFeedCategory] = useState<'all' | 'recent' | 'popular'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);

  // Sync activeNavTab from URL path
  const path = location.pathname;
  let activeNavTab = 'home';
  if (path.startsWith('/settings')) activeNavTab = 'settings';
  else if (path.startsWith('/profile')) activeNavTab = 'profile';
  else if (path.startsWith('/friends')) activeNavTab = 'friends';

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
    if (!isAuthenticated && location.pathname !== '/auth') {
      navigate('/auth');
    } else if (isAuthenticated && location.pathname === '/auth') {
      navigate('/');
    }
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    const handleNavigateAuth = () => {
      navigate('/auth');
    };
    window.addEventListener('navigate_to_auth', handleNavigateAuth);
    return () => window.removeEventListener('navigate_to_auth', handleNavigateAuth);
  }, [navigate]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'home') navigate('/');
    else if (tab === 'friends') navigate('/friends');
    else if (tab === 'settings') navigate('/settings/profile');
    else if (tab === 'profile') navigate('/profile');
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
    displayedPosts = [...posts].reverse();
  } else if (feedCategory === 'popular') {
    displayedPosts = [...posts].sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
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
      </Routes>

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