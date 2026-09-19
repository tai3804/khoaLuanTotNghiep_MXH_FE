import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface OtpInputBoxProps {
  code: string;
  setCode: (code: string) => void;
  error?: string | null;
}

export const OtpInputBox: React.FC<OtpInputBoxProps> = ({ code, setCode, error }) => {
  return (
    <>
      <div className="w-full my-5">
        <input
          type="text"
          autoFocus
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-full text-center text-2xl font-mono tracking-[0.4em] font-extrabold px-4 py-3 bg-gray-50 dark:bg-[#18191a] border border-gray-200 dark:border-[#393a3b] rounded-xl text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:ring-2 focus:ring-[#1877f2] transition"
        />
      </div>

      {error && (
        <div className="flex items-center space-x-1.5 text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl w-full mb-4">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </>
  );
};
