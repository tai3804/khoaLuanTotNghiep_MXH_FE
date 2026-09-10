import React from 'react';

interface LogoProps {
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
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-3.5 cursor-pointer group select-none ${className}`}
      title="Trang Chủ KLTN Social"
    >
      <div
        className={`relative flex items-center justify-center ${emblemSizes[size]} rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[2px] shadow-xl shadow-blue-500/30 group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-300 transform flex-shrink-0`}
      >
        <div className="w-full h-full bg-slate-950/40 rounded-[14px] backdrop-blur-md flex items-center justify-center p-2 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-cyan-400/50 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />
          <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-pink-500/50 rounded-full blur-md group-hover:scale-150 transition-transform duration-500" />

          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full relative z-10 filter drop-shadow-md group-hover:rotate-12 transition-transform duration-500"
          >
            <defs>
              <linearGradient id="orbGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
              <linearGradient id="orbGradRing" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#F472B6" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <circle cx="50" cy="50" r="16" fill="url(#orbGradPrimary)" filter="url(#glow)" />
            <circle cx="45" cy="45" r="5" fill="#FFFFFF" opacity="0.6" />

            <ellipse
              cx="50"
              cy="50"
              rx="38"
              ry="14"
              fill="none"
              stroke="url(#orbGradRing)"
              strokeWidth="5"
              transform="rotate(-28 50 50)"
              strokeLinecap="round"
            />

            <ellipse
              cx="50"
              cy="50"
              rx="38"
              ry="14"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeOpacity="0.4"
              strokeDasharray="6 4"
              transform="rotate(35 50 50)"
            />

            <circle cx="20" cy="38" r="5" fill="#38BDF8" />
            <circle cx="80" cy="62" r="5" fill="#F472B6" />
            <circle cx="68" cy="28" r="4" fill="#FDE047" className="animate-ping" />
          </svg>
        </div>
      </div>

      {showText && (
        <div className={`flex items-baseline space-x-1.5 font-black tracking-tight ${textSizes[size]}`}>
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
      )}
    </div>
  );
};
