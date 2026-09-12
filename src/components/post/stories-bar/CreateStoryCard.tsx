import React from 'react';
import { Plus } from 'lucide-react';

interface CreateStoryCardProps {
  user: any;
  onOpenModal: () => void;
  t: (key: string) => string;
}

export const CreateStoryCard: React.FC<CreateStoryCardProps> = ({
  user,
  onOpenModal,
  t,
}) => {
  return (
    <div
      onClick={onOpenModal}
      className="relative w-28 sm:w-32 h-48 sm:h-52 rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-white dark:bg-[#242526] border border-gray-200 dark:border-[#393a3b] transition flex flex-col justify-between"
    >
      {/* Top 72% area */}
      <div className="h-[72%] w-full overflow-hidden bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-gray-100 dark:from-[#1877f2]/25 dark:via-blue-900/10 dark:to-[#3a3b3c] flex items-center justify-center relative">
        <div className="w-14 h-14 rounded-full ring-4 ring-white dark:ring-[#242526] shadow-md overflow-hidden bg-gray-200 dark:bg-[#3a3b3c] group-hover:scale-105 transition duration-300">
          <img
            src={user?.avatar || '/default-avatar.png'}
            alt={user?.fullName || 'Tạo tin'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
        </div>
      </div>

      {/* Bottom 28% area */}
      <div className="h-[28%] bg-white dark:bg-[#242526] flex flex-col items-center justify-end pb-2.5 relative">
        <div className="w-9 h-9 rounded-full bg-[#1877f2] border-4 border-white dark:border-[#242526] flex items-center justify-center text-white shadow-md absolute -top-4.5 group-hover:bg-[#166fe5] group-hover:scale-110 transition">
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </div>
        <span className="text-[12px] font-semibold text-gray-900 dark:text-[#e4e6eb] leading-tight">
          {t('createStory') || 'Tạo tin'}
        </span>
      </div>
    </div>
  );
};
