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
  Edit3,
  Pin,
  PinOff,
  Bell,
  BellOff,
  Archive,
  Calendar,
  Languages,
  EyeOff,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';
import { AlertTriangle } from 'lucide-react';
import { ReportModal } from '../../report/ReportModal';
import { PostTaggedUsers } from './PostTaggedUsers';
import { TrendingBadge } from '../common/TrendingBadge';
import { PostInsightsModal } from '../post-insights/PostInsightsModal';

interface PostCardHeaderProps {
  post: Post;
  authorName: string;
  authorAvatar: string;
  groupInfo?: { id: string; name: string; coverUrl?: string; privacy?: string } | null;
  user: any;
  saved: boolean;
  setSaved: (val: boolean) => void;
  copied: boolean;
  showOptionsMenu: boolean;
  setShowOptionsMenu: (val: boolean) => void;
  language: string;
  onViewProfile?: (userId: string) => void;
  onHidePost?: () => void;
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
  translationDisabled?: boolean;
  onToggleTranslation?: () => void;
  onEditDate?: () => void;
}

export const PostCardHeader: React.FC<PostCardHeaderProps> = ({
  post,
  authorName,
  authorAvatar,
  groupInfo,
  user,
  saved,
  setSaved,
  copied,
  showOptionsMenu,
  setShowOptionsMenu,
  language,
  onViewProfile,
  onHidePost,
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
  translationDisabled = false,
  onToggleTranslation,
  onEditDate,
}) => {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [showInsightsModal, setShowInsightsModal] = React.useState(false);

  const currentUserId = String(
    user?.id ||
    user?.userId ||
    (user as any)?.profileId ||
    ''
  ).toLowerCase().trim();

  const postAuthorId = String(
    post.userId ||
    (post as any)?.authorId ||
    (post as any)?.author?.id ||
    (post as any)?.author?.userId ||
    (post as any)?.postDetail?.authorId ||
    ''
  ).toLowerCase().trim();

  const isOwner = Boolean(
    user &&
    currentUserId &&
    postAuthorId &&
    currentUserId !== 'me' &&
    postAuthorId !== 'me' &&
    currentUserId === postAuthorId
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

  const isGroupPost = Boolean(post.groupId);
  const groupName = groupInfo?.name || post.groupName || 'Nhóm';
  const groupCover = groupInfo?.coverUrl || post.groupAvatar || post.groupCover;
  const groupPrivacy = groupInfo?.privacy || post.groupPrivacy || (post.privacy === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC');

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
        {isGroupPost ? (
          <div className="flex items-center space-x-2.5 min-w-0">
            {/* Group thumbnail with Author badge */}
            <div className="relative w-11 h-11 shrink-0">
              <div
                onClick={() => navigate(`/groups/${post.groupId}`)}
                className="w-10 h-10 rounded-xl overflow-hidden bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center cursor-pointer border border-gray-200 dark:border-[#393a3b] hover:opacity-90 transition shadow-xs"
                title={groupName}
              >
                {groupCover ? (
                  <img src={groupCover} alt={groupName} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onViewProfile && post.userId) onViewProfile(post.userId);
                }}
                className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full ring-2 ring-white dark:ring-[#242526] overflow-hidden cursor-pointer hover:scale-110 transition bg-white dark:bg-[#242526]"
                title={authorName || post.authorName}
              >
                <UserAvatar
                  src={authorAvatar || post.authorAvatar}
                  alt={authorName || post.authorName}
                  size="sm"
                  className="w-full h-full rounded-full"
                />
              </div>
            </div>

            {/* Names & Subtitles */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span
                  onClick={() => navigate(`/groups/${post.groupId}`)}
                  className="font-bold text-gray-900 dark:text-[#e4e6eb] text-sm hover:underline cursor-pointer truncate max-w-[240px] sm:max-w-xs block leading-tight"
                  title={groupName}
                >
                  {groupName}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 flex-wrap leading-tight">
                <span
                  onClick={() => {
                    if (onViewProfile && post.userId) onViewProfile(post.userId);
                  }}
                  className="font-semibold text-gray-700 dark:text-[#d0d2d6] hover:underline cursor-pointer truncate max-w-[140px] inline-block"
                >
                  {authorName || post.authorName || 'Thành viên'}
                </span>
                <PostTaggedUsers taggedUserIds={post.taggedUserIds} />
                <span>•</span>
                {post.isOptimistic ? (
                  <span className="inline-flex items-center gap-1 text-blue-500 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Đang đăng...</span>
                  </span>
                ) : (
                  <span>{post.createdAt || 'Vừa xong'}</span>
                )}
                <span>•</span>
                {groupPrivacy === 'PRIVATE' ? (
                  <span title="Nhóm riêng tư" className="inline-flex items-center">
                    <Lock className="w-3 h-3 text-amber-500" />
                  </span>
                ) : (
                  <span title="Nhóm công khai" className="inline-flex items-center">
                    <Globe className="w-3 h-3 text-gray-500 dark:text-[#b0b3b8]" />
                  </span>
                )}
                {post.isTrending && <TrendingBadge size="sm" />}
                {post.status === 'SCHEDULED' && (
                  <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                    Đã lên lịch
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
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
              <div className="flex items-center flex-wrap gap-1 leading-tight">
                <h4
                  onClick={() => {
                    if (onViewProfile && post.userId) onViewProfile(post.userId);
                  }}
                  className="font-bold text-gray-900 dark:text-[#e4e6eb] text-sm hover:underline cursor-pointer"
                >
                  {authorName || post.authorName || 'Thành viên'}
                </h4>
                <PostTaggedUsers taggedUserIds={post.taggedUserIds} />
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
                {post.isOptimistic ? (
                  <span className="inline-flex items-center gap-1 text-blue-500 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Đang đăng...</span>
                  </span>
                ) : (
                  <span>{post.createdAt || 'Vừa xong'}</span>
                )}
                <span>•</span>
                {renderPrivacyIcon()}
                {post.isTrending && <TrendingBadge size="sm" />}
                {post.status === 'SCHEDULED' && (
                  <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                    Đã lên lịch
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

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
                {/* 0. View Post Insights (Owner only) */}
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowInsightsModal(true);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 transition cursor-pointer text-left"
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    <div>
                      <div>Xem thông tin chi tiết</div>
                      <div className="text-[11px] text-blue-500/80 font-normal">
                        Số lượt xem, tiếp cận & phân tích tương tác
                      </div>
                    </div>
                  </button>
                )}

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

                {onToggleTranslation && (
                  <button type="button" onClick={() => { onToggleTranslation(); setShowOptionsMenu(false); }} className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left">
                    <Languages className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{translationDisabled ? 'Bật bản dịch' : 'Tắt bản dịch'}</span>
                  </button>
                )}

                {isOwner && onEditDate && (
                  <button type="button" onClick={() => { onEditDate(); setShowOptionsMenu(false); }} className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left">
                    <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Chỉnh sửa ngày</span>
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

                {/* 9. Hide post */}
                {!isOwner && onHidePost && (
                  <button
                    type="button"
                    onClick={() => {
                      onHidePost();
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl text-xs font-semibold text-gray-800 dark:text-[#e4e6eb] transition cursor-pointer text-left"
                  >
                    <EyeOff className="w-4 h-4 text-gray-500 shrink-0" />
                    <div>
                      <div>Ẩn bài viết</div>
                      <div className="text-[11px] text-gray-400 font-normal">
                        Ẩn bài viết này khỏi bảng tin của bạn
                      </div>
                    </div>
                  </button>
                )}

                {/* 10. Report post */}
                {!isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowReportModal(true);
                      setShowOptionsMenu(false);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-xl text-xs font-semibold transition cursor-pointer text-left"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Báo cáo bài viết</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ReportModal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        targetId={post.id} 
        targetType="POST" 
      />

      {showInsightsModal && (
        <PostInsightsModal
          postId={post.id}
          isOpen={showInsightsModal}
          onClose={() => setShowInsightsModal(false)}
        />
      )}
    </div>
  );
};
