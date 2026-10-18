import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService, type ReputationHistoryItem } from '../../../services/userService';

const PAGE_SIZE = 10;

const PENALTY_LABELS: Record<string, string> = {
  WARN_USER: 'Bị cảnh cáo',
  AUTO_HIDE: 'Bài viết bị tự động ẩn',
  HIDE_POST: 'Bài viết bị tạm ẩn',
  DELETE_POST: 'Bài viết bị gỡ bỏ',
};

const labelOf = (item: ReputationHistoryItem) => {
  switch (item.type) {
    case 'PENALTY':
      return (item.action && PENALTY_LABELS[item.action]) || 'Bị trừ điểm';
    case 'REFUND':
      return 'Được hoàn lại điểm';
    case 'RECOVERY':
      return 'Tự hồi phục điểm';
    case 'LOCK':
      return 'Tài khoản bị khóa';
    case 'UNLOCK':
      return 'Được mở khóa tài khoản';
    default:
      return 'Thay đổi điểm';
  }
};

// Giờ máy chủ gửi dạng LocalDateTime không kèm múi giờ (cùng quy ước với giờ đăng bài)
const formatWhen = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const APPEALABLE_ACTIONS = new Set(['AUTO_HIDE', 'HIDE_POST', 'DELETE_POST']);

/**
 * Lịch sử cộng/trừ điểm uy tín của chính mình: mỗi lần bị cảnh cáo, ẩn/gỡ bài, được hoàn điểm, tự hồi phục, bị khóa hay mở khóa
 * đều có một dòng kèm lý do và điểm trước → sau. Chỉ tải khi người dùng mở ra.
 */
export const ReputationHistoryList: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ReputationHistoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [last, setLast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const loadPage = async (nextPage: number) => {
    setLoading(true);
    setFailed(false);
    const result = await userService.getMyReputationHistory(nextPage, PAGE_SIZE);
    if (!result) {
      setFailed(true);
    } else {
      setItems((current) => {
        const known = new Set(current.map((item) => item.id));
        return [...current, ...result.items.filter((item) => !known.has(item.id))];
      });
      setPage(nextPage);
      setLast(result.last);
    }
    setLoading(false);
  };

  const toggle = () => {
    const opening = !open;
    setOpen(opening);
    if (opening && page === 0 && !loading) void loadPage(1);
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1 text-[11px] font-semibold text-[#1877f2] hover:underline cursor-pointer"
      >
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        {open ? 'Ẩn lịch sử điểm uy tín' : 'Xem lịch sử điểm uy tín'}
      </button>

      {open && (
        <div className="mt-2">
          {items.length === 0 && loading && (
            <div className="flex items-center gap-2 py-3 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Đang tải lịch sử...
            </div>
          )}

          {failed && (
            <p className="py-2 text-[11px] text-red-600 dark:text-red-400">
              Không tải được lịch sử.{' '}
              <button type="button" onClick={() => void loadPage(page + 1)} className="font-semibold underline cursor-pointer">
                Thử lại
              </button>
            </p>
          )}

          {!loading && !failed && items.length === 0 && (
            <p className="py-2 text-[11px] leading-relaxed text-gray-500 dark:text-[#b0b3b8]">
              Chưa có lần thay đổi điểm nào. Điểm của bạn vẫn giữ nguyên từ lúc tạo tài khoản.
            </p>
          )}

          {items.length > 0 && (
            <ul className="space-y-2">
              {items.map((item) => {
                const delta = item.scoreAfter - item.scoreBefore;
                const tone =
                  delta > 0
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : delta < 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                const canAppeal =
                  item.type === 'PENALTY' && !item.reverted && item.sourceType === 'POST' && !!item.action && APPEALABLE_ACTIONS.has(item.action);
                return (
                  <li key={item.id} className="rounded-lg border border-gray-200 px-2.5 py-2 text-[11px] dark:border-[#393a3b]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 dark:text-[#e4e6eb]">
                          {labelOf(item)}
                          {item.reverted && (
                            <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              Đã hoàn lại
                            </span>
                          )}
                        </p>
                        {item.reason && (
                          <p className="mt-0.5 line-clamp-2 leading-relaxed text-gray-600 dark:text-[#b0b3b8]">{item.reason}</p>
                        )}
                        <p className="mt-0.5 text-gray-400 dark:text-[#8a8d91]">{formatWhen(item.createdAt)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`inline-block rounded-full px-2 py-0.5 font-bold ${tone}`}>
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                        <p className="mt-0.5 text-gray-500 dark:text-[#b0b3b8]">
                          {item.scoreBefore} → {item.scoreAfter}
                        </p>
                      </div>
                    </div>
                    {canAppeal && (
                      <button
                        type="button"
                        onClick={() => navigate('/support-inbox')}
                        className="mt-1 font-semibold text-[#1877f2] hover:underline cursor-pointer"
                      >
                        Gửi kháng nghị
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 && !last && (
            <button
              type="button"
              onClick={() => void loadPage(page + 1)}
              disabled={loading}
              className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#1877f2] hover:underline cursor-pointer disabled:opacity-60"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Xem thêm
            </button>
          )}
        </div>
      )}
    </div>
  );
};
