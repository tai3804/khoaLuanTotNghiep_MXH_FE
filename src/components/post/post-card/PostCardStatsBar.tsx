import React from 'react';
import { Eye } from 'lucide-react';

interface PostCardStatsBarProps {
  likesCount: number;
  sharesCount: number;
  viewsCount?: number;
  totalComments: number;
  topReactionIcons: string[];
  language: string;
  setShowCommentModal: (val: boolean) => void;
  onOpenReactionsModal?: () => void;
}

export const PostCardStatsBar: React.FC<PostCardStatsBarProps> = ({
  likesCount,
  sharesCount,
  viewsCount,
  totalComments,
  topReactionIcons,
  language,
  setShowCommentModal,
  onOpenReactionsModal,
}) => {
  return (
    <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-[#b0b3b8]">
      <div className="flex items-center space-x-1.5 min-h-[20px]">
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
            <span className="text-gray-600 dark:text-[#b0b3b8] text-xs font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {likesCount}
            </span>
          </button>
        ) : (
          <span className="text-gray-400 dark:text-[#b0b3b8]/60 text-xs">
            {language === 'en' ? 'Be the first to react' : 'Hãy là người đầu tiên thích'}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-[#b0b3b8]">
        {viewsCount !== undefined && viewsCount > 0 && (
          <span
            className="flex items-center gap-1 font-medium text-gray-500 dark:text-[#b0b3b8] hover:text-blue-500 transition cursor-default"
            title={`${viewsCount.toLocaleString('vi-VN')} lượt xem`}
          >
            <Eye className="w-3.5 h-3.5 text-blue-500/80" />
            <span>{viewsCount.toLocaleString('vi-VN')}</span>
          </span>
        )}
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
