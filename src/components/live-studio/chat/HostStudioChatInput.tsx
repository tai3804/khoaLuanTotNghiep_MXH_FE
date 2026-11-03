import React from 'react';
import { Send, Reply, X } from 'lucide-react';
import { LiveComment } from '../../../context/LiveStreamContext';
import { useLanguage } from '../../../context/LanguageContext';

const QUICK_REACTIONS = ['❤️', '👍', '🔥', '😂', '🎉'];

interface HostStudioChatInputProps {
  commentInput: string;
  replyingTo: LiveComment | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onCommentInputChange: (val: string) => void;
  onCancelReply: () => void;
  onSendComment: (e: React.FormEvent) => void;
  onSendReaction: (emoji: string) => void;
}

export const HostStudioChatInput: React.FC<HostStudioChatInputProps> = ({
  commentInput,
  replyingTo,
  inputRef,
  onCommentInputChange,
  onCancelReply,
  onSendComment,
  onSendReaction,
}) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col bg-white dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 shrink-0">
      {/* 1. Quick Emoji Reactions Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50/80 dark:bg-zinc-950/60 border-b border-gray-200/50 dark:border-zinc-800/80">
        <span className="text-[10px] text-gray-500 dark:text-zinc-500 font-medium">
          {t('live.chat.quickReactions', 'Thả cảm xúc nhanh:')}
        </span>
        <div className="flex items-center space-x-1">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSendReaction(emoji)}
              className="w-6 h-6 flex items-center justify-center hover:scale-125 transition-transform text-sm cursor-pointer rounded-full active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Replying-to Active Context Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-950/70 border-b border-blue-200 dark:border-blue-500/40 text-xs animate-fadeIn">
          <div className="flex items-center space-x-1.5 truncate">
            <Reply className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-300">
              {t('live.chat.replyingTo', 'Đang trả lời')} @{replyingTo.authorName}:
            </span>
            <span className="text-[11px] text-gray-600 dark:text-zinc-300 truncate max-w-[190px]">
              "{replyingTo.content}"
            </span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-0.5 rounded hover:bg-blue-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title={t('live.chat.cancelReply', 'Hủy trả lời')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Host Chat Input Form */}
      <form onSubmit={onSendComment} className="p-2.5 flex items-center space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={commentInput}
          onChange={(e) => onCommentInputChange(e.target.value)}
          placeholder={
            replyingTo
              ? `${t('live.chat.reply', 'Trả lời')} @${replyingTo.authorName}...`
              : t('live.chat.placeholder', 'Nhập phản hồi trực tiếp cho người xem...')
          }
          className="flex-1 bg-gray-100 dark:bg-zinc-800/80 hover:bg-gray-100/90 dark:hover:bg-zinc-800 text-gray-900 dark:text-white text-xs px-3 py-2 rounded-lg outline-none placeholder-gray-400 dark:placeholder-zinc-500 border border-gray-300/80 dark:border-zinc-700/60 focus:border-blue-500 dark:focus:border-blue-500 transition"
        />
        <button
          type="submit"
          disabled={!commentInput.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-40 disabled:hover:bg-blue-600 transition cursor-pointer shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
