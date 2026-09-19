import React from 'react';
import { Send, Smile } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';

interface CommentFormFooterProps {
  user: any;
  isAuthenticated: boolean;
  replyingTo: { id: string; authorName: string } | null;
  setReplyingTo: (val: any) => void;
  commentText: string;
  setCommentText: (val: string) => void;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  t: (key: string) => string;
  language: string;
}

export const CommentFormFooter: React.FC<CommentFormFooterProps> = ({
  user,
  isAuthenticated,
  replyingTo,
  setReplyingTo,
  commentText,
  setCommentText,
  submitting,
  handleSubmit,
  inputRef,
  t,
  language,
}) => {
  return (
    <div className="p-3 border-t border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] shrink-0 space-y-1.5">
      {/* Replying banner indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg">
          <span>
            {language === 'en' ? `Replying to ${replyingTo.authorName}` : `Đang phản hồi ${replyingTo.authorName}`}
          </span>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-xs hover:underline cursor-pointer font-bold ml-2 text-red-500"
          >
            {language === 'en' ? 'Cancel' : 'Hủy'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="sm" className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              !isAuthenticated
                ? (language === 'en' ? 'Log in to comment...' : 'Đăng nhập để bình luận...')
                : replyingTo
                ? (language === 'en' ? `Reply to ${replyingTo.authorName}...` : `Trả lời ${replyingTo.authorName}...`)
                : (t('writeComment') || 'Viết bình luận...')
            }
            className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full pl-4 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
          />
          <button
            type="button"
            className="absolute right-3 text-gray-400 hover:text-amber-500 cursor-pointer"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>
        <button
          type="submit"
          disabled={!commentText.trim() || submitting}
          className="p-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full disabled:opacity-40 transition shadow-md cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
