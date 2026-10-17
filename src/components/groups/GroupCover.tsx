import React, { useState } from 'react';

const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-600',
  'from-sky-500 to-cyan-600',
  'from-fuchsia-500 to-rose-600',
  'from-lime-500 to-emerald-600',
];

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
};

/** Cùng một nhóm luôn ra cùng một màu để người dùng nhận ra nhóm ngay cả khi chưa có ảnh bìa. */
const groupGradient = (seed: string) => GRADIENTS[hashString(seed || 'group') % GRADIENTS.length];

const groupInitial = (name: string) => (name.trim().charAt(0) || '?').toUpperCase();

interface GroupCoverProps {
  name: string;
  seed?: string;
  coverUrl?: string;
  className?: string;
  /** Cỡ chữ cái đầu khi chưa có ảnh bìa */
  initialClassName?: string;
}

/** Ảnh bìa nhóm; chưa có ảnh (hoặc ảnh lỗi) thì hiện nền gradient kèm chữ cái đầu của tên nhóm. */
export const GroupCover: React.FC<GroupCoverProps> = ({ name, seed, coverUrl, className = '', initialClassName = 'text-5xl' }) => {
  const [failedUrl, setFailedUrl] = useState('');
  const showImage = Boolean(coverUrl) && failedUrl !== coverUrl;

  if (showImage) {
    return (
      <img
        src={coverUrl}
        alt=""
        loading="lazy"
        onError={() => setFailedUrl(coverUrl || '')}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center bg-gradient-to-br ${groupGradient(seed || name)} text-white/90 font-extrabold select-none ${initialClassName} ${className}`}
    >
      {groupInitial(name)}
    </div>
  );
};

interface GroupAvatarProps {
  name: string;
  seed?: string;
  coverUrl?: string;
  className?: string;
}

/** Ảnh đại diện vuông bo góc của nhóm (thanh bên, danh sách). */
export const GroupAvatar: React.FC<GroupAvatarProps> = ({ name, seed, coverUrl, className = 'w-10 h-10' }) => (
  <GroupCover
    name={name}
    seed={seed}
    coverUrl={coverUrl}
    className={`${className} rounded-xl shrink-0`}
    initialClassName="text-base"
  />
);
