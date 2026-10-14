import React from 'react';

interface CommentStatsBarProps {
  likesCount: number;
  commentsCount: number;
  commentsLength: number;
  sharesCount?: number;
  topReactionIcons: string[];
  language: string;
  onOpenReactionsModal?: () => void;
}

export const CommentStatsBar: React.FC<CommentStatsBarProps> = ({
  likesCount,
  commentsCount,
  commentsLength,
  sharesCount = 0,
  topReactionIcons,
  language,
  onOpenReactionsModal,
}) => {
  return (
    <div className="py-2 px-1 flex items-center justify-between border-t border-b border-gray-100 dark:border-[#393a3b] text-xs text-gray-500 dark:text-[#b0b3b8]">
      <div className="flex items-center space-x-1.5">
        {likesCount > 0 ? (
          <button
            type="button"
            onClick={onOpenReactionsModal}
            className="flex items-center space-x-1.5 hover:underline cursor-pointer group focus:outline-none"
            title={language === 'en' ? 'See who reacted' : 'Xem ai đã bày tỏ cảm xúc'}
          >
            <div className="flex items-center -space-x-1">
              {topReactionIcons.map((ico, idx) => (
                <span
                  key={ico}
                  className="text-sm sm:text-base leading-none select-none drop-shadow-sm group-hover:scale-110 transition-transform"
                  style={{ zIndex: 30 - idx * 10 }}
                >
                  {ico}
                </span>
              ))}
            </div>
            <span className="font-semibold text-gray-700 dark:text-[#e4e6eb] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {likesCount}
            </span>
          </button>
        ) : (
          <span className="text-gray-400 dark:text-[#b0b3b8]">
            {language === 'en' ? 'Be the first to react' : 'Hãy là người đầu tiên thích'}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3 font-medium">
        <span>{Math.max(commentsLength, commentsCount)} {language === 'en' ? 'comments' : 'bình luận'}</span>
        <span>{sharesCount} {language === 'en' ? 'shares' : 'lượt chia sẻ'}</span>
      </div>
    </div>
  );
};
