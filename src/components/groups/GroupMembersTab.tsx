import React from 'react';

export const GroupMembersTab: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-[#242526] rounded-2xl shadow p-4">
      <h3 className="font-bold text-xl text-gray-900 dark:text-[#e4e6eb] mb-4">Thành viên mới</h3>
      <div className="text-sm text-gray-500 dark:text-[#b0b3b8]">Danh sách thành viên sẽ được cập nhật sau khi tích hợp API.</div>
    </div>
  );
};
