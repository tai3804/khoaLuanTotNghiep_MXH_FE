import React from 'react';
import { Logo } from '../components/common/Logo';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Globe } from 'lucide-react';
import { AuthHero } from './auth-components/AuthHero';
import { useAuthPageData } from './auth-components/useAuthPageData';
import { MfaVerificationForm } from './auth-components/MfaVerificationForm';
import { LoginForm } from '../components/common/login-modal/LoginForm';
import { RegisterStep1Email } from '../components/common/login-modal/RegisterStep1Email';
import { RegisterStep2Otp } from '../components/common/login-modal/RegisterStep2Otp';
import { RegisterStep3Profile } from '../components/common/login-modal/RegisterStep3Profile';

interface AuthPageProps {
  onGoHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onGoHome }) => {
  const { theme, toggleTheme } = useTheme();
  
  const data = useAuthPageData(onGoHome);

  return (
    <div className="min-h-screen bg-white dark:bg-[#18191a] relative flex items-center justify-center p-2 sm:p-4 md:p-8 font-sans overflow-hidden">
      {/* Background Graphic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 dark:from-slate-900 dark:to-[#18191a] opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-[150px] opacity-20"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-[1000px] bg-white/10 dark:bg-[#242526]/80 backdrop-blur-xl border border-white/20 dark:border-[#393a3b] rounded-[2rem] shadow-2xl p-4 sm:p-6 lg:p-8 flex flex-col">
        
        {/* Header (Logo + Controls) */}
        <div className="flex items-center justify-between mb-6 lg:mb-10 relative z-20">
          <Logo />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => data.setLanguage(data.language === 'en' ? 'vi' : 'en')}
              className="p-2 sm:px-3 sm:py-2 rounded-full sm:rounded-xl bg-white/20 dark:bg-white/5 hover:bg-white/30 dark:hover:bg-white/10 text-white transition flex items-center space-x-1 sm:space-x-2 shadow-sm backdrop-blur-md cursor-pointer"
              title={data.language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
            >
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                {data.language}
              </span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-full bg-white/20 dark:bg-white/5 hover:bg-white/30 dark:hover:bg-white/10 text-white transition shadow-sm backdrop-blur-md cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Hero & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-8 lg:gap-12 items-center">
          <AuthHero t={data.t} />

          {/* Form Section */}
          <div className="lg:col-span-5 bg-white dark:bg-[#242526] p-5 sm:p-7 rounded-[1.5rem] shadow-xl border border-gray-100 dark:border-[#393a3b] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

            {data.errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium animate-fade-in shadow-sm">
                {data.errorMessage}
              </div>
            )}
            {data.successMessage && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-xs rounded-xl font-medium animate-fade-in shadow-sm">
                {data.successMessage}
              </div>
            )}

            {data.mfaRequired ? (
              <MfaVerificationForm
                otpCode={data.otpCode}
                setOtpCode={data.setOtpCode}
                loading={data.loading}
                errorMessage={data.errorMessage}
                onVerify={data.handleVerifyMfaOtp}
                onCancel={() => {
                  data.setMfaRequired(false);
                  data.setMfaToken('');
                  data.setPassword('');
                }}
              />
            ) : data.isLoginMode ? (
              <>
                <div className="mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    Chào mừng trở lại! 👋
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium">
                    Đăng nhập để tiếp tục kết nối với cộng đồng.
                  </p>
                </div>
                <LoginForm
                  email={data.email}
                  setEmail={data.setEmail}
                  password={data.password}
                  setPassword={data.setPassword}
                  showPassword={data.showPassword}
                  setShowPassword={data.setShowPassword}
                  loading={data.loading}
                  onSubmit={data.handleSubmitLogin}
                />


                <div className="mt-5 pt-5 border-t border-gray-100 dark:border-[#393a3b] text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Chưa có tài khoản?</p>
                  <button
                    type="button"
                    onClick={() => {
                      data.setIsLoginMode(false);
                      data.setErrorMessage(null);
                      data.setSuccessMessage(null);
                    }}
                    className="w-full bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-xs py-3 rounded-lg shadow-sm transition"
                  >
                    Tạo Tài Khoản Mới
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-5 border-b border-gray-100 dark:border-[#393a3b] pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white">Đăng Ký Tài Khoản</h2>
                    <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-1 font-medium">Nhanh chóng và dễ dàng.</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-[#3a3b3c] text-gray-600 dark:text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-inner tracking-wider">
                    BƯỚC {data.registerStep} / 3
                  </div>
                </div>

                {data.registerStep === 1 && (
                  <RegisterStep1Email
                    email={data.email}
                    setEmail={data.setEmail}
                    loading={data.loading}
                    onSendOtp={data.handleSendRegisterOtp}
                  />
                )}
                {data.registerStep === 2 && (
                  <RegisterStep2Otp
                    email={data.email}
                    registerOtp={data.registerOtp}
                    setRegisterOtp={data.setRegisterOtp}
                    loading={data.loading}
                    onVerifyOtp={data.handleVerifyRegisterOtp}
                    onResendOtp={data.handleSendRegisterOtp}
                    onChangeEmail={() => data.setRegisterStep(1)}
                  />
                )}
                {data.registerStep === 3 && (
                  <RegisterStep3Profile
                    lastName={data.lastName}
                    setLastName={data.setLastName}
                    firstName={data.firstName}
                    setFirstName={data.setFirstName}
                    dateOfBirth={data.dateOfBirth}
                    setDateOfBirth={data.setDateOfBirth}
                    gender={data.gender}
                    setGender={data.setGender}
                    password={data.password}
                    setPassword={data.setPassword}
                    confirmPassword={data.confirmPassword}
                    setConfirmPassword={data.setConfirmPassword}
                    showPassword={data.showPassword}
                    setShowPassword={data.setShowPassword}
                    loading={data.loading}
                    onComplete={data.handleCompleteRegistration}
                  />
                )}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#393a3b] text-center">
                  <button
                    type="button"
                    onClick={() => {
                      data.setIsLoginMode(true);
                      data.setErrorMessage(null);
                      data.setSuccessMessage(null);
                      data.setRegisterStep(1);
                    }}
                    className="text-xs font-bold text-[#1877f2] hover:underline"
                  >
                    Đã có tài khoản? Đăng nhập ngay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 lg:mt-8 pt-4 border-t border-white/10 text-center relative z-20">
          <p className="text-[10px] sm:text-xs font-medium text-white/60">
            Khóa Luận Tốt Nghiệp 2026 ©
          </p>
        </div>
      </div>
    </div>
  );
};
