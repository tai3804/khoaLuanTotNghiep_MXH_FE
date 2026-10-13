import React, { useState } from 'react';
import { Send, Smile } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { CommentAiSuggestions } from './CommentAiSuggestions';
import { useMentionSuggestions, MentionDropdown } from '../../common/mention-autocomplete';
import { EmojiPickerPopover } from '../../common/EmojiPickerPopover';

interface CommentFormFooterProps {
  user: any;
  isAuthenticated: boolean;
  replyingTo: { id: string; authorName: string } | null;
  setReplyingTo: (val: any) => void;
  commentText: string;
  setCommentText: (val: string) => void;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  t: (key: string) => string;
  language: string;
  postContent?: string;
}

export const CommentFormFooter: React.FC<CommentFormFooterProps> = ({
  user,
  isAuthenticated,
  replyingTo,
  setReplyingTo,
  commentText,
  setCommentText,
  submitting,
  handleSubmit,
  inputRef,
  t,
  language,
  postContent,
}) => {
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const {
    isOpen: isMentionOpen,
    loading: isMentionLoading,
    candidates: mentionCandidates,
    selectedIndex: mentionSelectedIndex,
    selectCandidate: handleSelectMention,
    handleKeyDown: handleMentionKeyDown,
  } = useMentionSuggestions({
    text: commentText,
    cursorPosition: cursorPos,
    onMentionSelected: (_candidate, markdown) => {
      if (cursorPos === null) {
        setCommentText(commentText + markdown);
        return;
      }
      const textBefore = commentText.slice(0, cursorPos);
      const textAfter = commentText.slice(cursorPos);
      const atIndex = textBefore.lastIndexOf('@');
      const prefix = atIndex >= 0 ? textBefore.slice(0, atIndex) : textBefore;
      const newContent = prefix + markdown + textAfter;
      const newCursor = (prefix + markdown).length;
      setCommentText(newContent);
      setCursorPos(newCursor);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursor, newCursor);
        }
      }, 10);
    },
  });

  const handleSelectEmoji = (emoji: string) => {
    if (cursorPos !== null && inputRef.current) {
      const textBefore = commentText.slice(0, cursorPos);
      const textAfter = commentText.slice(cursorPos);
      const newContent = textBefore + emoji + textAfter;
      const newCursor = cursorPos + emoji.length;
      setCommentText(newContent);
      setCursorPos(newCursor);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(newCursor, newCursor);
      }, 10);
    } else {
      setCommentText((prev) => prev + emoji);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    setShowEmojiPicker(false);
    handleSubmit(e);
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] shrink-0 space-y-2">
      {/* AI Smart Replies Bar */}
      {isAuthenticated && (
        <CommentAiSuggestions
          postContent={postContent}
          replyingToName={replyingTo?.authorName}
          onSelectReply={(reply) => {
            setCommentText(reply);
            inputRef.current?.focus();
          }}
        />
      )}

      {/* Replying banner indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg">
          <span>
            {language === 'en' ? `Replying to ${replyingTo.authorName}` : `Đang phản hồi ${replyingTo.authorName}`}
          </span>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="text-xs hover:underline cursor-pointer font-bold ml-2 text-red-500"
          >
            {language === 'en' ? 'Cancel' : 'Hủy'}
          </button>
        </div>
      )}

      <form onSubmit={onFormSubmit} className="flex items-center space-x-2">
        <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="sm" className="w-9 h-9 rounded-full shrink-0" />
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              setCursorPos(e.target.selectionStart);
            }}
            onKeyUp={(e) => setCursorPos(e.currentTarget.selectionStart)}
            onClick={(e) => setCursorPos(e.currentTarget.selectionStart)}
            onKeyDown={(e) => {
              if (handleMentionKeyDown(e)) return;
            }}
            placeholder={
              !isAuthenticated
                ? (language === 'en' ? 'Log in to comment...' : 'Đăng nhập để bình luận...')
                : replyingTo
                ? (language === 'en' ? `Reply to ${replyingTo.authorName}...` : `Trả lời ${replyingTo.authorName}...`)
                : (t('writeComment') || 'Viết bình luận... (gõ @ để nhắc đến ai đó)')
            }
            className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full pl-4 pr-10 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
          />

          {/* Inline Mention Dropdown for Comments */}
          <MentionDropdown
            isOpen={isMentionOpen}
            loading={isMentionLoading}
            candidates={mentionCandidates}
            selectedIndex={mentionSelectedIndex}
            onSelect={handleSelectMention}
            className="bottom-full left-0 mb-2"
          />

          <div className="absolute right-2.5 flex items-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker((prev) => !prev);
              }}
              className={`p-1 rounded-full transition cursor-pointer ${
                showEmojiPicker
                  ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30'
                  : 'text-gray-400 hover:text-amber-500'
              }`}
              title="Chèn biểu tượng cảm xúc"
            >
              <Smile className="w-4 h-4" />
            </button>

            <EmojiPickerPopover
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              onSelectEmoji={handleSelectEmoji}
              className="bottom-full right-0 mb-2"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!commentText.trim() || submitting}
          className="p-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full disabled:opacity-40 transition shadow-md cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
