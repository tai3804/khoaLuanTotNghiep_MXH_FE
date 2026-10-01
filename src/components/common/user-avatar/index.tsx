import React from 'react';
import { User } from 'lucide-react';
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
  const { hasError, effectiveSrc, handleError } = useUserAvatar({ src });

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

  if (hasError || !effectiveSrc) {
    const initial = alt && alt !== 'Avatar' && alt.trim() ? alt.trim().charAt(0).toUpperCase() : '';
    return (
      <div
        className={`${baseSizeClass} rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/80 shadow-sm shrink-0 flex items-center justify-center select-none ${className}`}
        title={alt}
      >
        {initial ? <span>{initial}</span> : <User className={`${iconSizeClass} text-zinc-400`} />}
      </div>
    );
  }

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      onError={handleError}
      className={`${baseSizeClass} rounded-full object-cover border border-gray-200/80 dark:border-slate-700 shadow-sm shrink-0 ${className}`}
    />
  );
};
