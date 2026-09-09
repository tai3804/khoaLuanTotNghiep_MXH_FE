import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const DEFAULT_AVATAR_URL = '/default-avatar.png';

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg',
    xl: 'w-16 h-16 text-2xl',
  };

  const baseSizeClass = sizeClasses[size] || 'w-9 h-9 text-base';
  const effectiveSrc = (src && !imageError && src.trim() !== '') ? src : DEFAULT_AVATAR_URL;

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      onError={() => {
        if (!imageError) setImageError(true);
      }}
      className={`${baseSizeClass} rounded-full object-cover border border-gray-200/80 dark:border-slate-700 shadow-sm shrink-0 ${className}`}
    />
  );
};
