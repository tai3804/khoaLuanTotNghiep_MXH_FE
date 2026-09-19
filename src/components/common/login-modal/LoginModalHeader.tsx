import React from 'react';
import { X } from 'lucide-react';
import { Logo } from '../Logo';

interface LoginModalHeaderProps {
  isRegisterMode: boolean;
  registerStep: 1 | 2 | 3;
  t: (key: string) => string;
  onClose: () => void;
}

export const LoginModalHeader: React.FC<LoginModalHeaderProps> = ({
  isRegisterMode,
  registerStep,
  t,
  onClose,
}) => {
  return (
    <>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-700 dark:text-[#b0b3b8] dark:hover:text-[#e4e6eb] p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Brand Header */}
      <div className="text-center mb-4 sm:mb-5 flex flex-col items-center">
        <Logo size="md" />
        <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-[#e4e6eb] mt-2.5 sm:mt-3">
          {isRegisterMode ? (t('register') || 'Đăng Ký Tài Khoản') : (t('login') || 'Đăng Nhập')}
        </h2>
      </div>

      {/* Stepper Header for Register */}
      {isRegisterMode && (
        <div className="flex items-center justify-between mb-4 px-1 sm:px-4">
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                registerStep >= 1 ? 'bg-[#1877f2] text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              1
            </div>
            <span className="text-[9px] sm:text-[10px] mt-0.5 font-semibold text-gray-500">Email</span>
          </div>
          <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 ${registerStep >= 2 ? 'bg-[#1877f2]' : 'bg-gray-200'}`} />
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                registerStep >= 2 ? 'bg-[#1877f2] text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              2
            </div>
            <span className="text-[9px] sm:text-[10px] mt-0.5 font-semibold text-gray-500">Mã OTP</span>
          </div>
          <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 ${registerStep >= 3 ? 'bg-[#1877f2]' : 'bg-gray-200'}`} />
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                registerStep >= 3 ? 'bg-[#1877f2] text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              3
            </div>
            <span className="text-[9px] sm:text-[10px] mt-0.5 font-semibold text-gray-500">Thông Tin</span>
          </div>
        </div>
      )}
    </>
  );
};
