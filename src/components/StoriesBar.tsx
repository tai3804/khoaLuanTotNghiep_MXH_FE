import React from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserAvatar } from './UserAvatar';

export const StoriesBar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none">
      {/* Create Story card */}
      <div className="relative w-28 h-44 rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group flex-shrink-0 bg-slate-200 dark:bg-slate-800 transition flex flex-col items-center justify-between p-3">
        <div className="pt-2">
          <UserAvatar src={user?.avatar} alt={user?.fullName} size="lg" />
        </div>
        <div className="flex flex-col items-center pb-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white shadow-md mb-1">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-gray-800 dark:text-slate-200">{t('createStory') || 'Tạo tin'}</span>
        </div>
      </div>
    </div>
  );
};
