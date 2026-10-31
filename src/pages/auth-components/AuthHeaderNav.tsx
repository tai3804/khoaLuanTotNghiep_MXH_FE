import React from 'react';
import { Logo } from '../../components/common/Logo';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Globe } from 'lucide-react';

interface AuthHeaderNavProps {
  language: string;
  onToggleLanguage: () => void;
  onGoHome?: () => void;
}

export const AuthHeaderNav: React.FC<AuthHeaderNavProps> = ({
  language,
  onToggleLanguage,
  onGoHome,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full flex items-center justify-between py-3.5 px-4 sm:px-8 border-b border-gray-200/60 dark:border-[#393a3b]/60 bg-white/60 dark:bg-[#18191a]/60 backdrop-blur-md relative z-20">
      <div className="flex items-center space-x-3">
        <Logo size="sm" onClick={onGoHome} />
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          type="button"
          onClick={onToggleLanguage}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
          title={language === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
        >
          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{language}</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
          title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[#1877f2]" />
          )}
        </button>
      </div>
    </header>
  );
};
