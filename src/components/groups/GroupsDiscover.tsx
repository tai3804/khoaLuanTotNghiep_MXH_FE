import React from 'react';
import { Users } from 'lucide-react';

interface GroupsDiscoverProps {
  onCreateGroupClick: () => void;
}

export const GroupsDiscover: React.FC<GroupsDiscoverProps> = ({ onCreateGroupClick }) => {
  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
       <div className="max-w-md w-full bg-white dark:bg-[#242526] p-8 rounded-2xl shadow text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb] mb-2">Khám phá Cộng Đồng</h2>
          <p className="text-gray-500 dark:text-[#b0b3b8] mb-6">Kết nối với những người có chung sở thích. Hãy tạo một nhóm cộng đồng mới để bắt đầu!</p>
          <button
            onClick={onCreateGroupClick}
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold py-2 px-6 rounded-xl transition"
          >
            + Tạo nhóm mới
          </button>
       </div>
    </div>
  );
};
