import React from 'react';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

interface CommentActionsBarProps {
  liked: boolean;
  userReaction?: string;
  showReactions: boolean;
  setShowReactions: (val: boolean) => void;
  reactionsList: string[];
  onLike: () => void;
  onSelectReaction: (emoji: string) => void;
  getReactionLabel: (emoji: string) => string;
  handleShareClick: () => void;
  copied: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  t: (key: string) => string;
  language: string;
}

export const CommentActionsBar: React.FC<CommentActionsBarProps> = ({
  liked,
  userReaction = '👍',
  showReactions,
  setShowReactions,
  reactionsList,
  onLike,
  onSelectReaction,
  getReactionLabel,
  handleShareClick,
  copied,
  inputRef,
  t,
  language,
}) => {
  return (
    <div className="flex items-center justify-around py-1 relative border-b border-gray-100 dark:border-[#393a3b]">
      {/* Like button with reaction menu */}
      <div
        className="relative flex-1"
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setShowReactions(false)}
      >
        {showReactions && (
          <div
            className="absolute -top-14 left-0 pb-3 z-50 cursor-pointer"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            <div className="bg-white dark:bg-[#242526] rounded-full shadow-2xl px-4 py-2 flex items-center space-x-2 sm:space-x-2.5 transition-all duration-200 animate-fade-in border-0">
              {reactionsList.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelectReaction(emoji);
                    setShowReactions(false);
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
          onClick={onLike}
          className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold transition cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3a3b3c] ${
            liked ? 'text-[#2d88ff]' : 'text-gray-600 dark:text-[#b0b3b8]'
          }`}
        >
          {liked ? (
            <span className="text-base">{userReaction || '👍'}</span>
          ) : (
            <ThumbsUp className="w-5 h-5" />
          )}
          <span>{liked ? getReactionLabel(userReaction) : (t('like') || 'Thích')}</span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          if (inputRef.current) inputRef.current.focus();
        }}
        className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
      >
        <MessageCircle className="w-5 h-5" />
        <span>{t('comment') || 'Bình luận'}</span>
      </button>

      <button
        type="button"
        onClick={handleShareClick}
        className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
      >
        <Share2 className="w-5 h-5" />
        <span>{copied ? (language === 'en' ? 'Copied!' : 'Đã chép!') : (t('share') || 'Chia sẻ')}</span>
      </button>
    </div>
  );
};
