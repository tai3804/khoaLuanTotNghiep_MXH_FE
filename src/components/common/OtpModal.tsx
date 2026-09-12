import React, { useState, useEffect } from 'react';
import { KeyRound, X, ShieldAlert } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: (code: string) => void;
  onClose: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  title = 'Xác nhận mã OTP',
  description = 'Vui lòng nhập mã OTP 6 chữ số từ ứng dụng Google Authenticator để xác nhận:',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  loading = false,
  error = null,
  onConfirm,
  onClose,
}) => {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCode('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;
    onConfirm(code.trim());
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#242526] w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 dark:border-[#393a3b] p-4 sm:p-6 relative transform transition-all cursor-default scale-100"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6" />
          </div>

          <h3 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb]">
            {title}
          </h3>

          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-2 leading-relaxed">
            {description}
          </p>

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

          <div className="flex items-center space-x-3 w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={loading || code.trim().length !== 6}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
