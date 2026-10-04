import React, { useState, useEffect, useCallback } from 'react';
import { Hash, X, Loader2, RefreshCw } from 'lucide-react';
import { Post } from '../../../types';
import { postService } from '../../../services/postService';
import { PostCard } from '../post-card';

export const HashtagFeedModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hashtag, setHashtag] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);

  const fetchPosts = useCallback(async (tag: string) => {
    if (!tag) return;
    setLoading(true);
    try {
      const data = await postService.getPostsByHashtag(tag, 0, 30);
      setPosts(data.posts);
      setTotalElements(data.totalElements);
    } catch {
      setPosts([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOpen = (e: any) => {
      const tag = e.detail?.hashtag;
      if (tag) {
        const clean = tag.startsWith('#') ? tag : `#${tag}`;
        setHashtag(clean);
        setIsOpen(true);
        fetchPosts(clean);
      }
    };

    window.addEventListener('open_hashtag_feed', handleOpen);
    return () => {
      window.removeEventListener('open_hashtag_feed', handleOpen);
    };
  }, [fetchPosts]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-[#f0f2f5] dark:bg-[#18191a] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white dark:bg-[#242526] border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1877f2]">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-[#e4e6eb] leading-tight">
                {hashtag}
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                {totalElements} bài viết liên quan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fetchPosts(hashtag)}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-[#1877f2] dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer disabled:opacity-50"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-[#b0b3b8] dark:hover:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 custom-scrollbar">
          {loading && posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-3 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
              <span className="text-sm font-semibold">Đang tìm các bài viết với thẻ {hashtag}...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-xl p-8 text-center border border-gray-200 dark:border-[#393a3b]">
              <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-[#3a3b3c] flex items-center justify-center text-gray-400 mb-2">
                <Hash className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Chưa có bài viết nào</h4>
              <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
                Hiện chưa có bài viết nào chứa hashtag {hashtag}.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDeletePost={() => {
                  setPosts((prev) => prev.filter((p) => p.id !== post.id));
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
