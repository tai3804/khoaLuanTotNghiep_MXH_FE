import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface AuthSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  label,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  tabIndex,
  type = 'submit',
  className = '',
  ...restProps
}) => {
  return (
    <button
      type={type}
      tabIndex={tabIndex}
      disabled={disabled || loading}
      className={`w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-white bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.99] shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 cursor-pointer ${className}`}
      {...restProps}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          <span>{label}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
};

