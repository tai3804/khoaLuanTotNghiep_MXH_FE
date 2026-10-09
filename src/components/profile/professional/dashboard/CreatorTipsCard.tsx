import React from 'react';
import { Lightbulb, Clock, Sparkles, MessageSquareHeart, CheckCircle } from 'lucide-react';

export const CreatorTipsCard: React.FC = () => {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-purple-50/80 dark:from-neutral-800/80 dark:via-neutral-800/50 dark:to-neutral-800/80 border border-indigo-100/80 dark:border-neutral-700/60 shadow-xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-extrabold text-base text-gray-900 dark:text-[#e4e6eb]">
            Mẹo phát triển dành cho Nhà sáng tạo
          </h4>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            Dựa trên thuật toán đề xuất phân phối nội dung của mạng xã hội
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        {/* Tip 1 */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xs border border-white/60 dark:border-neutral-700/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <Clock className="w-4 h-4 shrink-0" />
            <span>Khung giờ vàng đăng bài</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-neutral-300">
            Thời điểm tương tác cao nhất từ <strong className="text-gray-900 dark:text-white">11:30 - 13:00</strong> và <strong className="text-gray-900 dark:text-white">19:30 - 22:00</strong> mỗi ngày.
          </p>
        </div>

        {/* Tip 2 */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xs border border-white/60 dark:border-neutral-700/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Đa dạng hóa định dạng</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-neutral-300">
            Các bài viết có kèm hình ảnh chất lượng cao hoặc video ngắn nhận được nhiều hơn <strong className="text-gray-900 dark:text-white">+65% lượt tiếp cận</strong>.
          </p>
        </div>

        {/* Tip 3 */}
        <div className="p-3.5 rounded-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-xs border border-white/60 dark:border-neutral-700/50 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
            <MessageSquareHeart className="w-4 h-4 shrink-0" />
            <span>Tương tác hai chiều</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-neutral-300">
            Phản hồi bình luận trong <strong className="text-gray-900 dark:text-white">60 phút đầu</strong> giúp bài viết được thuật toán giữ hiển thị ở đầu bảng tin.
          </p>
        </div>
      </div>
    </div>
  );
};
