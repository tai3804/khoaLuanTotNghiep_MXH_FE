import React, { useEffect, useState } from 'react';
import { Eye, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { ProfileVisitor } from '../../../../types';
import { userService } from '../../../../services/userService';
import { ProfileVisitorItem } from './ProfileVisitorItem';
import { ProfileVisitorsEmpty } from './ProfileVisitorsEmpty';

interface ProfileVisitorsListProps {
  onClose?: () => void;
}

export const ProfileVisitorsList: React.FC<ProfileVisitorsListProps> = ({ onClose }) => {
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
      {/* TikTok Style Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-4 rounded-2xl border border-blue-500/20 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-500 text-white shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
          <Eye className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
            Lịch sử xem hồ sơ
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full">
              30 ngày qua
            </span>
          </h4>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Xem những ai đã ghé thăm trang cá nhân của bạn. Chỉ người bật tính năng này mới hiển thị trong danh sách của nhau.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Đang tải lịch sử ghé thăm...</p>
        </div>
      ) : visitors.length === 0 ? (
        <ProfileVisitorsEmpty />
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-gray-800/40 rounded-2xl p-2 border border-gray-100 dark:border-gray-800 shadow-xs">
          {visitors.map((visitor) => (
            <ProfileVisitorItem
              key={visitor.id || `${visitor.viewerId}-${visitor.lastViewedAt}`}
              visitor={visitor}
              onCloseParent={onClose}
            />
          ))}

          {hasMore && (
            <div className="pt-3 text-center">
              <button
                onClick={() => fetchVisitors(page + 1, true)}
                disabled={loadingMore}
                className="px-4 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Đang tải thêm...' : 'Xem thêm lượt ghé thăm'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
