import React from 'react';
import { Globe, MoreHorizontal, Bookmark, Check, Copy, Trash2, X } from 'lucide-react';
import { Post } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';

interface PostCardHeaderProps {
  post: Post;
  authorName: string;
  authorAvatar: string;
  user: any;
  saved: boolean;
  setSaved: (val: boolean) => void;
  copied: boolean;
  showOptionsMenu: boolean;
  setShowOptionsMenu: (val: boolean) => void;
  language: string;
  onViewProfile?: (userId: string) => void;
  onDeletePost?: (postId: string) => void;
  handleSharePost: () => void;
  handleDeletePost: () => void;
}

export const PostCardHeader: React.FC<PostCardHeaderProps> = ({
  post,
  authorName,
  authorAvatar,
  user,
  saved,
  setSaved,
  copied,
  showOptionsMenu,
  setShowOptionsMenu,
  language,
  onViewProfile,
  onDeletePost,
  handleSharePost,
  handleDeletePost,
}) => {
  return (
    <div className="p-3.5 pb-2 flex items-center justify-between">
      <div className="flex items-center space-x-2.5">
        <div
          onClick={() => {
            if (onViewProfile && post.userId) onViewProfile(post.userId);
          }}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <UserAvatar
            src={authorAvatar || post.authorAvatar}
            alt={authorName || post.authorName}
            size="md"
            className="w-10 h-10 rounded-full"
          />
        </div>
        <div>
          <h4
            onClick={() => {
              if (onViewProfile && post.userId) onViewProfile(post.userId);
            }}
            className="font-bold text-gray-900 dark:text-[#e4e6eb] text-sm hover:underline cursor-pointer leading-tight"
          >
            {authorName || post.authorName || 'Thành viên'}
          </h4>
          <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            <span>{post.createdAt || 'Vừa xong'}</span>
            <span>•</span>
            <Globe className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Top Right Actions: Options & Close */}
      <div className="flex items-center space-x-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showOptionsMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl p-1 z-30">
              <button
                type="button"
                onClick={() => {
                  setSaved(!saved);
                  setShowOptionsMenu(false);
                }}
                className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'text-amber-500 fill-amber-500' : ''}`} />
                <span>
                  {saved
                    ? language === 'en'
                      ? 'Unsave post'
                      : 'Bỏ lưu bài viết'
                    : language === 'en'
                    ? 'Save post'
                    : 'Lưu bài viết'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleSharePost}
                className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-blue-500" />}
                <span>
                  {copied
                    ? language === 'en'
                      ? 'Link copied!'
                      : 'Đã chép liên kết!'
                    : language === 'en'
                    ? 'Copy link'
                    : 'Sao chép liên kết'}
                </span>
              </button>
              {user && (user.id === post.userId || post.userId === 'me') && (
                <button
                  type="button"
                  onClick={handleDeletePost}
                  className="w-full flex items-center space-x-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span>{language === 'en' ? 'Delete post' : 'Xóa bài viết'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (onDeletePost) onDeletePost(post.id);
          }}
          className="text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
          title={language === 'en' ? 'Hide post' : 'Ẩn bài viết'}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
