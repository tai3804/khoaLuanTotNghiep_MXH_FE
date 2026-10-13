import React from 'react';
import {
  Check,
  Globe2,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  ThumbsUp,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';
import { Post } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';
import { TimeAgo } from '../../common/TimeAgo';

interface GroupPendingPostCardProps {
  post: Post;
  isProcessing: boolean;
  onReview: (post: Post, approved: boolean) => void;
  onRequestRemove: (post: Post) => void;
}

export const GroupPendingPostCard: React.FC<GroupPendingPostCardProps> = ({
  post,
  isProcessing,
  onReview,
  onRequestRemove,
}) => {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 dark:border-[#393a3b] bg-white shadow-sm dark:bg-[#242526] transition">
      {/* Author and metadata */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar src={post.authorAvatar} alt={post.authorName} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                {post.authorName || 'Thành viên'}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
                <TimeAgo iso={post.createdAtRaw} fallback={post.createdAt} />
                <span>·</span>
                {post.privacy === 'PRIVATE' ? (
                  <Lock className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <Globe2 className="h-3.5 w-3.5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" />
              {post.likesCount || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {post.commentsCount || 0}
            </span>
          </div>
        </div>

        {/* Content */}
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-800 dark:text-gray-100">
          {post.content || 'Bài viết không có nội dung chữ.'}
        </p>
      </div>

      {/* Media previews */}
      {post.mediaList && post.mediaList.length > 0 ? (
        <div
          className={`grid gap-1 border-y border-gray-100 dark:border-[#393a3b] ${
            post.mediaList.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {post.mediaList.map((media, index) =>
            media.mediaType === 'VIDEO' ? (
              <video
                key={`${media.fileUrl}-${index}`}
                controls
                className="max-h-[360px] w-full bg-black object-contain"
              >
                <source src={media.fileUrl} />
              </video>
            ) : (
              <a
                key={`${media.fileUrl}-${index}`}
                href={media.fileUrl}
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src={media.fileUrl}
                  alt={`Tệp đính kèm ${index + 1}`}
                  className="max-h-[360px] w-full object-cover"
                />
              </a>
            )
          )}
        </div>
      ) : post.mediaUrls && post.mediaUrls.length > 0 ? (
        <div className="border-y border-gray-100 dark:border-[#393a3b]">
          <img
            src={post.mediaUrls[0]}
            alt="Tệp đính kèm"
            className="max-h-[360px] w-full object-cover"
          />
        </div>
      ) : null}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 bg-gray-50/50 dark:bg-[#1a1b1d]/40">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <ImageIcon className="h-4 w-4" />
          Chờ duyệt trước khi hiển thị
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onReview(post, true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] px-3.5 py-2 text-xs font-bold text-white transition disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {isProcessing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Duyệt
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onReview(post, false)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-100 transition disabled:opacity-60 cursor-pointer"
          >
            <X className="h-4 w-4" />
            Từ chối
          </button>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onRequestRemove(post)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-700 px-3.5 py-2 text-xs font-bold text-white transition disabled:opacity-60 cursor-pointer shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            Gỡ bài
          </button>
        </div>
      </div>
    </article>
  );
};
