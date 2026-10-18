import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileQuestion, Loader2 } from 'lucide-react';
import { Header } from '../components/layout/header-bar';
import { SidebarLeft } from '../components/layout/SidebarLeft';
import { PostCard } from '../components/post/post-card';
import { ChatUser } from '../components/chat/chat-box';
import { Post } from '../types';
import { postService } from '../services/api';
import { postDetailCache } from '../services/postService';

interface PostDetailPageProps {
  activeNavTab?: string;
  setActiveNavTab?: (tab: string) => void;
  activeSidebarFilter?: string;
  setActiveSidebarFilter?: (filter: string) => void;
  onNavigateSettings?: () => void;
  onNavigateAuth?: () => void;
  onViewProfile?: (userId?: string) => void;
  onNavigateProfile?: (userId?: string) => void;
  activeChatUser?: ChatUser | null;
  setActiveChatUser?: (user: ChatUser | null) => void;
}

type LoadState = 'loading' | 'ready' | 'missing';

/** Trang một bài viết (đích của thông báo: lượt thích, bình luận, chia sẻ, gắn thẻ, bạn bè phát trực tiếp...). */
export const PostDetailPage: React.FC<PostDetailPageProps> = ({
  activeNavTab = 'home',
  setActiveNavTab,
  activeSidebarFilter = 'home',
  setActiveSidebarFilter,
  onNavigateSettings,
  onNavigateAuth,
  onViewProfile,
  onNavigateProfile,
  setActiveChatUser,
}) => {
  const handleViewProfile = onViewProfile || onNavigateProfile || (() => {});
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  // Kết quả gắn với id đã tải: đổi sang bài khác thì tự quay về trạng thái đang tải, không cần reset trong effect
  const [loaded, setLoaded] = useState<{ postId: string; post: Post | null } | null>(null);

  useEffect(() => {
    if (!postId) return;
    let active = true;
    window.scrollTo({ top: 0 });
    // Luôn lấy bản mới: bài có thể vừa bị sửa, bị ẩn hoặc buổi phát trực tiếp vừa kết thúc
    delete postDetailCache[postId];
    postService.getPostById(postId).then((found) => {
      if (active) setLoaded({ postId, post: found });
    });
    return () => {
      active = false;
    };
  }, [postId]);

  const current = loaded && loaded.postId === postId ? loaded : null;
  const post = current?.post ?? null;
  const state: LoadState = !postId || (current && !current.post) ? 'missing' : current ? 'ready' : 'loading';

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] transition-colors duration-200">
      <Header
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          setActiveNavTab?.(tab);
          if (tab === 'friends') setActiveSidebarFilter?.('friends');
        }}
        onSelectChatUser={(u) => setActiveChatUser?.(u)}
        onNavigateSettings={onNavigateSettings || (() => {})}
        onNavigateProfile={handleViewProfile}
        onNavigateAuth={onNavigateAuth || (() => {})}
      />

      <div className="flex justify-between pt-14 max-w-[1920px] mx-auto">
        <SidebarLeft
          activeFilter={activeSidebarFilter}
          onFilterChange={(filter) => {
            setActiveSidebarFilter?.(filter);
            if (filter === 'friends') setActiveNavTab?.('friends');
            else if (filter === 'groups') setActiveNavTab?.('groups');
            else if (filter === 'watch') setActiveNavTab?.('watch');
            else if (filter === 'moderation') setActiveNavTab?.('moderation');
            else if (filter === 'support') setActiveNavTab?.('support');
            else if (filter === 'saved') setActiveNavTab?.('saved');
            else setActiveNavTab?.('home');
          }}
          onNavigateProfile={() => handleViewProfile()}
          onNavigateSettings={onNavigateSettings || (() => {})}
        />

        <main className="flex-1 max-w-[680px] mx-auto px-2 sm:px-4 py-4 min-h-[calc(100vh-3.5rem)]">
          <button
            type="button"
            onClick={goBack}
            className="mb-3 inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>

          {state === 'loading' && (
            <div className="flex justify-center items-center py-20 bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
            </div>
          )}

          {state === 'missing' && (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-gray-200 dark:border-[#393a3b] shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1877f2] flex items-center justify-center mx-auto">
                <FileQuestion className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">Không tìm thấy bài viết</h4>
                <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-md mx-auto leading-relaxed">
                  Bài viết có thể đã bị xóa, đang bị ẩn hoặc bạn không có quyền xem bài viết này.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center px-5 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
              >
                Về trang chủ
              </button>
            </div>
          )}

          {state === 'ready' && post && (
            <PostCard
              key={post.id}
              post={post}
              onDeletePost={() => navigate('/')}
              onViewProfile={handleViewProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PostDetailPage;
