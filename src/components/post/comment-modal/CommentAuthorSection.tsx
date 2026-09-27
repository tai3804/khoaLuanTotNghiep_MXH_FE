import React from 'react';
import { Globe, Users, Lock } from 'lucide-react';
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
  const renderPrivacyIcon = () => {
    if (post.privacy === 'PRIVATE') {
      return (
        <span title="Chỉ mình tôi" className="flex items-center">
          <Lock className="w-3 h-3 text-amber-500" />
        </span>
      );
    }
    if (post.privacy === 'FRIENDS') {
      return (
        <span title="Bạn bè" className="flex items-center">
          <Users className="w-3 h-3 text-emerald-500" />
        </span>
      );
    }
    return (
      <span title="Công khai" className="flex items-center">
        <Globe className="w-3 h-3 text-gray-500 dark:text-[#b0b3b8]" />
      </span>
    );
  };

  return (
    <div className="flex items-center justify-between pb-1">
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
            {renderPrivacyIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};
