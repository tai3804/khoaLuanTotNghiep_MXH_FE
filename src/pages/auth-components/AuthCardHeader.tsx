import React from 'react';
import { Logo } from '../../components/common/Logo';

interface AuthCardHeaderProps {
  isMfa: boolean;
  isForgotPassword: boolean;
  isLogin: boolean;
  forgotStep?: 1 | 2;
  registerStep?: 1 | 2 | 3;
  onGoHome?: () => void;
}

export const AuthCardHeader: React.FC<AuthCardHeaderProps> = ({
  isMfa,
  isForgotPassword,
  isLogin,
  forgotStep = 1,
  registerStep = 1,
  onGoHome,
}) => {
  const getHeading = () => {
    if (isMfa) return 'Xác thực hai yếu tố';
    if (isForgotPassword) return forgotStep === 1 ? 'Quên mật khẩu' : 'Đặt lại mật khẩu';
    if (isLogin) return 'Đăng nhập';
    return 'Tạo tài khoản mới';
  };

  const getSubheading = () => {
    if (isMfa) return 'Vui lòng nhập mã bảo mật 6 chữ số từ ứng dụng xác thực';
    if (isForgotPassword) {
      return forgotStep === 1
        ? 'Nhập email tài khoản để nhận mã OTP khôi phục'
        : 'Nhập mã xác thực OTP và thiết lập mật khẩu mới';
    }
    if (isLogin) return 'Chào mừng bạn trở lại! Vui lòng nhập thông tin tài khoản.';
    if (registerStep === 1) return 'Nhập email để nhận mã OTP kích hoạt tài khoản';
    if (registerStep === 2) return 'Nhập mã OTP 6 số đã được gửi tới hộp thư của bạn';
    return 'Điền thông tin cá nhân để hoàn tất tạo tài khoản';
  };

  return (
    <div className="text-center mb-5">
      <div className="flex justify-center mb-2.5">
        <Logo size="md" onClick={onGoHome} />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-[#e4e6eb] tracking-tight transition-all duration-150">
        {getHeading()}
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 dark:text-[#b0b3b8] mt-1 leading-relaxed min-h-[20px] transition-all duration-150">
        {getSubheading()}
      </p>
    </div>
  );
};
