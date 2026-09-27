import React from 'react';
import { Send } from 'lucide-react';
import { LiveComment } from '../../../../context/LiveStreamContext';

interface LiveStreamViewerOverlayProps {
  comments: LiveComment[];
  commentInput: string;
  onCommentInputChange: (val: string) => void;
  onSendComment: (e: React.FormEvent) => void;
  onSendReaction: (emoji: string) => void;
}

const QUICK_REACTION_EMOJIS = ['❤️', '👍', '🔥', '😂', '🎉'];

export const LiveStreamViewerOverlay: React.FC<LiveStreamViewerOverlayProps> = ({
  comments,
  commentInput,
  onCommentInputChange,
  onSendComment,
  onSendReaction,
}) => {
  return (
    <div className="absolute inset-x-3 bottom-3 flex flex-col justify-end pointer-events-none z-30">
      {/* Real Live Chat Bubbles (Max 3 visible) */}
      <div className="space-y-1.5 mb-2 max-w-xs sm:max-w-sm pointer-events-auto">
        {comments.slice(-3).map((c) => (
          <div
            key={c.id}
            className="bg-black/65 backdrop-blur-md rounded-xl p-2 text-white border border-white/10 shadow-lg animate-fadeIn text-xs flex items-start space-x-2"
          >
            <span className="font-bold text-blue-400 shrink-0">{c.authorName}:</span>
            <span className="text-gray-100 break-words leading-tight">{c.content}</span>
          </div>
        ))}
      </div>

      {/* Viewer Chat Input & Quick Reactions Bar */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        <form
          onSubmit={onSendComment}
          className="flex-1 flex items-center bg-black/65 backdrop-blur-md rounded-full px-3 py-1 border border-white/20"
        >
          <input
            type="text"
            value={commentInput}
            onChange={(e) => onCommentInputChange(e.target.value)}
            placeholder="Bình luận trực tiếp..."
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
        <div className="flex items-center space-x-1 bg-black/65 backdrop-blur-md p-1 rounded-full border border-white/20">
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
  );
};
