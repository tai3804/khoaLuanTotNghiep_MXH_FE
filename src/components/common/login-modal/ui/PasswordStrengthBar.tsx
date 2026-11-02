import React, { useMemo } from 'react';

export interface PasswordStrengthBarProps {
  password: string;
}

export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, text: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, text: 'Yếu', color: 'bg-red-500' };
    if (score <= 3) return { score: 2, text: 'Khá an toàn', color: 'bg-amber-500' };
    return { score: 3, text: 'Rất mạnh', color: 'bg-emerald-500' };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5 pt-0.5">
      <div className="flex h-1.5 w-full bg-gray-200 dark:bg-[#383a3d] rounded-full overflow-hidden gap-1">
        <div
          className={`h-full flex-1 rounded-full transition-all duration-300 ${
            strength.score >= 1 ? strength.color : 'bg-transparent'
          }`}
        />
        <div
          className={`h-full flex-1 rounded-full transition-all duration-300 ${
            strength.score >= 2 ? strength.color : 'bg-transparent'
          }`}
        />
        <div
          className={`h-full flex-1 rounded-full transition-all duration-300 ${
            strength.score >= 3 ? strength.color : 'bg-transparent'
          }`}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-[#b0b3b8]">
        <span>
          Độ mạnh:{' '}
          <strong
            className={
              strength.score === 3
                ? 'text-emerald-500'
                : strength.score === 2
                ? 'text-amber-500'
                : 'text-red-500'
            }
          >
            {strength.text}
          </strong>
        </span>
        <span>Nên có chữ hoa, số & ký tự đặc biệt</span>
      </div>
    </div>
  );
};

