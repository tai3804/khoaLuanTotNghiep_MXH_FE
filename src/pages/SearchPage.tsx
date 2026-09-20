import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/header-bar';
import { ChatBox, ChatUser } from '../components/chat/chat-box';
import { PostCard } from '../components/post/post-card';
import { userService, postService } from '../services/api';
import { Post } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Search, Users, FileText, LayoutGrid, Loader2 } from 'lucide-react';

interface SearchPageProps {
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  onNavigateSettings: () => void;
  onNavigateProfile: (userId?: string) => void;
  onNavigateAuth: () => void;
  activeChatUser: ChatUser | null;
  setActiveChatUser: (user: ChatUser | null) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  activeNavTab,
  setActiveNavTab,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
  activeChatUser,
  setActiveChatUser,
}) => {
  const { t, language } = useLanguage();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'posts'>('all');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const [usersRes, postsRes] = await Promise.all([
          userService.searchUsers(query.trim()).catch(() => []),
          postService.searchPosts ? postService.searchPosts(query.trim()).catch(() => []) : Promise.resolve([]),
        ]);
        setUsers(Array.isArray(usersRes) ? usersRes : []);
        setPosts(Array.isArray(postsRes) ? postsRes : []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const renderUsers = () => {
    if (users.length === 0) return null;
    return (
      <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-4 mb-4">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-[#e4e6eb]">Mọi người</h3>
        <div className="space-y-3">
          {users.map((u: any) => {
            const uid = String(u.userId || u.id);
            const name = [u.lastName, u.middleName, u.firstName].filter(Boolean).join(' ').trim() || u.fullName || u.username || 'Người dùng';
            const avatar = u.avatarUrl || u.avatar || '/default-avatar.png';
            return (
              <div key={uid} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] rounded-lg transition">
                <div 
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                  onClick={() => onNavigateProfile(uid)}
                >
                  <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }} />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-[#e4e6eb] text-sm">{name}</h4>
                    <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">@{u.username || 'user'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigateProfile(uid)}
                  className="px-4 py-1.5 bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] text-sm font-semibold rounded-md transition cursor-pointer"
                >
                  Xem trang
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPosts = () => {
    if (posts.length === 0) return null;
    return (
      <div className="space-y-4">
        {activeFilter === 'posts' && <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb] mb-2 bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-4">Bài viết</h3>}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeletePost={() => {
              setPosts(posts.filter(p => p.id !== post.id));
            }}
            onViewProfile={onNavigateProfile}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      <Header
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onSelectChatUser={(u) => setActiveChatUser(u)}
        onNavigateSettings={onNavigateSettings}
        onNavigateProfile={onNavigateProfile}
        onNavigateAuth={onNavigateAuth}
      />

      <div className="flex justify-center pt-14 max-w-[1200px] mx-auto px-4">
        {/* Search Sidebar */}
        <div className="hidden md:block w-[360px] flex-shrink-0 pt-4 pr-4">
          <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-2 sticky top-20">
            <h2 className="text-xl font-bold p-3 border-b border-gray-100 dark:border-[#393a3b] mb-2">Kết quả tìm kiếm</h2>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveFilter('all')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'all' ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1877f2] dark:text-[#2d88ff]' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                <div className={`p-1.5 rounded-full ${activeFilter === 'all' ? 'bg-[#1877f2] text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Tất cả</span>
              </button>
              
              <button
                onClick={() => setActiveFilter('users')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'users' ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1877f2] dark:text-[#2d88ff]' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                <div className={`p-1.5 rounded-full ${activeFilter === 'users' ? 'bg-[#1877f2] text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Mọi người</span>
              </button>

              <button
                onClick={() => setActiveFilter('posts')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition cursor-pointer ${
                  activeFilter === 'posts' ? 'bg-blue-50 dark:bg-blue-900/20 text-[#1877f2] dark:text-[#2d88ff]' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                <div className={`p-1.5 rounded-full ${activeFilter === 'posts' ? 'bg-[#1877f2] text-white' : 'bg-gray-200 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <span className="font-semibold text-sm">Bài viết</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 max-w-[680px] pt-4 min-h-[calc(100vh-3.5rem)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
              <p className="text-gray-500 dark:text-[#b0b3b8] font-medium">Đang tìm kiếm...</p>
            </div>
          ) : users.length === 0 && posts.length === 0 && query ? (
            <div className="bg-white dark:bg-[#242526] rounded-xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-[#3a3b3c] rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-[#e4e6eb]">Không tìm thấy kết quả nào</h3>
              <p className="text-sm text-gray-500 dark:text-[#b0b3b8]">
                Chúng tôi không tìm thấy kết quả nào cho "{query}". Hãy thử kiểm tra lỗi chính tả hoặc dùng các từ khóa khác.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeFilter === 'all' && (
                <>
                  {renderUsers()}
                  {renderPosts()}
                </>
              )}
              {activeFilter === 'users' && renderUsers()}
              {activeFilter === 'posts' && renderPosts()}
            </div>
          )}
        </div>
      </div>

      {activeChatUser && (
        <ChatBox
          key={activeChatUser.userId || activeChatUser.id}
          friend={activeChatUser}
          onClose={() => setActiveChatUser(null)}
          onNavigateProfile={onNavigateProfile}
        />
      )}
    </div>
  );
};
