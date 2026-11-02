import React from 'react';
import { User, Calendar, ArrowRight, Shield } from 'lucide-react';
import {
  AuthInput,
  AuthPasswordInput,
  PasswordStrengthBar,
  GenderSelector,
  AuthSubmitButton,
} from './ui';

interface RegisterStep3ProfileProps {
  password: string;
  setPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean | ((prev: boolean) => boolean)) => void;
  lastName: string;
  setLastName: (name: string) => void;
  firstName: string;
  setFirstName: (name: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (dob: string) => void;
  gender: string;
  setGender: (g: string) => void;
  loading: boolean;
  onComplete: (e: React.FormEvent) => void;
}

export const RegisterStep3Profile: React.FC<RegisterStep3ProfileProps> = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  lastName,
  setLastName,
  firstName,
  setFirstName,
  dateOfBirth,
  setDateOfBirth,
  gender,
  setGender,
  loading,
  onComplete,
}) => {
  const passwordsMatch = Boolean(confirmPassword && password && confirmPassword === password);
  const passwordsMismatch = Boolean(confirmPassword && password && confirmPassword !== password);

  return (
    <form onSubmit={onComplete} className="space-y-3.5 animate-fade-in">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AuthInput
          label="Họ & Tên đệm"
          required
          autoFocus
          tabIndex={1}
          icon={User}
          sizeVariant="compact"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Nguyễn Văn"
        />

        <AuthInput
          label="Tên chính"
          required
          tabIndex={2}
          sizeVariant="compact"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="An"
        />
      </div>

      {/* Birthday & Gender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AuthInput
          label="Ngày sinh"
          required
          tabIndex={3}
          icon={Calendar}
          sizeVariant="compact"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <GenderSelector
          gender={gender}
          setGender={setGender}
          tabIndex={4}
        />
      </div>

      {/* Password fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
        <AuthPasswordInput
          label="Mật khẩu đăng nhập"
          required
          tabIndex={5}
          sizeVariant="compact"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tối thiểu 8 ký tự"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />

        <AuthPasswordInput
          label="Xác nhận mật khẩu"
          required
          tabIndex={6}
          sizeVariant="compact"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Nhập lại mật khẩu"
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          passwordsMatch={passwordsMatch}
          passwordsMismatch={passwordsMismatch}
        />
      </div>

      {/* Password strength & hints */}
      <PasswordStrengthBar password={password} />

      {/* Submit Button - tabIndex 7 ensures Tab from confirmPassword (6) jumps directly here */}
      <AuthSubmitButton
        type="submit"
        tabIndex={7}
        disabled={loading || passwordsMismatch}
        loading={loading}
        icon={ArrowRight}
        iconPosition="right"
        label="Hoàn Tất Đăng Ký Tài Khoản"
        className="mt-3"
      />
    </form>
  );
};
