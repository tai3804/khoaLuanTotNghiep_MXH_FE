import React from 'react';
import { CornerDownRight, Smile, Send } from 'lucide-react';
import { Comment } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';

interface PostCardCommentsPreviewProps {
  displayedComments: Comment[];
  totalComments: number;
  user: any;
  isAuthenticated: boolean;
  openLoginModal: () => void;
  inlineCommentText: string;
  setInlineCommentText: (text: string) => void;
  handleInlineCommentSubmit: (e: React.FormEvent) => void;
  setShowCommentModal: (val: boolean) => void;
  onViewProfile?: (userId: string) => void;
  t: (key: string) => string;
  language: string;
}

export const PostCardCommentsPreview: React.FC<PostCardCommentsPreviewProps> = ({
  displayedComments,
  totalComments,
  user,
  isAuthenticated,
  openLoginModal,
  inlineCommentText,
  setInlineCommentText,
  handleInlineCommentSubmit,
  setShowCommentModal,
  onViewProfile,
  t,
  language,
}) => {
  return (
    <div className="p-3 bg-gray-50/60 dark:bg-[#242526] space-y-2.5 border-t border-gray-200 dark:border-[#393a3b]">
      {displayedComments.length > 0 && (
        <div className="space-y-2">
          {displayedComments.map((comment) => {
            const displayName =
              (comment.userId === user?.id || comment.userId === 'me') && user?.fullName
                ? user.fullName
                : comment.authorName || 'Thành viên KLTN';
            const displayAvatar =
              (comment.userId === user?.id || comment.userId === 'me') && user?.avatar
                ? user.avatar
                : comment.authorAvatar;

            return (
              <div key={comment.id} className="flex space-x-2.5 items-start">
                <div
                  onClick={() => {
                    if (onViewProfile && comment.userId) onViewProfile(comment.userId);
                  }}
                  className="cursor-pointer shrink-0"
                >
                  <UserAvatar src={displayAvatar} alt={displayName} size="sm" className="w-8 h-8 rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-[#3a3b3c] p-2.5 px-3 rounded-2xl inline-block max-w-full">
                    <h5
                      onClick={() => {
                        if (onViewProfile && comment.userId) onViewProfile(comment.userId);
                      }}
                      className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] cursor-pointer hover:underline"
                    >
                      {displayName}
                    </h5>
                    <p className="text-xs text-gray-800 dark:text-[#e4e6eb] mt-0.5 leading-relaxed break-words">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-0.5 ml-2 font-semibold">
                    <button type="button" className="hover:underline hover:text-[#2d88ff] cursor-pointer">
                      {t('like') || 'Thích'}
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setShowCommentModal(true)}
                      className="hover:underline hover:text-[#2d88ff] flex items-center space-x-1 cursor-pointer"
                    >
                      <CornerDownRight className="w-3 h-3" />
                      <span>{language === 'en' ? 'Reply' : 'Phản hồi'}</span>
                    </button>
                    <span>•</span>
                    <span>{comment.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View All / More Comments button if > 2 comments */}
      {totalComments > 2 && (
        <button
          type="button"
          onClick={() => setShowCommentModal(true)}
          className="text-xs font-semibold text-gray-500 dark:text-[#b0b3b8] hover:underline cursor-pointer pl-1 py-1 block"
        >
          {language === 'en'
            ? `View all ${totalComments} comments...`
            : `Xem tất cả ${totalComments} bình luận...`}
        </button>
      )}

      {/* Inline Quick Comment Input Form */}
      <form onSubmit={handleInlineCommentSubmit} className="flex items-center space-x-2 pt-1">
        <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="sm" className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inlineCommentText}
            onChange={(e) => setInlineCommentText(e.target.value)}
            onClick={() => {
              if (!isAuthenticated) openLoginModal();
            }}
            placeholder={
              !isAuthenticated
                ? language === 'en'
                  ? 'Log in to comment...'
                  : 'Đăng nhập để bình luận...'
                : t('writeComment') || 'Viết bình luận...'
            }
            className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full pl-4 pr-10 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
          />
          <button
            type="button"
            onClick={() => setShowCommentModal(true)}
            className="absolute right-3 text-gray-400 hover:text-amber-500 cursor-pointer"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!inlineCommentText.trim()}
          className="p-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full disabled:opacity-40 transition shadow-sm cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
