import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, UserCheck, UserPlus } from 'lucide-react';
import { ProfileVisitor } from '../../../../types';

interface ProfileVisitorItemProps {
  visitor: ProfileVisitor;
  onCloseParent?: () => void;
}

export const ProfileVisitorItem: React.FC<ProfileVisitorItemProps> = ({
  visitor,
  onCloseParent,
}) => {
  const navigate = useNavigate();

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

      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 30) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'Gần đây';
    }
  };

  return (
    <div className="flex items-center justify-between p-3.5 hover:bg-gray-50/80 dark:hover:bg-gray-800/60 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200 dark:hover:border-gray-700/50">
      <div
        className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
        onClick={handleNavigate}
      >
        <div className="relative">
          <img
            src={visitor.avatarUrl || visitor.viewerAvatarUrl || '/default-avatar.png'}
            alt={visitor.fullName || visitor.viewerFullName || 'Người dùng'}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-blue-500/40 transition-all"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
          {visitor.isFriend && (
            <span
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-900"
              title="Bạn bè"
            >
              <UserCheck className="w-2.5 h-2.5" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {visitor.fullName || visitor.viewerFullName || visitor.viewerUsername || 'Người dùng'}
            </h5>
            {visitor.isFriend && (
              <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                Bạn bè
              </span>
            )}
            {visitor.isFollowing && !visitor.isFriend && (
              <span className="text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md border border-blue-500/20">
                Đang theo dõi
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>Đã xem {formatRelativeTime(visitor.lastViewedAt)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleNavigate}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors shrink-0 ml-2"
      >
        Xem hồ sơ
      </button>
    </div>
  );
};
