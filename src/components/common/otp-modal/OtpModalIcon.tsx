import React from 'react';
import { KeyRound } from 'lucide-react';

export const OtpModalIcon: React.FC = () => {
  return (
    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
      <KeyRound className="w-6 h-6" />
    </div>
  );
};
