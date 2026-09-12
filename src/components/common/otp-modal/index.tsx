import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { OtpModalIcon } from './OtpModalIcon';
import { OtpInputBox } from './OtpInputBox';
import { OtpModalActions } from './OtpModalActions';

export interface OtpModalProps {
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
          <OtpModalIcon />

          <h3 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb]">
            {title}
          </h3>

          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-2 leading-relaxed">
            {description}
          </p>

          <OtpInputBox code={code} setCode={setCode} error={error} />

          <OtpModalActions
            cancelText={cancelText}
            confirmText={confirmText}
            loading={loading}
            code={code}
            onClose={onClose}
          />
        </form>
      </div>
    </div>
  );
};
