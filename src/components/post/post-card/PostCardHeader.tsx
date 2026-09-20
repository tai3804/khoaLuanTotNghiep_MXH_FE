import React, { useRef, useEffect } from 'react';
import {
  Globe,
  Users,
  Lock,
  MoreHorizontal,
  Bookmark,
  Check,
  Copy,
  Trash2,
  X,
  Edit3,
  Pin,
  PinOff,
  Bell,
  BellOff,
  Archive,
} from 'lucide-react';
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
  onEditPost?: () => void;
  onEditAudience?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onSavePost?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onArchivePost?: () => void;
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
  onEditPost,
  onEditAudience,
  isPinned = false,
  onTogglePin,
  onSavePost,
  isMuted = false,
  onToggleMute,
  onArchivePost,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUserId = String(user?.id || user?.userId || user?.profileId || '').toLowerCase();
  const postAuthorId = String(post.userId || (post as any)?.authorId || '').toLowerCase();
  const isOwner = Boolean(
    user && (
      (currentUserId && postAuthorId && currentUserId === postAuthorId) ||
      postAuthorId === 'me'
    )
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!showOptionsMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOptionsMenu, setShowOptionsMenu]);

  const renderPrivacyIcon = () => {
    if (post.privacy === 'PRIVATE') {
      return (
        <span title="Chỉ mình tôi">
          <Lock className="w-3 h-3 text-amber-500" />
        </span>
      );
    }
    if (post.privacy === 'FRIENDS') {
      return (
        <span title="Bạn bè">
          <Users className="w-3 h-3 text-emerald-500" />
        </span>
      );
    }
    return (
      <span title="Công khai">
        <Globe className="w-3 h-3 text-gray-500 dark:text-[#b0b3b8]" />
      </span>
    );
  };

  return (
    <div>
      {/* Pinned post badge if pinned */}
      {isPinned && (
        <div className="px-4 pt-3 pb-0 flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-[#b0b3b8]">
          <Pin className="w-3.5 h-3.5 text-[#1877f2] fill-[#1877f2]" />
          <span>Bài viết đã ghim</span>
        </div>
      )}

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
              {renderPrivacyIcon()}
            </div>
          </div>
        </div>

        {/* Top Right Actions: Options & Close */}
        <div className="flex items-center space-x-1">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="text-gray-500 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showOptionsMenu && (
              <div className="absolute right-0 top-10 w-72 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] rounded-2xl shadow-2xl p-1.5 z-40 animate-in fade-in duration-100">
                {/* 1. Pin / Unpin */}
                {isOwner && onTogglePin && (
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePin();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left"
                  >
                    {isPinned ? (
                      <PinOff className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                      <Pin className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                    <div>
                      <div>{isPinned ? 'Bỏ ghim bài viết' : 'Ghim bài viết'}</div>
                    </div>
                  </button>
                )}

                {/* 2. Save / Unsave */}
                <button
                  type="button"
                  onClick={() => {
                    if (onSavePost) {
                      onSavePost();
                    } else {
                      setSaved(!saved);
                    }
                    setShowOptionsMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left"
                >
                  <Bookmark
                    className={`w-4 h-4 shrink-0 ${
                      saved ? 'text-amber-500 fill-amber-500' : 'text-gray-500'
                    }`}
                  />
                  <div>
                    <div>{saved ? 'Bỏ lưu bài viết' : 'Lưu bài viết'}</div>
                    <div className="text-[11px] text-gray-400 font-normal">
                      Thêm vào mục đã lưu
                    </div>
                  </div>
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-[#393a3b]" />

                {/* 3. Edit post */}
                {isOwner && onEditPost && (
                  <button
                    type="button"
                    onClick={() => {
                      onEditPost();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Chỉnh sửa bài viết</span>
                  </button>
                )}

                {/* 4. Edit audience */}
                {isOwner && onEditAudience && (
                  <button
                    type="button"
                    onClick={() => {
                      onEditAudience();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left"
                  >
                    <Globe className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Chỉnh sửa đối tượng</span>
                  </button>
                )}

                {/* 5. Mute notification */}
                {onToggleMute && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleMute();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left"
                  >
                    {isMuted ? (
                      <Bell className="w-4 h-4 text-gray-500 shrink-0" />
                    ) : (
                      <BellOff className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                    <span>
                      {isMuted
                        ? 'Bật thông báo về bài viết này'
                        : 'Tắt thông báo về bài viết này'}
                    </span>
                  </button>
                )}

                {/* 6. Copy link */}
                <button
                  type="button"
                  onClick={handleSharePost}
                  className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                  <span>{copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết'}</span>
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-[#393a3b]" />

                {/* 7. Archive */}
                {isOwner && onArchivePost && (
                  <button
                    type="button"
                    onClick={() => {
                      onArchivePost();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left"
                  >
                    <Archive className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Chuyển vào kho lưu trữ</span>
                  </button>
                )}

                {/* 8. Move to trash / Delete */}
                {isOwner && (
                  <button
                    type="button"
                    onClick={handleDeletePost}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-xl text-xs font-semibold transition cursor-pointer text-left"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                    <div>
                      <div>Chuyển vào thùng rác</div>
                      <div className="text-[10px] text-gray-400 font-normal">
                        Các mục trong thùng rác sẽ bị xóa sau 30 ngày
                      </div>
                    </div>
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
    </div>
  );
};
