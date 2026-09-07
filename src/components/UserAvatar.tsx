import React, { useState } from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
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
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-lg',
    xl: 'w-16 h-16 text-2xl',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const baseSizeClass = sizeClasses[size] || 'w-9 h-9 text-base';
  const iconSizeClass = iconSizes[size] || 'w-5 h-5';

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        className={`${baseSizeClass} rounded-full object-cover border border-blue-500 shadow-sm flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${baseSizeClass} rounded-full bg-gradient-to-tr from-slate-400 to-slate-500 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center text-white shadow-sm flex-shrink-0 border border-slate-300 dark:border-slate-600 ${className}`}
      title={alt}
    >
      <User className={`${iconSizeClass} text-white fill-white/20`} />
    </div>
  );
};
