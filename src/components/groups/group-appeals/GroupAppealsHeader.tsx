import React from 'react';
import { RotateCcw } from 'lucide-react';

interface GroupAppealsHeaderProps {
  canReview: boolean;
}

export const GroupAppealsHeader: React.FC<GroupAppealsHeaderProps> = ({ canReview }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#242526] p-5 sm:p-6 shadow-sm border border-gray-200 dark:border-[#393a3b] flex items-center gap-3">
      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#1877f2]">
        <RotateCcw className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">
          {canReview ? 'Kháng nghị chờ xử lý' : 'Kháng nghị bài viết trong nhóm'}
        </h2>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-0.5">
          {canReview
            ? 'Xem xét các yêu cầu khôi phục bài viết bị gỡ bởi quản trị viên hoặc hệ thống kiểm duyệt.'
            : 'Danh sách các bài viết của bạn đã bị gỡ và trạng thái kháng nghị khôi phục.'}
        </p>
      </div>
    </div>
  );
};
