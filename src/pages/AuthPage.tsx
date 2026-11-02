import React from 'react';
import { AuthHeaderNav } from './auth-components/AuthHeaderNav';
import { AuthCardHeader } from './auth-components/AuthCardHeader';
import { AuthTabs } from './auth-components/AuthTabs';
import { AuthFooter } from './auth-components/AuthFooter';
import { useAuthPageData } from './auth-components/useAuthPageData';
import { MfaVerificationForm } from './auth-components/MfaVerificationForm';
import { ForgotPasswordForm } from './auth-components/ForgotPasswordForm';
import { LoginForm } from '../components/common/login-modal/LoginForm';
import { RegisterStep1Email } from '../components/common/login-modal/RegisterStep1Email';
import { RegisterStep2Otp } from '../components/common/login-modal/RegisterStep2Otp';
import { RegisterStep3Profile } from '../components/common/login-modal/RegisterStep3Profile';
import { CheckCircle2, AlertCircle, ArrowLeft, Check } from 'lucide-react';

interface AuthPageProps {
  onGoHome?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onGoHome }) => {
  const data = useAuthPageData(onGoHome);

  const isSubFlow = data.mfaRequired || data.isForgotPasswordMode;

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#18191a] text-[#050505] dark:text-[#e4e6eb] relative flex flex-col justify-between font-sans overflow-x-hidden selection:bg-[#1877f2] selection:text-white transition-colors duration-150">
      {/* Subtle Radial Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 dark:bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Navigation */}
      <AuthHeaderNav
        language={data.language}
        onToggleLanguage={() => data.setLanguage(data.language === 'en' ? 'vi' : 'en')}
        onGoHome={onGoHome}
      />

      {/* Centered Minimalist Auth Main Container */}
      <main className="w-full flex-1 flex items-center justify-center px-4 py-8 sm:py-12 relative z-10">
        <div className="w-full max-w-[460px] sm:max-w-[480px]">
          {/* Main Card */}
          <div className="bg-white dark:bg-[#242526] border border-gray-200/90 dark:border-[#393a3b] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_12px_40px_rgb(0,0,0,0.5)] transition-all duration-200 ease-out p-6 sm:p-8 min-h-[490px] flex flex-col justify-between">
            <div>
              {/* Header: Logo, Title, Subtitle */}
              <AuthCardHeader
                isMfa={data.mfaRequired}
                isForgotPassword={data.isForgotPasswordMode}
                isLogin={data.isLoginMode}
                forgotStep={data.forgotStep}
                registerStep={data.registerStep}
                onGoHome={onGoHome}
              />

              {/* Error Alert */}
              {data.errorMessage && (
                <div className="mb-4 p-3.5 bg-[#ffebe8] dark:bg-red-950/40 border border-[#dd3c10]/40 dark:border-red-900/60 text-[#c72800] dark:text-red-300 text-xs font-semibold rounded-xl flex items-start space-x-2.5 animate-shake shadow-2xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#dd3c10] dark:text-red-400" />
                  <span className="leading-relaxed">{data.errorMessage}</span>
                </div>
              )}

              {/* Success Alert */}
              {data.successMessage && (
                <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-start space-x-2.5 shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span className="leading-relaxed">{data.successMessage}</span>
                </div>
              )}

              {/* Mode Switcher Tabs (Login / Register) */}
              {!isSubFlow && (
                <AuthTabs
                  isLoginMode={data.isLoginMode}
                  disabled={data.loading}
                  onSelectTab={(isLogin) => {
                    data.setIsLoginMode(isLogin);
                    data.setErrorMessage(null);
                    data.setSuccessMessage(null);
                    if (!isLogin) {
                      data.setRegisterStep(1);
                    }
                  }}
                />
              )}

              {/* Form Views Area */}
              <div className="min-h-[280px] flex flex-col justify-center transition-opacity duration-150">
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
                ) : data.isForgotPasswordMode ? (
                  <ForgotPasswordForm
                    forgotStep={data.forgotStep}
                    setForgotStep={data.setForgotStep}
                    email={data.email}
                    setEmail={data.setEmail}
                    resetOtp={data.resetOtp}
                    setResetOtp={data.setResetOtp}
                    newPassword={data.newPassword}
                    setNewPassword={data.setNewPassword}
                    confirmNewPassword={data.confirmNewPassword}
                    setConfirmNewPassword={data.setConfirmNewPassword}
                    showPassword={data.showPassword}
                    setShowPassword={data.setShowPassword}
                    loading={data.loading}
                    onSendOtp={data.handleSendForgotPasswordOtp}
                    onResetPassword={data.handleResetPassword}
                    onBackToLogin={() => {
                      data.setIsForgotPasswordMode(false);
                      data.setIsLoginMode(true);
                      data.setErrorMessage(null);
                      data.setSuccessMessage(null);
                      data.setForgotStep(1);
                    }}
                  />
                ) : data.isLoginMode ? (
                  <LoginForm
                    email={data.email}
                    setEmail={data.setEmail}
                    password={data.password}
                    setPassword={data.setPassword}
                    showPassword={data.showPassword}
                    setShowPassword={data.setShowPassword}
                    loading={data.loading}
                    onSubmit={data.handleSubmitLogin}
                    onQuickLogin={data.handleQuickLogin}
                    onForgotPassword={() => {
                      data.setIsForgotPasswordMode(true);
                      data.setErrorMessage(null);
                      data.setSuccessMessage(null);
                      data.setForgotStep(1);
                    }}
                    onCreateAccount={() => {
                      data.setIsLoginMode(false);
                      data.setIsForgotPasswordMode(false);
                      data.setErrorMessage(null);
                      data.setSuccessMessage(null);
                      data.setRegisterStep(1);
                    }}
                  />
                ) : (
                  /* Register Flow View */
                  <div>
                    {/* Modern 3-Step Progress Indicator */}
                    <div className="mb-5 pb-3.5 border-b border-gray-100 dark:border-[#393a3b]">
                      <div className="flex items-center justify-between">
                        {[
                          { step: 1, label: 'Email' },
                          { step: 2, label: 'Mã OTP' },
                          { step: 3, label: 'Thông tin' },
                        ].map((item, idx) => {
                          const isCompleted = data.registerStep > item.step;
                          const isCurrent = data.registerStep === item.step;

                          return (
                            <React.Fragment key={item.step}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                                    isCompleted
                                      ? 'bg-emerald-500 text-white shadow-xs'
                                      : isCurrent
                                      ? 'bg-[#1877f2] text-white ring-4 ring-[#1877f2]/20 shadow-xs'
                                      : 'bg-gray-100 dark:bg-[#18191a] text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-[#383a3d]'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  ) : (
                                    item.step
                                  )}
                                </div>
                                <span
                                  className={`text-xs transition-colors ${
                                    isCurrent
                                      ? 'text-[#1877f2] dark:text-[#4599ff] font-bold'
                                      : isCompleted
                                      ? 'text-gray-700 dark:text-[#e4e6eb] font-semibold'
                                      : 'text-gray-400 dark:text-gray-500 font-medium'
                                  }`}
                                >
                                  {item.label}
                                </span>
                              </div>

                              {idx < 2 && (
                                <div
                                  className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                                    data.registerStep > item.step
                                      ? 'bg-emerald-500'
                                      : 'bg-gray-200 dark:bg-[#383a3d]'
                                  }`}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* Registration Step Components */}
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

                    {/* Back to Login Link */}
                    <div className="pt-4 text-center border-t border-gray-100 dark:border-[#393a3b] mt-5">
                      <button
                        type="button"
                        tabIndex={8}
                        onClick={() => {
                          data.setIsLoginMode(true);
                          data.setErrorMessage(null);
                          data.setSuccessMessage(null);
                        }}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-500 dark:text-[#b0b3b8] hover:text-[#1877f2] dark:hover:text-[#4599ff] hover:underline cursor-pointer transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Quay lại Đăng nhập</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
};
