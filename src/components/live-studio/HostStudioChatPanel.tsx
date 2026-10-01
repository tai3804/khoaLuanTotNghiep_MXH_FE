import React from 'react';
import { MessageSquare, Send, Reply, X } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { LiveComment } from '../../context/LiveStreamContext';

interface HostStudioChatPanelProps {
  comments: LiveComment[];
  commentInput: string;
  replyingTo: LiveComment | null;
  chatBottomRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  hostName?: string;
  onCommentInputChange: (val: string) => void;
  onStartReply: (comment: LiveComment) => void;
  onCancelReply: () => void;
  onSendComment: (e: React.FormEvent) => void;
  onSendReaction: (emoji: string) => void;
}

const QUICK_REACTIONS = ['❤️', '👍', '🔥', '😂', '🎉'];

export const HostStudioChatPanel: React.FC<HostStudioChatPanelProps> = ({
  comments,
  commentInput,
  replyingTo,
  chatBottomRef,
  inputRef,
  hostName,
  onCommentInputChange,
  onStartReply,
  onCancelReply,
  onSendComment,
  onSendReaction,
}) => {
  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {/* 1. Chat Panel Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-950/80 border-b border-zinc-800 shrink-0">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Trò chuyện trực tiếp</span>
        </div>
        <span className="text-[11px] font-semibold bg-zinc-800 text-gray-300 px-2 py-0.5 rounded-full">
          {comments.length} bình luận
        </span>
      </div>

      {/* 2. Messages List (Auto-scrolls to bottom) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 divide-y divide-zinc-800/40">
        {comments.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <MessageSquare className="w-8 h-8 text-zinc-700 mb-2 opacity-50" />
            <p className="text-xs font-medium">Chưa có bình luận nào</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Bình luận của người xem sẽ xuất hiện tại đây</p>
          </div>
        ) : (
          comments.map((c) => {
            const isHostComment =
              Boolean(hostName && c.authorName === hostName) ||
              c.authorName.includes('Admin') ||
              c.authorName.includes('Host');
            const targetReplyUser = c.replyToAuthor;

            return (
              <div key={c.id} className="pt-2.5 first:pt-0 group/item flex items-start space-x-2.5 animate-fadeIn">
                <UserAvatar src={c.authorAvatar} alt={c.authorName} size="sm" className="w-7 h-7 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-xs font-bold text-blue-400 truncate">{c.authorName}</span>

                      {/* Clean Text-only Host Badge */}
                      {isHostComment && (
                        <span className="px-1.5 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[9px] font-bold rounded">
                          HOST
                        </span>
                      )}

                      <span className="text-[10px] text-zinc-500">{c.time}</span>
                    </div>

                    {/* Reply Action Button */}
                    <button
                      type="button"
                      onClick={() => onStartReply(c)}
                      className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[10px] text-blue-400 hover:text-blue-300 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/20 cursor-pointer shrink-0"
                      title={`Trả lời ${c.authorName}`}
                    >
                      <Reply className="w-3 h-3" />
                      <span>Trả lời</span>
                    </button>
                  </div>

                  {/* Reply Reference Pill */}
                  {targetReplyUser && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400 bg-zinc-800/70 px-2 py-0.5 rounded w-fit my-1 border border-zinc-700/40">
                      <Reply className="w-2.5 h-2.5 text-blue-400" />
                      <span>
                        Đã trả lời <span className="text-blue-400 font-medium">@{targetReplyUser}</span>
                      </span>
                      {c.replyToContent && (
                        <span className="text-zinc-400 truncate max-w-[140px] italic">: "{c.replyToContent}"</span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-200 mt-0.5 break-words leading-relaxed">{c.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* 3. Quick Emoji Reactions Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950/60 border-t border-zinc-800/80 shrink-0">
        <span className="text-[10px] text-zinc-500 font-medium">Thả cảm xúc nhanh:</span>
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

      {/* 4. Replying-to Active Context Banner */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-blue-950/70 border-t border-blue-500/40 text-xs animate-fadeIn shrink-0">
          <div className="flex items-center space-x-1.5 truncate">
            <Reply className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[11px] font-bold text-blue-300">Trả lời @{replyingTo.authorName}:</span>
            <span className="text-[11px] text-zinc-300 truncate max-w-[200px]">"{replyingTo.content}"</span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-gray-400 hover:text-white p-0.5 rounded hover:bg-zinc-800 transition cursor-pointer"
            title="Hủy trả lời"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. Host Chat Input Form */}
      <form onSubmit={onSendComment} className="p-2.5 bg-zinc-950 border-t border-zinc-800 flex items-center space-x-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={commentInput}
          onChange={(e) => onCommentInputChange(e.target.value)}
          placeholder={replyingTo ? `Trả lời @${replyingTo.authorName}...` : 'Nhập phản hồi trực tiếp cho người xem...'}
          className="flex-1 bg-zinc-800/80 hover:bg-zinc-800 text-white text-xs px-3 py-2 rounded-lg outline-none placeholder-zinc-500 border border-zinc-700/60 focus:border-blue-500 transition"
        />
        <button
          type="submit"
          disabled={!commentInput.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-40 disabled:hover:bg-blue-600 transition cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
