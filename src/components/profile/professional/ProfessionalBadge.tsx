import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ProfessionalBadgeProps {
  category?: string;
  className?: string;
  showIcon?: boolean;
}

export const ProfessionalBadge: React.FC<ProfessionalBadgeProps> = ({
  category = 'Người sáng tạo nội dung số',
  className = '',
  showIcon = true,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] shadow-xs ${className}`}
      title={`Hạng mục: ${category}`}
    >
      <span className="truncate max-w-[220px]">{category}</span>
      {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-[#1877f2] dark:text-[#4599ff] shrink-0" />}
    </div>
  );
};
