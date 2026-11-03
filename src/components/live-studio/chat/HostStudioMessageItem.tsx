import React from 'react';
import { Reply, Pin, Copy, Trash2, Check, Ban } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { LiveComment } from '../../../context/LiveStreamContext';
import { useLanguage } from '../../../context/LanguageContext';

interface HostStudioMessageItemProps {
  comment: LiveComment;
  hostName?: string;
  isPinned: boolean;
  isCopied: boolean;
  onStartReply: (comment: LiveComment) => void;
  onPinComment: (comment: LiveComment) => void;
  onCopyComment: (content: string, id: string) => void;
  onDeleteComment: (id: string) => void;
  onBanViewer?: (userId: string, userName?: string) => void;
}

export const HostStudioMessageItem: React.FC<HostStudioMessageItemProps> = ({
  comment,
  hostName,
  isPinned,
  isCopied,
  onStartReply,
  onPinComment,
  onCopyComment,
  onDeleteComment,
  onBanViewer,
}) => {
  const { t } = useLanguage();

  const isHostComment =
    Boolean(hostName && comment.authorName === hostName) ||
    comment.authorName.includes('Admin') ||
    comment.authorName.includes('Host');

  return (
    <div className="group/item relative px-3 py-2 hover:bg-gray-100/70 dark:hover:bg-zinc-800/50 transition-colors animate-fadeIn flex items-start space-x-2.5">
      <UserAvatar
        src={comment.authorAvatar}
        alt={comment.authorName}
        size="sm"
        className="w-7 h-7 shrink-0 mt-0.5 rounded-full ring-1 ring-gray-200 dark:ring-zinc-700"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-900 dark:text-blue-400 truncate">
            {comment.authorName}
          </span>

          {/* Host Badge */}
          {isHostComment && (
            <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-400/20 text-[9px] font-bold rounded">
              HOST
            </span>
          )}

          <span className="text-[10px] text-gray-500 dark:text-zinc-500">{comment.time}</span>
        </div>

        {/* Replying-to Preview Pill */}
        {comment.replyToAuthor && (
          <div className="flex items-center space-x-1 text-[10px] text-gray-500 dark:text-zinc-400 bg-gray-200/60 dark:bg-zinc-800/70 px-2 py-0.5 rounded w-fit my-1 border border-gray-300/40 dark:border-zinc-700/40">
            <Reply className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400" />
            <span>
              {t('live.chat.replyingTo', 'Đang trả lời')}{' '}
              <span className="text-blue-600 dark:text-blue-400 font-medium">@{comment.replyToAuthor}</span>
            </span>
            {comment.replyToContent && (
              <span className="text-gray-500 dark:text-zinc-400 truncate max-w-[130px] italic">
                : "{comment.replyToContent}"
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-gray-800 dark:text-gray-200 mt-0.5 break-words leading-relaxed select-text">
          {comment.content}
        </p>
      </div>

      {/* Floating Action Menu on Message (Hover / Always Accessible) */}
      <div className="opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity flex items-center space-x-0.5 bg-white/95 dark:bg-zinc-900/95 border border-gray-200 dark:border-zinc-700/70 rounded-lg p-0.5 shadow-md shrink-0">
        {/* 1. Reply */}
        <button
          type="button"
          onClick={() => onStartReply(comment)}
          className="p-1 rounded text-gray-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          title={t('live.chat.reply', 'Trả lời')}
        >
          <Reply className="w-3 h-3" />
        </button>

        {/* 2. Pin */}
        <button
          type="button"
          onClick={() => onPinComment(comment)}
          className={`p-1 rounded transition cursor-pointer ${
            isPinned
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60'
              : 'text-gray-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
          title={isPinned ? t('live.chat.unpin', 'Bỏ ghim') : t('live.chat.pin', 'Ghim')}
        >
          <Pin className="w-3 h-3" />
        </button>

        {/* 3. Copy */}
        <button
          type="button"
          onClick={() => onCopyComment(comment.content, comment.id)}
          className="p-1 rounded text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          title={t('live.chat.copy', 'Sao chép')}
        >
          {isCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>

        {/* 4. Delete / Hide */}
        <button
          type="button"
          onClick={() => onDeleteComment(comment.id)}
          className="p-1 rounded text-gray-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          title={t('live.chat.delete', 'Xóa')}
        >
          <Trash2 className="w-3 h-3" />
        </button>

        {/* 5. Ban Viewer from Room */}
        {!isHostComment && onBanViewer && (
          <button
            type="button"
            onClick={() => onBanViewer(comment.id, comment.authorName)}
            className="p-1 rounded text-gray-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title={t('live.audience.ban', 'Cấm khỏi phòng')}
          >
            <Ban className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
