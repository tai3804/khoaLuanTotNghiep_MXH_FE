import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  required?: boolean;
  icon?: LucideIcon;
  error?: string | boolean;
  hint?: React.ReactNode;
  rightElement?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
  sizeVariant?: 'default' | 'compact';
  labelAction?: React.ReactNode;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  required = false,
  icon: Icon,
  error,
  hint,
  rightElement,
  inputRef,
  sizeVariant = 'default',
  labelAction,
  className = '',
  id,
  type = 'text',
  ...restProps
}) => {
  const isCompact = sizeVariant === 'compact';
  const hasError = Boolean(error);

  const paddingLeft = Icon
    ? isCompact
      ? 'pl-9'
      : 'pl-10'
    : isCompact
    ? 'px-3'
    : 'px-4';

  const paddingRight = rightElement
    ? isCompact
      ? 'pr-9'
      : 'pr-11'
    : isCompact
    ? 'pr-3'
    : 'pr-4';

  const pyPadding = isCompact ? 'py-2.5' : 'py-2.5 sm:py-3';
  const textSize = isCompact ? 'text-xs sm:text-sm' : 'text-sm';

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor={id} className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb]">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {labelAction && <div>{labelAction}</div>}
        </div>
      )}

      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
            <Icon className={isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          </div>
        )}

        <input
          id={id}
          ref={inputRef}
          type={type}
          required={required}
          className={`w-full ${paddingLeft} ${paddingRight} ${pyPadding} ${textSize} bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border ${
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
              : 'border-gray-300 dark:border-[#3e4042] focus:border-[#1877f2] focus:ring-[#1877f2]/15'
          } focus:outline-none focus:ring-4 placeholder-gray-400 dark:placeholder-gray-500 transition-all shadow-2xs ${className}`}
          {...restProps}
        />

        {rightElement}
      </div>

      {typeof error === 'string' && error && (
        <p className="text-[11px] text-red-500 font-medium mt-1">{error}</p>
      )}

      {hint && !error && (
        <div className="mt-1.5">{hint}</div>
      )}
    </div>
  );
};

