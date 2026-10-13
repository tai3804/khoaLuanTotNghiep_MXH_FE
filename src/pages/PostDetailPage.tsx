import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { SidebarRight } from '../components/layout/SidebarRight';
import { PostCard } from '../components/post/post-card';
import { ChatUser } from '../components/chat/chat-box';
import { postService } from '../services/api';
import { Post } from '../types';
import { ArrowLeft, FileQuestion, Loader2, Share2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PostDetailPageProps {
  activeNavTab?: string;
  setActiveNavTab?: (tab: string) => void;
  onNavigateSettings?: () => void;
  onNavigateProfile?: (userId: string) => void;
  onNavigateAuth?: () => void;
  activeChatUser?: ChatUser | null;
  setActiveChatUser?: (user: ChatUser | null) => void;
}

export const PostDetailPage: React.FC<PostDetailPageProps> = ({
  activeNavTab = 'home',
  setActiveNavTab,
  onNavigateSettings,
  onNavigateProfile,
  onNavigateAuth,
  activeChatUser = null,
  setActiveChatUser,
}) => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError('Mã bài viết không hợp lệ');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    postService
      .getPostById(postId)
      .then((data) => {
        if (isMounted) {
          if (data) {
            setPost(data);
          } else {
            setError('Bài viết không tồn tại hoặc đã bị xóa');
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Failed to load post detail:', err);
          setError(
            err.response?.status === 404
              ? 'Bài viết không tồn tại hoặc bạn không có quyền xem'
              : 'Không thể tải bài viết. Vui lòng thử lại sau.'
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleTabChange = (tab: string) => {
    if (setActiveNavTab) setActiveNavTab(tab);
    if (tab === 'home') navigate('/');
    else if (tab === 'friends') navigate('/friends');
    else if (tab === 'watch') navigate('/watch');
    else if (tab === 'groups') navigate('/groups');
    else if (tab === 'saved') navigate('/saved');
    else if (tab === 'support') navigate('/support-inbox');
    else if (tab === 'moderation') navigate('/moderation');
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb]">
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onNavigateSettings={onNavigateSettings || (() => navigate('/settings/profile'))}
        onNavigateProfile={onNavigateProfile || ((uid) => navigate(`/profile/${uid}`))}
        onNavigateAuth={onNavigateAuth || (() => navigate('/auth'))}
        onSelectChatUser={setActiveChatUser}
      />

      <div className="max-w-[1920px] mx-auto flex justify-between px-0 sm:px-2 md:px-4">
        {/* Left Shortcuts & System Nav Sidebar */}
        <SidebarLeft
          activeFilter="home"
          onFilterChange={(f) => handleTabChange(f)}
          onNavigateProfile={() => navigate('/profile')}
          onNavigateSettings={() => navigate('/settings/profile')}
        />

        {/* Central Feed Container */}
        <main className="flex-1 max-w-[680px] w-full mx-auto px-2 sm:px-4 py-4 space-y-4">
          {/* Top Bar with Back Button */}
          <div className="flex items-center justify-between bg-white dark:bg-[#242526] rounded-2xl p-3 border border-gray-200 dark:border-[#393a3b] shadow-xs">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#1877f2]" />
              <span>{language === 'en' ? 'Back' : 'Quay lại'}</span>
            </button>

            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-[#b0b3b8]">
              <Share2 className="w-3.5 h-3.5 text-[#1877f2]" />
              <span className="font-semibold">
                {language === 'en' ? 'Post Detail' : 'Chi tiết bài viết'}
              </span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-gray-200 dark:border-[#393a3b] shadow-sm animate-pulse space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#3a3b3c]" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-[#3a3b3c] rounded w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-[#3a3b3c]/60 rounded w-1/4" />
                </div>
              </div>
              <div className="space-y-2 py-2">
                <div className="h-4 bg-gray-100 dark:bg-[#3a3b3c]/40 rounded w-full" />
                <div className="h-4 bg-gray-100 dark:bg-[#3a3b3c]/40 rounded w-4/5" />
              </div>
              <div className="h-64 bg-gray-100 dark:bg-[#3a3b3c]/40 rounded-xl" />
            </div>
          ) : error || !post ? (
            /* Error / Not Found State */
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-200 dark:border-[#393a3b] shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 mx-auto flex items-center justify-center">
                <FileQuestion className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-[#e4e6eb]">
                  {language === 'en' ? 'Post unavailable' : 'Không tìm thấy bài viết'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-md mx-auto mt-1 leading-relaxed">
                  {error ||
                    (language === 'en'
                      ? 'This post may have been deleted or you do not have permission to view it.'
                      : 'Bài viết này có thể đã bị xóa hoặc bạn không có quyền xem.')}
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                {language === 'en' ? 'Go to Home' : 'Về Trang chủ'}
              </button>
            </div>
          ) : (
            /* Post Card View */
            <div className="space-y-4">
              <PostCard
                post={post}
                onDeletePost={() => navigate('/')}
                onViewProfile={(uid) => navigate(`/profile/${uid}`)}
                onPostUpdated={(updated) => setPost(updated)}
              />
            </div>
          )}
        </main>

        {/* Right Contacts & Sidebar */}
        <SidebarRight onSelectChatUser={(u) => setActiveChatUser?.(u)} />
      </div>
    </div>
  );
};

export default PostDetailPage;
