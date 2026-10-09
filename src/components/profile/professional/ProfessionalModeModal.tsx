import React, { useState } from 'react';
import { X, Sparkles, BarChart3, Users, Eye, ShieldCheck, Check } from 'lucide-react';
import { CREATOR_CATEGORIES } from './types';
import { userService } from '../../../services/userService';

interface ProfessionalModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCurrentlyEnabled: boolean;
  currentCategory?: string;
  onSuccess: (updatedProfile: any) => void;
}

export const ProfessionalModeModal: React.FC<ProfessionalModeModalProps> = ({
  isOpen,
  onClose,
  isCurrentlyEnabled,
  currentCategory = 'Người sáng tạo nội dung số',
  onSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(currentCategory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggle = async (enable: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const res = await userService.updateProfessionalMode({
        isProfessionalMode: enable,
        creatorCategory: enable ? selectedCategory : undefined,
      });
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#242526] text-gray-900 dark:text-[#e4e6eb] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {isCurrentlyEnabled ? 'Chỉnh sửa Chế độ chuyên nghiệp' : 'Bật Chế độ chuyên nghiệp'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Mở khóa công cụ phân tích & phát triển đối tượng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium border border-red-200 dark:border-red-900/50">
              {error}
            </div>
          )}

          {/* Benefits Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
              Quyền lợi khi kích hoạt
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold">Bảng điều khiển chuyên nghiệp</h5>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    Quản lý lượt xem bài viết, lượt tiếp cận và tương tác chi tiết.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold">Theo dõi lượt xem</h5>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    Ghi nhận lượt xem trang cá nhân và từng bài viết theo thời gian thực.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold">Mở rộng người theo dõi</h5>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    Cho phép bất kỳ ai theo dõi và hiển thị huy hiệu xác nhận Creator.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-100 dark:border-neutral-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold">Quyền riêng tư giữ nguyên</h5>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
                    Bạn vẫn toàn quyền cài đặt đối tượng xem cho từng bài viết cá nhân.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Select Category */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-neutral-500">
              Chọn hạng mục sáng tạo
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CREATOR_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold border transition cursor-pointer text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                        : 'border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 text-gray-700 dark:text-neutral-300'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-500 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/30">
          {isCurrentlyEnabled ? (
            <button
              onClick={() => handleToggle(false)}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              Tắt chế độ chuyên nghiệp
            </button>
          ) : (
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer"
            >
              Hủy
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggle(true)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {loading
                  ? 'Đang xử lý...'
                  : isCurrentlyEnabled
                  ? 'Lưu thay đổi'
                  : 'Bật chế độ chuyên nghiệp'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
