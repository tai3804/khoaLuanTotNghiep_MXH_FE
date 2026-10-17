import React, { RefObject } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { Comment } from '../../../types';

interface ReelsCommentsDrawerProps {
  isOpen: boolean;
  comments: Comment[];
  loading: boolean;
  newCommentText: string;
  submitting: boolean;
  onClose: () => void;
  onCommentTextChange: (text: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  bottomRef: RefObject<HTMLDivElement | null>;
}

export const ReelsCommentsDrawer: React.FC<ReelsCommentsDrawerProps> = ({
  isOpen,
  comments,
  loading,
  newCommentText,
  submitting,
  onClose,
  onCommentTextChange,
  onSubmitComment,
  bottomRef,
}) => {
  if (!isOpen) return null;

  return (
    <div className="ml-4 w-80 sm:w-96 h-[92vh] max-h-[840px] bg-white dark:bg-[#242526] rounded-2xl flex flex-col shadow-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden transition-all duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#393a3b]">
        <h3 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">
          Bình luận ({comments.length})
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#1877f2]" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start space-x-2.5 text-xs">
              <img
                src={c.authorAvatar || '/default-avatar.png'}
                alt={c.authorName}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] p-2.5 rounded-2xl">
                <span className="font-bold text-gray-900 dark:text-[#e4e6eb] block mb-0.5">
                  {c.authorName}
                </span>
                <p className="text-gray-700 dark:text-[#d1d5db] break-words whitespace-pre-wrap">
                  {c.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={onSubmitComment}
        className="p-3 border-t border-gray-200 dark:border-[#393a3b] flex items-center space-x-2 bg-gray-50 dark:bg-[#1c1d1e]"
      >
        <input
          type="text"
          value={newCommentText}
          onChange={(e) => onCommentTextChange(e.target.value)}
          placeholder="Thêm bình luận..."
          className="flex-1 bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 text-xs rounded-full border border-gray-200 dark:border-[#4e4f50] focus:outline-none focus:ring-1 focus:ring-[#1877f2]"
        />
        <button
          type="submit"
          disabled={!newCommentText.trim() || submitting}
          className="p-2 rounded-full bg-[#1877f2] text-white hover:bg-[#166fe5] disabled:opacity-50 transition cursor-pointer"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};
