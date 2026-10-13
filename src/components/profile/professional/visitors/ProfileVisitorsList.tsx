import React, { useEffect, useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { ProfileVisitor } from '../../../../types';
import { userService } from '../../../../services/userService';
import { useLanguage } from '../../../../context/LanguageContext';
import { ProfileVisitorItem } from './ProfileVisitorItem';
import { ProfileVisitorsEmpty } from './ProfileVisitorsEmpty';

interface ProfileVisitorsListProps {
  onClose?: () => void;
}

export const ProfileVisitorsList: React.FC<ProfileVisitorsListProps> = ({ onClose }) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [visitors, setVisitors] = useState<ProfileVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchVisitors = async (pageNum: number, isAppend = false) => {
    try {
      if (isAppend) setLoadingMore(true);
      else setLoading(true);

      const res = await userService.getProfileVisitors(pageNum, 15);
      const items = res?.content || (Array.isArray(res) ? res : []);
      const isLast = res?.last ?? (items.length < 15);

      if (isAppend) {
        setVisitors((prev) => [...prev, ...items]);
      } else {
        setVisitors(items);
      }
      setHasMore(!isLast);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load profile visitors:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchVisitors(0);
  }, []);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="bg-white dark:bg-[#242526] p-5 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] shrink-0">
          <Eye className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-gray-900 dark:text-[#e4e6eb] flex items-center gap-2 text-sm">
            {isEn ? 'Profile Visitors History' : 'Lịch sử xem hồ sơ'}
            <span className="text-[11px] bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#b0b3b8] font-semibold px-2.5 py-0.5 rounded-lg border border-gray-200/60 dark:border-[#393a3b]">
              {isEn ? 'Last 30 days' : '30 ngày qua'}
            </span>
          </h4>
          <p className="text-gray-600 dark:text-[#b0b3b8] leading-relaxed">
            {isEn
              ? 'See who recently viewed your profile. Only people who have enabled this feature will be visible to each other.'
              : 'Xem những ai đã ghé thăm trang cá nhân của bạn. Chỉ người bật tính năng này mới hiển thị trong danh sách của nhau.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-[#1877f2] animate-spin" />
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            {isEn ? 'Loading visitor history...' : 'Đang tải lịch sử ghé thăm...'}
          </p>
        </div>
      ) : visitors.length === 0 ? (
        <ProfileVisitorsEmpty />
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-[#393a3b] bg-white dark:bg-[#242526] rounded-2xl p-2 border border-gray-200 dark:border-[#393a3b] shadow-xs">
          {visitors.map((visitor) => (
            <ProfileVisitorItem
              key={visitor.id || `${visitor.viewerId}-${visitor.lastViewedAt}`}
              visitor={visitor}
              onCloseParent={onClose}
            />
          ))}

          {hasMore && (
            <div className="pt-3 pb-1 text-center">
              <button
                onClick={() => fetchVisitors(page + 1, true)}
                disabled={loadingMore}
                className="px-4 py-2 text-xs font-semibold text-[#1877f2] dark:text-[#4599ff] hover:bg-gray-50 dark:hover:bg-[#3a3b3c] rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingMore
                  ? (isEn ? 'Loading more...' : 'Đang tải thêm...')
                  : (isEn ? 'Load more visitors' : 'Xem thêm lượt ghé thăm')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
