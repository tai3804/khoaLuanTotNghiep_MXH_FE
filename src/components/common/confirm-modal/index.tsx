import React from 'react';
import { X } from 'lucide-react';
import { ConfirmModalIcon } from './ConfirmModalIcon';
import { ConfirmModalActions } from './ConfirmModalActions';

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Xác nhận thao tác',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  type = 'danger',
  loading = false,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

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

        <div className="flex flex-col items-center text-center">
          <ConfirmModalIcon type={type} />

          <h3 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb]">
            {title}
          </h3>

          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-2 leading-relaxed">
            {message}
          </p>

          <ConfirmModalActions
            cancelText={cancelText}
            confirmText={confirmText}
            type={type}
            loading={loading}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};
