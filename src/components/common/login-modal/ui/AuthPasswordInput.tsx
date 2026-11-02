import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Check, CheckCircle2, LucideIcon } from 'lucide-react';
import { AuthInput, AuthInputProps } from './AuthInput';

export interface AuthPasswordInputProps
  extends Omit<AuthInputProps, 'type' | 'icon' | 'rightElement'> {
  showPassword?: boolean;
  setShowPassword?: (show: boolean | ((prev: boolean) => boolean)) => void;
  icon?: LucideIcon;
  passwordsMatch?: boolean;
  passwordsMismatch?: boolean;
  matchText?: string;
  mismatchText?: string;
}

export const AuthPasswordInput: React.FC<AuthPasswordInputProps> = ({
  showPassword: externalShowPassword,
  setShowPassword: externalSetShowPassword,
  icon: Icon = Lock,
  passwordsMatch = false,
  passwordsMismatch = false,
  matchText = 'Khớp',
  mismatchText = 'Chưa khớp',
  label,
  labelAction,
  error,
  sizeVariant = 'default',
  ...restProps
}) => {
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  const isControlled = externalShowPassword !== undefined && externalSetShowPassword !== undefined;
  const isShown = isControlled ? externalShowPassword : internalShowPassword;

  const toggleShowPassword = () => {
    if (isControlled) {
      externalSetShowPassword((prev) => !prev);
    } else {
      setInternalShowPassword((prev) => !prev);
    }
  };

  const isCompact = sizeVariant === 'compact';
  const iconSizeClass = isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const computedLabelAction = labelAction || (
    <>
      {passwordsMatch && (
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
          <Check className="w-3 h-3 stroke-[2.5]" />
          <span>{matchText}</span>
        </span>
      )}
      {passwordsMismatch && (
        <span className="text-[11px] font-semibold text-red-500">
          {mismatchText}
        </span>
      )}
    </>
  );

  const rightElement = (
    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center space-x-1.5">
      {passwordsMatch && (
        <div className="text-emerald-500 pointer-events-none flex items-center">
          <CheckCircle2 className={iconSizeClass} />
        </div>
      )}
      <button
        type="button"
        tabIndex={-1}
        onClick={toggleShowPassword}
        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer flex items-center focus:outline-none"
        title={isShown ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
      >
        {isShown ? (
          <EyeOff className={iconSizeClass} />
        ) : (
          <Eye className={iconSizeClass} />
        )}
      </button>
    </div>
  );

  return (
    <AuthInput
      type={isShown ? 'text' : 'password'}
      icon={Icon}
      label={label}
      labelAction={computedLabelAction}
      error={error || passwordsMismatch}
      sizeVariant={sizeVariant}
      rightElement={rightElement}
      {...restProps}
    />
  );
};

