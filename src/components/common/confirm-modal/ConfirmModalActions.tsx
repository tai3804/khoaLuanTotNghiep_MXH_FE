import React from 'react';
import { LogOut } from 'lucide-react';

interface ConfirmModalActionsProps {
  cancelText?: string;
  confirmText?: string;
  type?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmModalActions: React.FC<ConfirmModalActionsProps> = ({
  cancelText = 'Hủy bỏ',
  confirmText = 'Xác nhận',
  type = 'danger',
  loading = false,
  onClose,
  onConfirm,
}) => {
  return (
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
  );
};
