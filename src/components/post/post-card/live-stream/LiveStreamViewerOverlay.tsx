import React from 'react';
import { Send, Reply, X } from 'lucide-react';
import { LiveComment } from '../../../../context/LiveStreamContext';

interface LiveStreamViewerOverlayProps {
  comments: LiveComment[];
  commentInput: string;
  replyingTo?: LiveComment | null;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  isHost?: boolean;
  onCommentInputChange: (val: string) => void;
  onStartReply?: (comment: LiveComment) => void;
  onCancelReply?: () => void;
  onSendComment: (e: React.FormEvent) => void;
  onSendReaction: (emoji: string) => void;
}

const QUICK_REACTION_EMOJIS = ['❤️', '👍', '🔥', '😂', '🎉'];

export const LiveStreamViewerOverlay: React.FC<LiveStreamViewerOverlayProps> = ({
  comments,
  commentInput,
  replyingTo,
  inputRef,
  isHost = false,
  onCommentInputChange,
  onStartReply,
  onCancelReply,
  onSendComment,
  onSendReaction,
}) => {
  return (
    <div
      className={`absolute inset-x-3 flex flex-col justify-end pointer-events-none z-30 ${
        isHost ? 'bottom-16' : 'bottom-3'
      }`}
    >
      {/* Real Live Chat Bubbles (Max 4 visible) with reply on click */}
      <div className="space-y-1.5 mb-2 max-w-xs sm:max-w-sm pointer-events-auto">
        {comments.slice(-4).map((c) => {
          const isHostComment = c.authorName.includes('Admin') || c.authorName.includes('Host');
          const targetReplyUser = c.replyToAuthor;

          return (
            <div
              key={c.id}
              onClick={() => onStartReply?.(c)}
              className="group/bubble backdrop-blur-md rounded-xl p-2 text-white shadow-lg animate-fadeIn text-xs flex items-start space-x-2 cursor-pointer transition-all bg-black/80 hover:bg-black/90 border border-white/10 hover:border-blue-500/40"
              title="Nhấn để trả lời bình luận này"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="font-bold text-blue-400 truncate">{c.authorName}</span>
                    {isHostComment && (
                      <span className="px-1.5 py-0.5 bg-amber-400/10 text-amber-400 border border-amber-400/20 text-[9px] font-bold rounded">
                        HOST
                      </span>
                    )}
                  </div>
                  {onStartReply && (
                    <span className="opacity-0 group-hover/bubble:opacity-100 text-[10px] text-blue-300 flex items-center space-x-0.5 shrink-0 transition-opacity">
                      <Reply className="w-2.5 h-2.5" />
                      <span>Trả lời</span>
                    </span>
                  )}
                </div>

                {targetReplyUser && (
                  <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded flex items-center space-x-1 my-1 w-fit border border-zinc-700/50">
                    <Reply className="w-2.5 h-2.5 text-blue-400" />
                    <span>
                      Đã trả lời <span className="text-blue-400 font-medium">@{targetReplyUser}</span>
                    </span>
                    {c.replyToContent && (
                      <span className="text-zinc-400 truncate max-w-[140px] italic">: "{c.replyToContent}"</span>
                    )}
                  </div>
                )}

                <p className="text-gray-100 break-words leading-tight mt-0.5">
                  {c.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Viewer Chat Input & Quick Reactions Bar (Only for Viewers, Host has Host Controls) */}
      {!isHost && (
        <div className="space-y-1.5 pointer-events-auto">
          {/* Active Replying-To Banner */}
          {replyingTo && (
            <div className="flex items-center justify-between px-3 py-1 bg-blue-950/80 backdrop-blur-md rounded-lg border border-blue-500/30 text-xs animate-fadeIn max-w-md">
              <div className="flex items-center space-x-1.5 truncate">
                <Reply className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="text-[11px] font-bold text-blue-400">Trả lời {replyingTo.authorName}:</span>
                <span className="text-[11px] text-gray-300 truncate max-w-[180px]">"{replyingTo.content}"</span>
              </div>
              <button
                type="button"
                onClick={onCancelReply}
                className="text-gray-400 hover:text-white p-0.5 rounded cursor-pointer"
                title="Hủy trả lời"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <form
              onSubmit={onSendComment}
              className="flex-1 flex items-center bg-black/70 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20 focus-within:border-blue-500 transition"
            >
              <input
                ref={inputRef}
                type="text"
                value={commentInput}
                onChange={(e) => onCommentInputChange(e.target.value)}
                placeholder={replyingTo ? `Trả lời @${replyingTo.authorName}...` : 'Bình luận trực tiếp...'}
                className="flex-1 bg-transparent text-white text-xs placeholder-gray-400 outline-none pr-2"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="text-blue-400 hover:text-blue-300 disabled:opacity-30 cursor-pointer transition p-1"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Quick Reaction Emojis */}
            <div className="flex items-center space-x-1 bg-black/70 backdrop-blur-md p-1 rounded-full border border-white/20">
              {QUICK_REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSendReaction(emoji)}
                  className="w-7 h-7 flex items-center justify-center hover:scale-125 transition-transform text-sm cursor-pointer rounded-full active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
