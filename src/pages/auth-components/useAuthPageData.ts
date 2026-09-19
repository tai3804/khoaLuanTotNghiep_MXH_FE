import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/api';

export const useAuthPageData = (onGoHome?: () => void) => {
  const { login, verifyMfaLogin, register } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register specific states
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Multi-step Registration States (1: Email, 2: OTP, 3: Profile & Password)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [registerOtp, setRegisterOtp] = useState('');
  const [registerSessionToken, setRegisterSessionToken] = useState('');

  // 2FA Login States
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSendRegisterOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ Email.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await authService.sendRegisterOtp(email.trim());
      setSuccessMessage('Mã OTP xác thực 6 số đã được gửi tới email ' + email.trim() + '. Vui lòng kiểm tra hộp thư!');
      setRegisterStep(2);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Không thể gửi mã OTP. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerOtp.trim() || registerOtp.trim().length < 6) {
      setErrorMessage('Vui lòng nhập mã OTP 6 chữ số.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await authService.verifyRegisterOtp(email.trim(), registerOtp.trim());
      const token = res?.registerSessionToken || res;
      setRegisterSessionToken(token);
      setSuccessMessage('Xác thực Email thành công! Hãy nhập thông tin cá nhân và mật khẩu để hoàn tất.');
      setRegisterStep(3);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!password.trim() || !confirmPassword.trim() || !lastName.trim() || !firstName.trim() || !dateOfBirth) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t('passwordsDoNotMatch') || 'Mật khẩu xác nhận không khớp!');
      return;
    }

    // Check age >= 13 years old
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 13) {
      setErrorMessage('Bạn phải từ đủ 13 tuổi trở lên mới được tạo tài khoản!');
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
        setSuccessMessage(t('registerSuccess') || 'Tạo tài khoản thành công! Vui lòng đăng nhập.');
        setIsLoginMode(true);
        setRegisterStep(1);
        setRegisterOtp('');
        setRegisterSessionToken('');
      } else {
        setErrorMessage('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập email và mật khẩu.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      const res = await login(email.trim(), password.trim());
      if (res.success) {
        if (res.mfaRequired && res.mfaToken) {
          setMfaRequired(true);
          setMfaToken(res.mfaToken);
        } else if (onGoHome) {
          onGoHome();
        }
      } else {
        setErrorMessage('Đăng nhập thất bại. Email hoặc mật khẩu không chính xác!');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfaOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;
    setErrorMessage(null);
    setLoading(true);
    try {
      const ok = await verifyMfaLogin(mfaToken, otpCode.trim());
      if (ok) {
        if (onGoHome) onGoHome();
      } else {
        setErrorMessage('Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại Google Authenticator!');
      }
    } catch (err: any) {
      setErrorMessage('Xác thực 2FA thất bại: ' + (err.message || 'Mã OTP không đúng'));
    } finally {
      setLoading(false);
    }
  };

  return {
    t,
    language,
    setLanguage,
    isLoginMode,
    setIsLoginMode,
    showPassword,
    setShowPassword,
    email,
    setEmail,
    password,
    setPassword,
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
    confirmPassword,
    setConfirmPassword,
    registerStep,
    setRegisterStep,
    registerOtp,
    setRegisterOtp,
    mfaRequired,
    setMfaRequired,
    setMfaToken,
    otpCode,
    setOtpCode,
    loading,
    errorMessage,
    setErrorMessage,
    successMessage,
    setSuccessMessage,
    handleSendRegisterOtp,
    handleVerifyRegisterOtp,
    handleCompleteRegistration,
    handleSubmitLogin,
    handleVerifyMfaOtp,
  };
};
