import React from 'react';
import { Globe, Users, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';
import { groupMetaCache } from '../../../services/api';

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
  const navigate = useNavigate();

  const isGroupPost = Boolean(post.groupId);
  const cachedGroup = post.groupId ? groupMetaCache[post.groupId] : undefined;
  const groupName = post.groupName || cachedGroup?.name || 'Nhóm';
  const groupCover = post.groupAvatar || post.groupCover || cachedGroup?.coverUrl;
  const groupPrivacy = post.groupPrivacy || cachedGroup?.privacy || (post.privacy === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC');

  const renderPrivacyIcon = () => {
    if (post.privacy === 'PRIVATE' || groupPrivacy === 'PRIVATE') {
      return (
        <span title="Chỉ mình tôi / Nhóm riêng tư" className="flex items-center">
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
      {isGroupPost ? (
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="relative w-11 h-11 shrink-0">
            <div
              onClick={() => {
                onClose();
                navigate(`/groups/${post.groupId}`);
              }}
              className="w-10 h-10 rounded-xl overflow-hidden bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center cursor-pointer border border-gray-200 dark:border-[#393a3b] hover:opacity-90 transition shadow-xs"
              title={groupName}
            >
              {groupCover ? (
                <img src={groupCover} alt={groupName} className="w-full h-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onViewProfile && post.userId) {
                  onClose();
                  onViewProfile(post.userId);
                }
              }}
              className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full ring-2 ring-white dark:ring-[#242526] overflow-hidden cursor-pointer hover:scale-110 transition bg-white dark:bg-[#242526]"
              title={authorName}
            >
              <UserAvatar
                src={authorAvatar}
                alt={authorName}
                size="sm"
                className="w-full h-full rounded-full"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span
                onClick={() => {
                  onClose();
                  navigate(`/groups/${post.groupId}`);
                }}
                className="font-bold text-gray-900 dark:text-[#e4e6eb] text-sm hover:underline cursor-pointer truncate max-w-[240px] sm:max-w-xs block leading-tight"
                title={groupName}
              >
                {groupName}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5 flex-wrap leading-tight">
              <span
                onClick={() => {
                  if (onViewProfile && post.userId) {
                    onClose();
                    onViewProfile(post.userId);
                  }
                }}
                className="font-semibold text-gray-700 dark:text-[#d0d2d6] hover:underline cursor-pointer truncate max-w-[140px] inline-block"
              >
                {authorName}
              </span>
              <span>•</span>
              <span>{post.createdAt || 'Vừa xong'}</span>
              <span>•</span>
              {renderPrivacyIcon()}
            </div>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};
