import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalIconProps {
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModalIcon: React.FC<ConfirmModalIconProps> = ({ type = 'danger' }) => {
  return (
    <div
      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
        type === 'danger'
          ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
          : type === 'warning'
          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
          : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
      }`}
    >
      <AlertTriangle className="w-6 h-6" />
    </div>
  );
};
