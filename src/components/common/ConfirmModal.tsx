import React from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';

interface ConfirmModalProps {
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

          <h3 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb]">
            {title}
          </h3>

          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-2 leading-relaxed">
            {message}
          </p>

          <div className="flex items-center space-x-3 w-full mt-6">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2.5 px-4 text-white text-xs font-bold rounded-xl shadow transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 ${
                type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : type === 'warning'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-[#1877f2] hover:bg-[#166fe5]'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{confirmText}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
