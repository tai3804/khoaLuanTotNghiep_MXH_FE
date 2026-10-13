import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, UserCheck } from 'lucide-react';
import { ProfileVisitor } from '../../../../types';
import { useLanguage } from '../../../../context/LanguageContext';

interface ProfileVisitorItemProps {
  visitor: ProfileVisitor;
  onCloseParent?: () => void;
}

export const ProfileVisitorItem: React.FC<ProfileVisitorItemProps> = ({
  visitor,
  onCloseParent,
}) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const handleNavigate = () => {
    if (onCloseParent) onCloseParent();
    navigate(`/profile/${visitor.viewerId}`);
  };

  const formatRelativeTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMinutes < 1) return isEn ? 'Just now' : 'Vừa xong';
      if (diffMinutes < 60) return isEn ? `${diffMinutes}m ago` : `${diffMinutes} phút trước`;
      if (diffHours < 24) return isEn ? `${diffHours}h ago` : `${diffHours} giờ trước`;
      if (diffDays === 1) return isEn ? 'Yesterday' : 'Hôm qua';
      if (diffDays < 30) return isEn ? `${diffDays}d ago` : `${diffDays} ngày trước`;
      return date.toLocaleDateString(isEn ? 'en-US' : 'vi-VN');
    } catch {
      return isEn ? 'Recently' : 'Gần đây';
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 hover:bg-gray-50/80 dark:hover:bg-[#3a3b3c]/50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 dark:hover:border-[#393a3b]">
      <div
        className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
        onClick={handleNavigate}
      >
        <div className="relative">
          <img
            src={visitor.avatarUrl || visitor.viewerAvatarUrl || '/default-avatar.png'}
            alt={visitor.fullName || visitor.viewerFullName || (isEn ? 'User' : 'Người dùng')}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#1877f2]/40 transition-all"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
          {visitor.isFriend && (
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1877f2] text-white flex items-center justify-center ring-2 ring-white dark:ring-[#242526]"
              title={isEn ? 'Friend' : 'Bạn bè'}
            >
              <UserCheck className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-[#e4e6eb] truncate group-hover:text-[#1877f2] dark:group-hover:text-[#4599ff] transition-colors">
              {visitor.fullName || visitor.viewerFullName || visitor.viewerUsername || (isEn ? 'User' : 'Người dùng')}
            </h5>
            {visitor.isFriend && (
              <span className="text-[10px] font-medium bg-blue-50 dark:bg-[#1877f2]/20 text-[#1877f2] dark:text-[#4599ff] px-1.5 py-0.5 rounded-md border border-[#1877f2]/20">
                {isEn ? 'Friend' : 'Bạn bè'}
              </span>
            )}
            {visitor.isFollowing && !visitor.isFriend && (
              <span className="text-[10px] font-medium bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8] px-1.5 py-0.5 rounded-md border border-gray-200/60 dark:border-[#393a3b]">
                {isEn ? 'Following' : 'Đang theo dõi'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
            <Clock className="w-3 h-3 text-gray-400 dark:text-[#8a8d91]" />
            <span>
              {isEn ? `Viewed ${formatRelativeTime(visitor.lastViewedAt)}` : `Đã xem ${formatRelativeTime(visitor.lastViewedAt)}`}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleNavigate}
        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] transition-colors shrink-0 ml-2"
      >
        {isEn ? 'View Profile' : 'Xem hồ sơ'}
      </button>
    </div>
  );
};
