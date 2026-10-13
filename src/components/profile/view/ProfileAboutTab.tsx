import React from 'react';
import { UserProfile } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface ProfileAboutTabProps {
  fullName: string;
  profile: UserProfile | null;
  currentUserEmail?: string;
  isOwnProfile: boolean;
  onShowEditModal: () => void;
}

export const ProfileAboutTab: React.FC<ProfileAboutTabProps> = ({
  fullName,
  profile,
  currentUserEmail,
  isOwnProfile,
  onShowEditModal,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const formatGender = (gender?: string) => {
    if (gender === 'MALE') return isEn ? 'Male' : 'Nam';
    if (gender === 'FEMALE') return isEn ? 'Female' : 'Nữ';
    return isEn ? 'Other' : 'Khác';
  };

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-6 shadow-xs border border-gray-200 dark:border-[#393a3b] max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb] pb-3 border-b border-gray-100 dark:border-[#393a3b]">
        {isEn ? 'Personal Information Overview' : 'Tổng quan thông tin cá nhân'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">{isEn ? 'Full Name' : 'Họ và tên'}</label>
            <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{fullName}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">{isEn ? 'Contact Email' : 'Email liên hệ'}</label>
            <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{profile?.email || currentUserEmail || (isEn ? 'Not updated' : 'Chưa cập nhật')}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">{isEn ? 'Location' : 'Nơi sinh sống'}</label>
            <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{profile?.location || (isEn ? 'Ho Chi Minh City, Vietnam' : 'TP. Hồ Chí Minh, Việt Nam')}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">{isEn ? 'Gender' : 'Giới tính'}</label>
            <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">
              {formatGender(profile?.gender)}
            </p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">{isEn ? 'Date of Birth' : 'Ngày sinh'}</label>
            <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{profile?.dateOfBirth || (isEn ? 'Not updated' : 'Chưa cập nhật')}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 dark:text-[#8a8d91] uppercase">{isEn ? 'Bio' : 'Tiểu sử'}</label>
            <p className="font-semibold text-gray-900 dark:text-[#e4e6eb] mt-0.5">{profile?.bio || (isEn ? 'None' : 'Chưa có')}</p>
          </div>
        </div>
      </div>
      {isOwnProfile && (
        <div className="pt-4 border-t border-gray-100 dark:border-[#393a3b] flex justify-end">
          <button
            onClick={onShowEditModal}
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {isEn ? 'Edit Info' : 'Chỉnh sửa thông tin'}
          </button>
        </div>
      )}
    </div>
  );
};
