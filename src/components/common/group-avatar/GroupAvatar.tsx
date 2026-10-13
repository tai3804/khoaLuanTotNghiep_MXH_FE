import React, { useState } from 'react';
import { Users } from 'lucide-react';

export interface GroupAvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'squircle' | 'circle';
  className?: string;
  onClick?: () => void;
  title?: string;
}

// 8 bảng màu gradient thời thượng và trang nhã dành cho cộng đồng
const GRADIENT_PALETTES = [
  'from-blue-600 via-indigo-600 to-indigo-800 text-white shadow-blue-500/20',
  'from-emerald-500 via-teal-600 to-teal-800 text-white shadow-emerald-500/20',
  'from-violet-600 via-purple-600 to-indigo-800 text-white shadow-purple-500/20',
  'from-amber-500 via-orange-500 to-rose-600 text-white shadow-orange-500/20',
  'from-sky-500 via-blue-600 to-indigo-700 text-white shadow-sky-500/20',
  'from-rose-500 via-pink-600 to-purple-700 text-white shadow-rose-500/20',
  'from-cyan-500 via-teal-600 to-blue-700 text-white shadow-cyan-500/20',
  'from-fuchsia-600 via-pink-600 to-rose-600 text-white shadow-fuchsia-500/20',
];

const getGradientForName = (name: string): string => {
  if (!name) return GRADIENT_PALETTES[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
};

const getGroupInitials = (name: string): string => {
  if (!name || !name.trim()) return '';
  const clean = name.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const first = words[0].charAt(0);
    const second = words[1].charAt(0);
    return (first + second).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  src,
  name = '',
  size = 'md',
  shape = 'squircle',
  className = '',
  onClick,
  title,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Check if image is valid (not empty and not the unsplash placeholder)
  const isDefaultUnsplash = typeof src === 'string' && src.includes('images.unsplash.com/photo-1522071820081');
  const hasValidSrc = Boolean(src && src.trim() && !isDefaultUnsplash && !imageFailed);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';
  const baseSize = sizeClasses[size] || sizeClasses.md;
  const iconSize = iconSizes[size] || iconSizes.md;
  const initials = getGroupInitials(name);
  const gradient = getGradientForName(name);

  if (hasValidSrc) {
    return (
      <div
        onClick={onClick}
        title={title || name}
        className={`relative shrink-0 overflow-hidden ${shapeClass} ${baseSize} border border-gray-200/80 dark:border-[#393a3b] shadow-xs select-none ${className}`}
      >
        <img
          src={src}
          alt={name}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      title={title || name}
      className={`relative shrink-0 flex items-center justify-center font-bold tracking-wider bg-gradient-to-tr ${gradient} ${shapeClass} ${baseSize} border border-white/20 dark:border-white/10 shadow-sm select-none transition-all duration-200 ${className}`}
    >
      {initials ? (
        <span className="drop-shadow-xs font-extrabold uppercase">
          {initials}
        </span>
      ) : (
        <Users className={`${iconSize} opacity-90`} />
      )}
      {/* Subtle modern specular highlight on top border */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
    </div>
  );
};

export default GroupAvatar;
