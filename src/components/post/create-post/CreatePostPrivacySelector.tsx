import React from 'react';
import { Globe, Users, Lock } from 'lucide-react';

interface CreatePostPrivacySelectorProps {
  privacy: 'public' | 'friends' | 'private';
  setPrivacy: (privacy: 'public' | 'friends' | 'private') => void;
}

export const CreatePostPrivacySelector: React.FC<CreatePostPrivacySelectorProps> = ({
  privacy,
  setPrivacy,
}) => {
  const togglePrivacy = () => {
    if (privacy === 'public') setPrivacy('friends');
    else if (privacy === 'friends') setPrivacy('private');
    else setPrivacy('public');
  };

  return (
    <button
      type="button"
      onClick={togglePrivacy}
      className="flex items-center space-x-1.5 bg-gray-100 dark:bg-[#3a3b3c] px-2.5 py-1 rounded-md text-xs font-semibold text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#4e4f50] border border-gray-200 dark:border-[#4e4f50] transition cursor-pointer"
      title="Nhấn để đổi quyền riêng tư"
    >
      {privacy === 'public' && (
        <>
          <Globe className="w-3.5 h-3.5 text-[#1877f2]" />
          <span>Công khai</span>
        </>
      )}
      {privacy === 'friends' && (
        <>
          <Users className="w-3.5 h-3.5 text-[#45bd62]" />
          <span>Bạn bè</span>
        </>
      )}
      {privacy === 'private' && (
        <>
          <Lock className="w-3.5 h-3.5 text-[#f3425f]" />
          <span>Chỉ mình tôi</span>
        </>
      )}
    </button>
  );
};
