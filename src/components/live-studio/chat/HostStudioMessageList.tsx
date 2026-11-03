import React from 'react';
import { MessageSquare } from 'lucide-react';
import { LiveComment } from '../../../context/LiveStreamContext';
import { useLanguage } from '../../../context/LanguageContext';
import { HostStudioMessageItem } from './HostStudioMessageItem';

interface HostStudioMessageListProps {
  comments: LiveComment[];
  pinnedComment: LiveComment | null;
  copiedCommentId: string | null;
  hostName?: string;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  onStartReply: (comment: LiveComment) => void;
  onPinComment: (comment: LiveComment) => void;
  onCopyComment: (content: string, id: string) => void;
  onDeleteComment: (id: string) => void;
}

export const HostStudioMessageList: React.FC<HostStudioMessageListProps> = ({
  comments,
  pinnedComment,
  copiedCommentId,
  hostName,
  chatBottomRef,
  onStartReply,
  onPinComment,
  onCopyComment,
  onDeleteComment,
}) => {
  const { t } = useLanguage();

  if (comments.length === 0) {
    return (
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
    );
  }

  return (
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
        />
      ))}
      <div ref={chatBottomRef} />
    </div>
  );
};
