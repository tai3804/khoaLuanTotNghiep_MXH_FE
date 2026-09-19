import React from 'react';
import { useLoginForm } from './useLoginForm';
import { LoginModalHeader } from './LoginModalHeader';
import { LoginForm } from './LoginForm';
import { RegisterStep1Email } from './RegisterStep1Email';
import { RegisterStep2Otp } from './RegisterStep2Otp';
import { RegisterStep3Profile } from './RegisterStep3Profile';

export const LoginModal: React.FC = () => {
  const {
    loginModalOpen,
    closeLoginModal,
    t,
    isRegisterMode,
    showPassword,
    setShowPassword,
    email,
    setEmail,
    password,
    setPassword,
    registerStep,
    setRegisterStep,
    registerOtp,
    setRegisterOtp,
    confirmPassword,
    setConfirmPassword,
    lastName,
    setLastName,
    firstName,
    setFirstName,
    dateOfBirth,
    setDateOfBirth,
    gender,
    setGender,
    loading,
    error,
    successMsg,
    handleSendRegisterOtp,
    handleVerifyRegisterOtp,
    handleCompleteRegistration,
    handleSubmitLogin,
    toggleRegisterMode,
  } = useLoginForm();

  if (!loginModalOpen) return null;

  return (
    <div
      onClick={closeLoginModal}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 animate-fade-in cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#242526] w-full max-w-md rounded-2xl sm:rounded-xl shadow-2xl border border-gray-200 dark:border-[#393a3b] p-4 sm:p-6 relative transition-all cursor-default max-h-[90vh] overflow-y-auto"
      >
        <LoginModalHeader
          isRegisterMode={isRegisterMode}
          registerStep={registerStep}
          t={t}
          onClose={closeLoginModal}
        />

        {/* Error alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-300 text-xs font-bold p-3 rounded-xl mb-4 text-center border border-red-200 dark:border-red-800/60">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 text-xs font-bold p-3 rounded-xl mb-4 text-center border border-emerald-200 dark:border-emerald-800/60">
            {successMsg}
          </div>
        )}

        {!isRegisterMode ? (
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
            onSubmit={handleSubmitLogin}
          />
        ) : registerStep === 1 ? (
          <RegisterStep1Email
            email={email}
            setEmail={setEmail}
            loading={loading}
            onSendOtp={handleSendRegisterOtp}
          />
        ) : registerStep === 2 ? (
          <RegisterStep2Otp
            email={email}
            registerOtp={registerOtp}
            setRegisterOtp={setRegisterOtp}
            loading={loading}
            onVerifyOtp={handleVerifyRegisterOtp}
            onResendOtp={() => handleSendRegisterOtp()}
            onChangeEmail={() => setRegisterStep(1)}
          />
        ) : (
          <RegisterStep3Profile
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            lastName={lastName}
            setLastName={setLastName}
            firstName={firstName}
            setFirstName={setFirstName}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            gender={gender}
            setGender={setGender}
            loading={loading}
            onComplete={handleCompleteRegistration}
          />
        )}

        <div className="mt-5 border-t border-gray-200 dark:border-[#393a3b] pt-4 text-center">
          <button
            type="button"
            onClick={toggleRegisterMode}
            className="text-xs text-[#1877f2] dark:text-[#4599ff] font-bold hover:underline cursor-pointer"
          >
            {isRegisterMode
              ? (t('alreadyHaveAccount') || 'Đã có tài khoản? Đăng nhập ngay')
              : (t('dontHaveAccount') || 'Chưa có tài khoản? Đăng ký ngay')}
          </button>
        </div>
      </div>
    </div>
  );
};
