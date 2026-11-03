import React from 'react';
import { MessageSquare, Filter } from 'lucide-react';
import { LiveComment } from '../../../context/LiveStreamContext';
import { useLanguage } from '../../../context/LanguageContext';
import { HostStudioMessageItem } from './HostStudioMessageItem';
import { ChatFilter } from './useHostStudioChat';

interface HostStudioMessageListProps {
  comments: LiveComment[];
  pinnedComment: LiveComment | null;
  copiedCommentId: string | null;
  hostName?: string;
  filter: ChatFilter;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  onFilterChange: (filter: ChatFilter) => void;
  onStartReply: (comment: LiveComment) => void;
  onPinComment: (comment: LiveComment) => void;
  onCopyComment: (content: string, id: string) => void;
  onDeleteComment: (id: string) => void;
  onBanViewer?: (userId: string, userName?: string) => void;
}

export const HostStudioMessageList: React.FC<HostStudioMessageListProps> = ({
  comments,
  pinnedComment,
  copiedCommentId,
  hostName,
  filter,
  chatBottomRef,
  onFilterChange,
  onStartReply,
  onPinComment,
  onCopyComment,
  onDeleteComment,
  onBanViewer,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Dedicated Filter Sub-Bar (Plenty of room, never cut off) */}
      <div className="px-3 py-1.5 bg-gray-50/70 dark:bg-zinc-950/60 border-b border-gray-200/50 dark:border-zinc-800/60 flex items-center justify-between text-xs shrink-0 select-none">
        <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">
          {comments.length} {t('live.chat.title', 'bình luận')}
        </span>

        <div className="flex items-center space-x-1 bg-gray-200/60 dark:bg-zinc-800/80 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => onFilterChange('all')}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
              filter === 'all'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('live.chat.filterAll', 'Tất cả')}
          </button>
          <button
            type="button"
            onClick={() => onFilterChange('host_only')}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition cursor-pointer ${
              filter === 'host_only'
                ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('live.chat.filterHost', 'Chỉ Host')}
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      {comments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-zinc-500 min-h-0">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-2.5">
            <MessageSquare className="w-6 h-6 text-gray-400 dark:text-zinc-600" />
          </div>
          <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
            {t('live.chat.noComments', 'Chưa có bình luận nào')}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-zinc-500 mt-1 max-w-[220px]">
            {t('live.chat.noCommentsSub', 'Bình luận của người xem sẽ xuất hiện tại đây theo thời gian thực.')}
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-gray-100 dark:divide-zinc-800/40">
          {comments.map((comment) => (
            <HostStudioMessageItem
              key={comment.id}
              comment={comment}
              hostName={hostName}
              isPinned={pinnedComment?.id === comment.id}
              isCopied={copiedCommentId === comment.id}
              onStartReply={onStartReply}
              onPinComment={onPinComment}
              onCopyComment={onCopyComment}
              onDeleteComment={onDeleteComment}
              onBanViewer={onBanViewer}
            />
          ))}
          <div ref={chatBottomRef} />
        </div>
      )}
    </div>
  );
};
