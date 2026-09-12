import { useState } from 'react';

export const DEFAULT_AVATAR_URL = '/default-avatar.png';

interface UseUserAvatarProps {
  src?: string;
}

export const useUserAvatar = ({ src }: UseUserAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const effectiveSrc = src && !imageError && src.trim() !== '' ? src : DEFAULT_AVATAR_URL;

  const handleError = () => {
    if (!imageError) setImageError(true);
  };

  return {
    effectiveSrc,
    handleError,
  };
};
