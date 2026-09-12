import React from 'react';
import { Globe } from 'lucide-react';
import { Post } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';

interface CommentAuthorSectionProps {
  post: Post;
  authorName: string;
  authorAvatar?: string;
  onViewProfile?: (userId: string) => void;
  onClose: () => void;
}

export const CommentAuthorSection: React.FC<CommentAuthorSectionProps> = ({
  post,
  authorName,
  authorAvatar,
  onViewProfile,
  onClose,
}) => {
  return (
    <div className="space-y-3">
      {/* Author Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            onClick={() => {
              if (onViewProfile && post.userId) {
                onClose();
                onViewProfile(post.userId);
              }
            }}
            className="cursor-pointer hover:opacity-90 transition"
          >
            <UserAvatar src={authorAvatar} alt={authorName} size="md" className="w-10 h-10 rounded-full" />
          </div>
          <div>
            <h4
              onClick={() => {
                if (onViewProfile && post.userId) {
                  onClose();
                  onViewProfile(post.userId);
                }
              }}
              className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb] hover:underline cursor-pointer leading-tight"
            >
              {authorName}
            </h4>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
              <span>{post.createdAt || 'Vừa xong'}</span>
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Post Text */}
      {post.content && (
        <p className="text-sm text-gray-900 dark:text-[#e4e6eb] whitespace-pre-line leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Post Media */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="rounded-xl overflow-hidden bg-black/5 dark:bg-black/30 my-2">
          {post.mediaUrls.length === 1 ? (
            <img src={post.mediaUrls[0]} alt="Media" className="w-full max-h-[450px] object-cover" />
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.mediaUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`Media ${idx}`} className="w-full h-56 object-cover" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
