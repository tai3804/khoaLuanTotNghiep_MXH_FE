import React from 'react';

interface PostCardStatsBarProps {
  likesCount: number;
  sharesCount: number;
  totalComments: number;
  topReactionIcons: string[];
  language: string;
  setShowCommentModal: (val: boolean) => void;
}

export const PostCardStatsBar: React.FC<PostCardStatsBarProps> = ({
  likesCount,
  sharesCount,
  totalComments,
  topReactionIcons,
  language,
  setShowCommentModal,
}) => {
  return (
    <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-[#b0b3b8]">
      <div className="flex items-center space-x-1.5 min-h-[20px]">
        {likesCount > 0 ? (
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center -space-x-1">
              {topReactionIcons.map((ico, idx) => (
                <span
                  key={ico}
                  className="text-sm sm:text-base leading-none select-none drop-shadow-sm"
                  style={{ zIndex: 30 - idx * 10 }}
                >
                  {ico}
                </span>
              ))}
            </div>
            <span className="text-gray-600 dark:text-[#b0b3b8] text-xs font-semibold">
              {likesCount}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 dark:text-[#b0b3b8]/60 text-xs">
            {language === 'en' ? 'Be the first to react' : 'Hãy là người đầu tiên thích'}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-[#b0b3b8]">
        <button
          type="button"
          onClick={() => setShowCommentModal(true)}
          className="hover:underline cursor-pointer font-medium"
        >
          {totalComments} {language === 'en' ? 'comments' : 'bình luận'}
        </button>
        <span className="font-medium">
          {sharesCount} {language === 'en' ? 'shares' : 'lượt chia sẻ'}
        </span>
      </div>
    </div>
  );
};
