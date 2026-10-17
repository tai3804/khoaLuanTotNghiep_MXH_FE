import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Plus, Search, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { groupService, GroupResponse, GroupScope } from '../../services/groupService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { Skeleton } from '../common/Skeleton';
import { GroupCard } from './GroupCard';

interface GroupsDiscoverProps {
  onCreateGroupClick: () => void;
}

type TabScope = Extract<GroupScope, 'discover' | 'joined' | 'pending'>;

const TABS: { scope: TabScope; label: string }[] = [
  { scope: 'discover', label: 'Khám phá' },
  { scope: 'joined', label: 'Nhóm của bạn' },
  { scope: 'pending', label: 'Đang chờ duyệt' },
];

const PAGE_SIZE = 12;

const EMPTY_TEXT: Record<TabScope, { title: string; hint: string }> = {
  discover: { title: 'Chưa có nhóm nào để khám phá', hint: 'Hãy tạo nhóm mới để bắt đầu xây dựng cộng đồng.' },
  joined: { title: 'Bạn chưa tham gia nhóm nào', hint: 'Sang tab "Khám phá" để tìm và tham gia các nhóm bạn quan tâm.' },
  pending: { title: 'Không có yêu cầu nào đang chờ duyệt', hint: 'Các yêu cầu tham gia nhóm riêng tư của bạn sẽ hiện ở đây.' },
};

export const GroupsDiscover: React.FC<GroupsDiscoverProps> = ({ onCreateGroupClick }) => {
  const navigate = useNavigate();
  const toast = useToast();

  const [scope, setScope] = useState<TabScope>('discover');
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState('');
  // Chỉ nhận kết quả của lần gọi mới nhất (tránh tab/từ khóa cũ ghi đè kết quả mới)
  const requestSeq = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setKeyword(searchInput.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadFirstPage = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setLoadError('');
    try {
      const result = await groupService.getGroups({ scope, keyword, page: 1, size: PAGE_SIZE });
      if (seq !== requestSeq.current) return;
      setGroups(result.groups);
      setPage(1);
      setLast(result.last);
      setTotal(result.totalElements);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setGroups([]);
      setLoadError(getApiErrorMessage(err, 'Không thể tải danh sách nhóm. Vui lòng thử lại.'));
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [scope, keyword]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (loadingMore || last) return;
    const seq = requestSeq.current;
    setLoadingMore(true);
    try {
      const result = await groupService.getGroups({ scope, keyword, page: page + 1, size: PAGE_SIZE });
      if (seq !== requestSeq.current) return;
      setGroups((prev) => {
        const known = new Set(prev.map((g) => g.id));
        return [...prev, ...result.groups.filter((g) => !known.has(g.id))];
      });
      setPage(result.page);
      setLast(result.last);
      setTotal(result.totalElements);
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể tải thêm nhóm.'));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleToggleJoin = async (group: GroupResponse) => {
    if (busyId) return;
    setBusyId(group.id);
    try {
      const updated = await groupService.toggleJoinGroup(group.id);
      if (!updated) {
        await loadFirstPage();
        return;
      }
      const wasPending = group.joinStatus === 'PENDING';
      if (scope === 'pending' && wasPending) {
        // Đã hủy yêu cầu: nhóm không còn ở danh sách chờ duyệt
        setGroups((prev) => prev.filter((g) => g.id !== group.id));
        setTotal((t) => Math.max(0, t - 1));
        toast.showSuccess('Đã hủy yêu cầu tham gia nhóm.');
      } else {
        setGroups((prev) => prev.map((g) => (g.id === group.id ? updated : g)));
        if (wasPending) toast.showSuccess('Đã hủy yêu cầu tham gia nhóm.');
        else toast.showSuccess(updated.joinStatus === 'PENDING' ? 'Đã gửi yêu cầu tham gia, vui lòng chờ quản trị viên duyệt.' : `Bạn đã tham gia nhóm "${updated.name}".`);
      }
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể thực hiện thao tác, vui lòng thử lại.'));
    } finally {
      setBusyId('');
    }
  };

  const openGroup = (groupId: string) => navigate(`/groups/${groupId}`);
  const hasKeyword = keyword.length > 0;

  return (
    <div className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-3.5rem)] p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Tiêu đề + tạo nhóm (gọn, không chiếm cả màn hình) */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Nhóm cộng đồng</h2>
            <p className="text-sm text-gray-500 dark:text-[#b0b3b8]">Giao lưu, học hỏi và chia sẻ cùng những người chung đam mê.</p>
          </div>
          <button
            type="button"
            onClick={onCreateGroupClick}
            className="md:hidden shrink-0 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tạo nhóm
          </button>
        </div>

        {/* Tab + ô tìm kiếm */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div role="tablist" aria-label="Danh sách nhóm" className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.scope}
                type="button"
                role="tab"
                aria-selected={scope === tab.scope}
                onClick={() => setScope(tab.scope)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition cursor-pointer ${
                  scope === tab.scope
                    ? 'bg-blue-50 text-[#1877f2] dark:bg-blue-900/30'
                    : 'text-gray-600 dark:text-[#b0b3b8] hover:bg-gray-200 dark:hover:bg-[#3a3b3c]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm nhóm theo tên hoặc mô tả..."
              aria-label="Tìm nhóm"
              maxLength={100}
              className="w-full pl-9 pr-9 py-2 bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#393a3b] rounded-full text-sm text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Xóa từ khóa"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-[#4e4f50] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {!loading && !loadError && (
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            {hasKeyword ? `${total} kết quả cho "${keyword}"` : `${total} nhóm`}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden">
                <Skeleton className="w-full h-32 rounded-none" />
                <div className="p-4 space-y-3">
                  <Skeleton variant="text" width="70%" height="1.1rem" />
                  <Skeleton variant="text" width="40%" height="0.8rem" />
                  <Skeleton variant="text" width="100%" height="2rem" />
                  <Skeleton width="100%" height="2.25rem" className="rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-200">{loadError}</p>
            <button
              type="button"
              onClick={loadFirstPage}
              className="mt-4 px-4 py-2 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-[#4e4f50] bg-white/60 dark:bg-[#242526]/60 px-6 py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            {hasKeyword ? (
              <>
                <h4 className="font-bold text-gray-800 dark:text-[#e4e6eb]">Không tìm thấy nhóm phù hợp</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Thử từ khóa khác hoặc xóa bộ lọc tìm kiếm.</p>
              </>
            ) : (
              <>
                <h4 className="font-bold text-gray-800 dark:text-[#e4e6eb]">{EMPTY_TEXT[scope].title}</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">{EMPTY_TEXT[scope].hint}</p>
              </>
            )}
            {!hasKeyword && scope !== 'pending' && (
              <button
                type="button"
                onClick={scope === 'joined' ? () => setScope('discover') : onCreateGroupClick}
                className="mt-4 px-4 py-2 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold cursor-pointer"
              >
                {scope === 'joined' ? 'Khám phá nhóm' : 'Tạo nhóm mới'}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  busy={busyId === group.id}
                  onOpen={openGroup}
                  onToggleJoin={handleToggleJoin}
                />
              ))}
            </div>
            {!last && (
              <div className="flex justify-center pt-2 pb-6">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 rounded-xl bg-white dark:bg-[#3a3b3c] border border-gray-200 dark:border-[#4e4f50] text-sm font-bold text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-50 dark:hover:bg-[#4e4f50] transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                  Xem thêm nhóm
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
