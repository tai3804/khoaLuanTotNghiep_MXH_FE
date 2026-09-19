import React from 'react';
import { Users, Plus } from 'lucide-react';

interface GroupsSidebarProps {
  onCreateGroupClick: () => void;
}

export const GroupsSidebar: React.FC<GroupsSidebarProps> = ({ onCreateGroupClick }) => {
  return (
    <div className="hidden md:flex w-[360px] flex-col bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-[#393a3b] h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e4e6eb]">Nhóm</h1>
      </div>
      
      <div className="p-2 space-y-1">
        <button
          onClick={onCreateGroupClick}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition font-semibold"
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          Tạo nhóm mới
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center text-gray-500">
        <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="font-semibold text-gray-700 dark:text-gray-300">Chưa có nhóm nào</p>
        <p className="text-sm mt-1">Bạn chưa tham gia hoặc quản lý nhóm nào.</p>
      </div>
    </div>
  );
};
