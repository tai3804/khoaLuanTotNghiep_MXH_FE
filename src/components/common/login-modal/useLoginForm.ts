import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { authService } from '../../../services/api';

export const useLoginForm = () => {
  const { loginModalOpen, closeLoginModal, login, register } = useAuth();
  const { t } = useLanguage();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Multi-step Register states
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [registerOtp, setRegisterOtp] = useState('');
  const [registerSessionToken, setRegisterSessionToken] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendRegisterOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ Email.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await authService.sendRegisterOtp(email.trim());
      setSuccessMsg('Mã OTP xác thực đã được gửi tới email của bạn!');
      setRegisterStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể gửi mã OTP. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerOtp.trim() || registerOtp.trim().length < 6) {
      setError('Vui lòng nhập đầy đủ mã OTP 6 chữ số.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await authService.verifyRegisterOtp(email.trim(), registerOtp.trim());
      const token = res?.registerSessionToken || res;
      setRegisterSessionToken(token);
      setSuccessMsg('Xác thực Email thành công! Hãy nhập thông tin cá nhân và mật khẩu.');
      setRegisterStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!password.trim() || !confirmPassword.trim() || !lastName.trim() || !firstName.trim() || !dateOfBirth) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Check age >= 13
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 13) {
      setError('Bạn phải từ đủ 13 tuổi trở lên mới được tạo tài khoản!');
      return;
    }

    setLoading(true);
    try {
      const ok = await register({
        registerSessionToken,
        email: email.trim(),
        password: password.trim(),
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        dateOfBirth,
        gender,
      });
      if (ok) {
        setSuccessMsg('Tạo tài khoản thành công! Vui lòng đăng nhập.');
        setIsRegisterMode(false);
        setRegisterStep(1);
      } else {
        setError('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await login(email.trim(), password.trim());
      if (!res.success) setError('Đăng nhập thất bại. Email hoặc mật khẩu chưa đúng!');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const toggleRegisterMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setSuccessMsg('');
    setRegisterStep(1);
  };

  return {
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
    middleName,
    setMiddleName,
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
  };
};
