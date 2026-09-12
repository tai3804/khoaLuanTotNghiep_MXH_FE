import React from 'react';
import { useUserAvatar, DEFAULT_AVATAR_URL } from './useUserAvatar';

export { DEFAULT_AVATAR_URL };

export interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
}) => {
  const { effectiveSrc, handleError } = useUserAvatar({ src });

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg',
    xl: 'w-16 h-16 text-2xl',
  };

  const baseSizeClass = sizeClasses[size] || 'w-9 h-9 text-base';

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      onError={handleError}
      className={`${baseSizeClass} rounded-full object-cover border border-gray-200/80 dark:border-slate-700 shadow-sm shrink-0 ${className}`}
    />
  );
};
