import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthTabsProps {
  isLoginMode: boolean;
  onSelectTab: (isLogin: boolean) => void;
  disabled?: boolean;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({
  isLoginMode,
  onSelectTab,
  disabled = false,
}) => {
  return (
    <div className="flex p-1 bg-gray-100 dark:bg-[#18191a] rounded-xl border border-gray-200/80 dark:border-[#393a3b] mb-5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelectTab(true)}
        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          isLoginMode
            ? 'bg-white dark:bg-[#242526] text-[#1877f2] shadow-xs font-bold'
            : 'text-gray-500 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-[#e4e6eb]'
        }`}
      >
        <LogIn className="w-4 h-4" />
        <span>Đăng nhập</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelectTab(false)}
        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          !isLoginMode
            ? 'bg-white dark:bg-[#242526] text-[#1877f2] shadow-xs font-bold'
            : 'text-gray-500 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-[#e4e6eb]'
        }`}
      >
        <UserPlus className="w-4 h-4" />
        <span>Đăng ký</span>
      </button>
    </div>
  );
};
