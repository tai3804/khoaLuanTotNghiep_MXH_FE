import React, { useState, useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { FriendsPage } from './pages/FriendsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';
import { LoginModal } from './components/common/LoginModal';
import { ChatUser } from './components/chat/ChatBox';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { postService } from './services/api';
import { Post } from './types';
import { Home, Tv, Store, Users, Gamepad2 } from 'lucide-react';

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
      {activeNavTab === 'settings' ? (
        <SettingsPage
          activeNavTab={activeNavTab}
          setActiveNavTab={handleTabChange}
          onNavigateSettings={() => {
            setViewMode('app');
            setActiveNavTab('settings');
          }}
          onNavigateProfile={(uid) => handleViewProfile(uid)}
          onNavigateAuth={() => setViewMode('auth')}
          activeChatUser={activeChatUser}
          setActiveChatUser={setActiveChatUser}
        />
      ) : activeNavTab === 'profile' ? (
        <ProfilePage
          userId={profileUserId}
          activeNavTab={activeNavTab}
          setActiveNavTab={handleTabChange}
          onNavigateSettings={() => {
            setViewMode('app');
            setActiveNavTab('settings');
          }}
          onNavigateProfile={(uid) => handleViewProfile(uid)}
          onNavigateAuth={() => setViewMode('auth')}
          activeChatUser={activeChatUser}
          setActiveChatUser={setActiveChatUser}
        />
      ) : isFriendsView ? (
        <FriendsPage
          activeNavTab={activeNavTab}
          setActiveNavTab={handleTabChange}
          onNavigateSettings={() => {
            setViewMode('app');
            setActiveNavTab('settings');
          }}
          onNavigateProfile={(uid) => handleViewProfile(uid)}
          onNavigateAuth={() => setViewMode('auth')}
          activeChatUser={activeChatUser}
          setActiveChatUser={setActiveChatUser}
        />
      ) : (
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
          onNavigateSettings={() => {
            setViewMode('app');
            setActiveNavTab('settings');
          }}
          onNavigateAuth={() => setViewMode('auth')}
          activeChatUser={activeChatUser}
          setActiveChatUser={setActiveChatUser}
        />
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