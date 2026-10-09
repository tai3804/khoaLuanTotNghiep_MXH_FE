import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-400/20 dark:via-indigo-400/20 dark:to-purple-400/20 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/30 backdrop-blur-xs shadow-xs ${className}`}
      title={`Chế độ chuyên nghiệp: ${category}`}
    >
      {showIcon && <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 animate-pulse" />}
      <span className="truncate max-w-[200px]">{category}</span>
      <CheckCircle2 className="w-3 h-3 text-blue-500 dark:text-blue-400 shrink-0" />
    </div>
  );
};
