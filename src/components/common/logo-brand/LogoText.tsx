import React from 'react';

interface LogoTextProps {
  textSizeClass: string;
  variant?: 'auto' | 'light' | 'dark';
}

export const LogoText: React.FC<LogoTextProps> = ({ textSizeClass, variant = 'auto' }) => {
  const getKltnGradient = () => {
    if (variant === 'light') {
      return 'bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent';
    }
    if (variant === 'dark') {
      return 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent';
    }
    return 'bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-slate-100 dark:to-slate-200 bg-clip-text text-transparent';
  };

  return (
    <div className={`flex items-baseline space-x-1.5 font-black tracking-tight ${textSizeClass}`}>
      <span className={`${getKltnGradient()} group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300`}>
        KLTN
      </span>
      <div className="flex items-center space-x-1">
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300">
          Social
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      </div>
    </div>
  );
};
