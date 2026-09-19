import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 animate-pulse';
  
  let variantClasses = '';
  switch (variant) {
    case 'circular':
      variantClasses = 'rounded-full';
      break;
    case 'text':
      variantClasses = 'rounded-md';
      break;
    case 'rectangular':
    default:
      variantClasses = 'rounded-lg';
      break;
  }

  const style: React.CSSProperties = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1.2em' : undefined),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={style}
    />
  );
};
