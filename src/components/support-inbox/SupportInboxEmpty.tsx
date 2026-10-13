import React from 'react';
import { CheckCircle2, SearchX, Compass } from 'lucide-react';

interface SupportInboxEmptyProps {
  isFiltered: boolean;
  onClearFilters?: () => void;
  onNavigateHome?: () => void;
}

export const SupportInboxEmpty: React.FC<SupportInboxEmptyProps> = ({
  isFiltered,
  onClearFilters,
  onNavigateHome,
}) => {
  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl p-8 sm:p-12 text-center border border-gray-200 dark:border-[#393a3b] shadow-xs space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1877f2] flex items-center justify-center mx-auto">
        {isFiltered ? <SearchX className="w-7 h-7 text-gray-500 dark:text-gray-400" /> : <CheckCircle2 className="w-7 h-7 text-emerald-500" />}
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
          {isFiltered ? 'Không tìm thấy báo cáo phù hợp' : 'Hộp thư hỗ trợ sạch sẽ!'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8] max-w-md mx-auto leading-relaxed">
          {isFiltered
            ? 'Không có báo cáo nào khớp với điều kiện tìm kiếm hoặc bộ lọc trạng thái hiện tại.'
            : 'Bạn chưa gửi báo cáo vi phạm nào hoặc toàn bộ các báo cáo trước đó đã được xử lý xong. Cảm ơn bạn đã luôn đồng hành xây dựng mạng xã hội an toàn!'}
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-2">
        {isFiltered ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-800 dark:text-[#e4e6eb] rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <span>Xem tất cả báo cáo</span>
          </button>
        ) : onNavigateHome ? (
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#1877f2] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Khám phá bảng tin</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
