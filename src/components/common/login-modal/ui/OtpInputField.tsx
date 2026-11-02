import React from 'react';
import { KeyRound, LucideIcon } from 'lucide-react';

export interface OtpInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  length?: number;
  tabIndex?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  placeholder?: string;
  icon?: LucideIcon;
  id?: string;
}

export const OtpInputField: React.FC<OtpInputFieldProps> = ({
  value,
  onChange,
  label = 'Nhập mã xác thực OTP (6 chữ số)',
  required = true,
  length = 6,
  tabIndex = 1,
  autoFocus = true,
  disabled = false,
  placeholder = '••••••',
  icon: Icon = KeyRound,
  id,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, length);
    onChange(numericOnly);
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-[#b0b3b8] group-focus-within:text-[#1877f2] transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          maxLength={length}
          required={required}
          autoFocus={autoFocus}
          tabIndex={tabIndex}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white dark:bg-[#18191a] text-gray-900 dark:text-[#e4e6eb] rounded-xl border border-gray-300 dark:border-[#3e4042] focus:outline-none focus:border-[#1877f2] focus:ring-4 focus:ring-[#1877f2]/15 text-lg sm:text-xl font-mono font-bold tracking-[0.35em] text-center shadow-2xs transition-all"
        />
      </div>
    </div>
  );
};

