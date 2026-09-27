import { useState, useEffect } from 'react';

export const DEFAULT_AVATAR_URL = '/default-avatar.png';

interface UseUserAvatarProps {
  src?: string;
}

export const useUserAvatar = ({ src }: UseUserAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  const cleanSrc =
    src && typeof src === 'string' && src.trim() !== '' && src !== 'null' && src !== 'undefined'
      ? src.trim()
      : null;

  const hasError = imageError || !cleanSrc;
  const effectiveSrc = cleanSrc;

  const handleError = () => {
    setImageError(true);
  };

  return {
    hasError,
    effectiveSrc,
    handleError,
  };
};
