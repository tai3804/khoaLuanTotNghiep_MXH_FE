import React from 'react';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

interface PostCardActionsBarProps {
  liked: boolean;
  reaction: string;
  showReactionsMenu: boolean;
  setShowReactionsMenu: (val: boolean) => void;
  reactionsList: string[];
  handleLike: () => void;
  handleSelectReaction: (emoji: string) => void;
  getReactionLabel: (emoji: string) => string;
  handleSharePost: () => void;
  copied: boolean;
  setShowCommentModal: (val: boolean) => void;
  t: (key: string) => string;
  language: string;
}

export const PostCardActionsBar: React.FC<PostCardActionsBarProps> = ({
  liked,
  reaction,
  showReactionsMenu,
  setShowReactionsMenu,
  reactionsList,
  handleLike,
  handleSelectReaction,
  getReactionLabel,
  handleSharePost,
  copied,
  setShowCommentModal,
  t,
  language,
}) => {
  return (
    <div className="px-2 py-1 flex items-center justify-around">
      {/* Like Button with Reactions Container */}
      <div
        className="relative flex-1"
        onMouseEnter={() => setShowReactionsMenu(true)}
        onMouseLeave={() => setShowReactionsMenu(false)}
      >
        {showReactionsMenu && (
          <div
            className="absolute -top-14 left-0 pb-3 z-50 cursor-pointer"
            onMouseEnter={() => setShowReactionsMenu(true)}
            onMouseLeave={() => setShowReactionsMenu(false)}
          >
            <div className="bg-white dark:bg-[#242526] rounded-full shadow-2xl px-4 py-2 flex items-center space-x-2 sm:space-x-2.5 transition-all duration-200 animate-fade-in border-0">
              {reactionsList.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectReaction(emoji);
                  }}
                  className="text-2xl sm:text-3xl hover:scale-135 hover:-translate-y-2 transition-all duration-150 cursor-pointer p-1.5 transform origin-bottom"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLike}
          className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold transition cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3b3c] ${
            liked ? 'text-[#2d88ff]' : 'text-gray-600 dark:text-[#b0b3b8]'
          }`}
        >
          {liked ? (
            <span className="text-base">{reaction || '👍'}</span>
          ) : (
            <ThumbsUp className="w-5 h-5" />
          )}
          <span>{liked ? getReactionLabel(reaction) : (t('like') || 'Thích')}</span>
        </button>
      </div>

      {/* Comment Button */}
      <button
        type="button"
        onClick={() => setShowCommentModal(true)}
        className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{t('comment') || 'Bình luận'}</span>
      </button>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleSharePost}
        className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
      >
        <Share2 className="w-5 h-5" />
        <span>{copied ? (language === 'en' ? 'Copied!' : 'Đã chép!') : (t('share') || 'Chia sẻ')}</span>
      </button>
    </div>
  );
};
