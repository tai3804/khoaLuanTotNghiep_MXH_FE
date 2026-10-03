import React, { useState } from 'react';
import { CornerDownRight, Smile, Send, Sparkles } from 'lucide-react';
import { Comment } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';
import { aiService } from '../../../services/aiService';

interface PostCardCommentsPreviewProps {
  displayedComments: Comment[];
  allComments?: Comment[];
  rootCommentsCount?: number;
  totalComments: number;
  user: any;
  isAuthenticated: boolean;
  openLoginModal: () => void;
  inlineCommentText: string;
  setInlineCommentText: (text: string) => void;
  handleInlineCommentSubmit: (e: React.FormEvent) => void;
  setShowCommentModal: (val: boolean) => void;
  onViewProfile?: (userId: string) => void;
  t: (key: string) => string;
  language: string;
}

export const PostCardCommentsPreview: React.FC<PostCardCommentsPreviewProps> = ({
  displayedComments,
  allComments = [],
  rootCommentsCount,
  totalComments,
  user,
  isAuthenticated,
  openLoginModal,
  inlineCommentText,
  setInlineCommentText,
  handleInlineCommentSubmit,
  setShowCommentModal,
  onViewProfile,
  t,
  language,
}) => {
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const currentUid = String(user?.id || user?.userId || '').toLowerCase().trim();

  const totalRoot = rootCommentsCount !== undefined ? rootCommentsCount : displayedComments.length;
  const hasMoreRootComments = totalRoot > displayedComments.length;
  const remainingRootCount = Math.max(0, totalRoot - displayedComments.length);

  const handleFetchSmartReplies = async () => {
    if (showReplies && smartReplies.length > 0) {
      setShowReplies(false);
      return;
    }
    setShowReplies(true);
    if (smartReplies.length === 0) {
      setLoadingReplies(true);
      try {
        const latestComment = displayedComments[0]?.content || '';
        const replies = await aiService.suggestReplies('Bài viết trên mạng xã hội', latestComment);
        setSmartReplies(replies);
      } finally {
        setLoadingReplies(false);
      }
    }
  };

  return (
    <div className="p-3 bg-gray-50/60 dark:bg-[#242526] space-y-2.5 border-t border-gray-200 dark:border-[#393a3b]">
      {displayedComments.length > 0 && (
        <div className="space-y-3">
          {displayedComments.map((comment) => {
            const cUid = String(comment.userId || (comment as any)?.authorId || '').toLowerCase().trim();
            const isCommentOwner = Boolean(
              user && currentUid && cUid && currentUid !== 'me' && cUid !== 'me' && currentUid === cUid
            );
            const displayName =
              isCommentOwner && user?.fullName
                ? user.fullName
                : comment.authorName || 'Thành viên';
            const displayAvatar =
              isCommentOwner && user?.avatar
                ? user.avatar
                : comment.authorAvatar;

            // Find replies for this main comment
            const replies = allComments.filter(
              (r) => r.parentCommentId && String(r.parentCommentId) === String(comment.id)
            );
            const firstReply = replies.length > 0 ? replies[0] : null;
            const remainingRepliesCount = Math.max(0, replies.length - 1);

            return (
              <div key={comment.id} className="space-y-2">
                {/* Main Root Comment */}
                <div className="flex space-x-2.5 items-start">
                  <div
                    onClick={() => {
                      if (onViewProfile && comment.userId) onViewProfile(comment.userId);
                    }}
                    className="cursor-pointer shrink-0"
                  >
                    <UserAvatar src={displayAvatar} alt={displayName} size="sm" className="w-8 h-8 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-100 dark:bg-[#3a3b3c] p-2.5 px-3 rounded-2xl inline-block max-w-full">
                      <h5
                        onClick={() => {
                          if (onViewProfile && comment.userId) onViewProfile(comment.userId);
                        }}
                        className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] cursor-pointer hover:underline"
                      >
                        {displayName}
                      </h5>
                      <p className="text-xs text-gray-800 dark:text-[#e4e6eb] mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-0.5 ml-2 font-semibold">
                      <button type="button" className="hover:underline hover:text-[#2d88ff] cursor-pointer">
                        {t('like') || 'Thích'}
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setShowCommentModal(true)}
                        className="hover:underline hover:text-[#2d88ff] flex items-center space-x-1 cursor-pointer"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>{language === 'en' ? 'Reply' : 'Phản hồi'}</span>
                      </button>
                      <span>•</span>
                      <span>{comment.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* 1 Nested Reply (if any exists) */}
                {firstReply && (() => {
                  const rUid = String(firstReply.userId || (firstReply as any)?.authorId || '').toLowerCase().trim();
                  const isReplyOwner = Boolean(
                    user && currentUid && rUid && currentUid !== 'me' && rUid !== 'me' && currentUid === rUid
                  );
                  const rName = isReplyOwner && user?.fullName ? user.fullName : firstReply.authorName || 'Thành viên';
                  const rAvatar = isReplyOwner && user?.avatar ? user.avatar : firstReply.authorAvatar;

                  return (
                    <div className="ml-9 pl-3 border-l-2 border-gray-200 dark:border-[#393a3b] space-y-1.5 mt-1.5">
                      <div className="flex space-x-2 items-start">
                        <div
                          onClick={() => {
                            if (onViewProfile && firstReply.userId) onViewProfile(firstReply.userId);
                          }}
                          className="cursor-pointer shrink-0"
                        >
                          <UserAvatar src={rAvatar} alt={rName} size="sm" className="w-6.5 h-6.5 rounded-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-100 dark:bg-[#3a3b3c] p-2 px-3 rounded-2xl inline-block max-w-full">
                            <h6
                              onClick={() => {
                                if (onViewProfile && firstReply.userId) onViewProfile(firstReply.userId);
                              }}
                              className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] cursor-pointer hover:underline"
                            >
                              {rName}
                            </h6>
                            <p className="text-xs text-gray-800 dark:text-[#e4e6eb] mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                              {firstReply.content}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2.5 text-[10px] text-gray-500 dark:text-[#b0b3b8] mt-0.5 ml-2 font-semibold">
                            <button type="button" className="hover:underline hover:text-[#2d88ff] cursor-pointer">
                              {t('like') || 'Thích'}
                            </button>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => setShowCommentModal(true)}
                              className="hover:underline hover:text-[#2d88ff] cursor-pointer"
                            >
                              {language === 'en' ? 'Reply' : 'Phản hồi'}
                            </button>
                            <span>•</span>
                            <span>{firstReply.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* If more than 1 reply, show "Xem thêm X phản hồi..." */}
                      {remainingRepliesCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setShowCommentModal(true)}
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1.5 ml-2 pt-0.5"
                        >
                          <CornerDownRight className="w-3 h-3 rotate-180" />
                          <span>
                            {language === 'en'
                              ? `View ${remainingRepliesCount} more ${remainingRepliesCount === 1 ? 'reply' : 'replies'}...`
                              : `Xem thêm ${remainingRepliesCount} phản hồi...`}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      )}

      {/* View All / More Root Comments button */}
      {(hasMoreRootComments || totalComments > displayedComments.length) && (
        <button
          type="button"
          onClick={() => setShowCommentModal(true)}
          className="text-xs font-semibold text-gray-500 dark:text-[#b0b3b8] hover:underline cursor-pointer pl-1 py-1 block"
        >
          {hasMoreRootComments
            ? language === 'en'
              ? `View ${remainingRootCount} more comments (Total: ${totalComments})...`
              : `Xem thêm ${remainingRootCount} bình luận khác (Tổng: ${totalComments})...`
            : language === 'en'
            ? `View all ${totalComments} comments...`
            : `Xem tất cả ${totalComments} bình luận...`}
        </button>
      )}

      {/* AI Smart Quick Reply Chips */}
      {showReplies && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {loadingReplies ? (
            <span className="text-[11px] text-gray-400 italic">AI đang tạo gợi ý trả lời...</span>
          ) : (
            smartReplies.map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInlineCommentText(reply)}
                className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 rounded-full text-[11px] font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer shadow-xs"
              >
                {reply}
              </button>
            ))
          )}
        </div>
      )}

      {/* Inline Quick Comment Input Form */}
      <form onSubmit={handleInlineCommentSubmit} className="flex items-center space-x-2 pt-1">
        <UserAvatar src={user?.avatar} alt={user?.fullName || user?.username} size="sm" className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inlineCommentText}
            onChange={(e) => setInlineCommentText(e.target.value)}
            onClick={() => {
              if (!isAuthenticated) openLoginModal();
            }}
            placeholder={
              !isAuthenticated
                ? language === 'en'
                  ? 'Log in to comment...'
                  : 'Đăng nhập để bình luận...'
                : t('writeComment') || 'Viết bình luận...'
            }
            className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full pl-4 pr-16 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#2d88ff]"
          />
          <div className="absolute right-2.5 flex items-center space-x-1.5">
            <button
              type="button"
              onClick={handleFetchSmartReplies}
              title="Gợi ý trả lời nhanh bằng AI"
              className={`p-1 rounded-full transition cursor-pointer ${
                showReplies
                  ? 'text-[#1877f2] bg-blue-100 dark:bg-blue-900/40'
                  : 'text-gray-400 hover:text-[#1877f2]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowCommentModal(true)}
              className="text-gray-400 hover:text-amber-500 cursor-pointer"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={!inlineCommentText.trim()}
          className="p-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-full disabled:opacity-40 transition shadow-sm cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
