import React from 'react';
import { LogoIconSvg } from './LogoIconSvg';
import { LogoText } from './LogoText';

export interface LogoProps {
  onClick?: () => void;
  showText?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'auto' | 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  onClick,
  showText = true,
  className = '',
  size = 'md',
  variant = 'auto',
}) => {
  const emblemSizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-3.5 cursor-pointer group select-none ${className}`}
      title="Trang Chủ KLTN Social"
    >
      <LogoIconSvg emblemSizeClass={emblemSizes[size]} />
      {showText && <LogoText textSizeClass={textSizes[size]} variant={variant} />}
    </div>
  );
};
