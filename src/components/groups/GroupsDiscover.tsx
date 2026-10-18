import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Clock, Compass, Loader2, Mail, Plus, Search, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { groupService, GroupResponse } from '../../services/groupService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { Skeleton } from '../common/Skeleton';
import { GroupCard } from './GroupCard';
import { useGroupMembership } from './useGroupMembership';

/** discover = nhóm chưa tham gia, joined = nhóm của mình, invited = lời mời đang chờ */
export type GroupListScope = 'discover' | 'joined' | 'invited';

interface GroupsDiscoverProps {
  scope: GroupListScope;
  onCreateGroupClick: () => void;
  /** Chuyển sang tab Khám phá (từ trạng thái rỗng của các tab khác). */
  onExplore: () => void;
}

const PAGE_SIZE = 12;

const COPY: Record<GroupListScope, { title: string; subtitle: string; empty: string; emptyHint: string; searchable: boolean }> = {
  discover: {
    title: 'Khám phá nhóm',
    subtitle: 'Tìm những cộng đồng phù hợp với sở thích của bạn.',
    empty: 'Chưa có nhóm nào để khám phá',
    emptyHint: 'Hãy tạo nhóm mới để bắt đầu xây dựng cộng đồng.',
    searchable: true,
  },
  joined: {
    title: 'Nhóm của bạn',
    subtitle: 'Những nhóm bạn đã tham gia hoặc đang quản lý.',
    empty: 'Bạn chưa tham gia nhóm nào',
    emptyHint: 'Sang tab "Khám phá" để tìm và tham gia các nhóm bạn quan tâm.',
    searchable: true,
  },
  invited: {
    title: 'Lời mời tham gia nhóm',
    subtitle: 'Bạn bè và quản trị viên mời bạn vào các nhóm này.',
    empty: 'Bạn không có lời mời nào',
    emptyHint: 'Khi ai đó mời bạn vào nhóm, lời mời sẽ hiện ở đây để bạn chấp nhận hoặc từ chối.',
    searchable: false,
  },
};

/** Các yêu cầu tham gia nhóm riêng tư mình đã gửi và đang chờ duyệt: thu gọn được, hủy ngay tại đây. */
const PendingRequests: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [open, setOpen] = useState(true);

  const load = useCallback(async () => {
    try {
      const result = await groupService.getGroups({ scope: 'pending', page: 1, size: 50 });
      setGroups(result.groups);
    } catch {
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener('community_group_updated', load);
    return () => window.removeEventListener('community_group_updated', load);
  }, [load]);

  const { busyId, cancelRequest } = useGroupMembership((_, previous) => {
    setGroups((prev) => prev.filter((g) => g.id !== previous.id));
  });

  if (groups.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/70 dark:bg-amber-900/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-3 text-left cursor-pointer"
      >
        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0" />
        <span className="flex-1 text-sm font-bold text-amber-900 dark:text-amber-100">
          Yêu cầu đang chờ duyệt ({groups.length})
        </span>
        <ChevronDown className={`w-4 h-4 text-amber-700 dark:text-amber-200 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="px-3 pb-3 grid grid-cols-1 lg:grid-cols-2 gap-2">
          {groups.map((group) => (
            <li key={group.id} className="flex items-center gap-3 rounded-xl bg-white dark:bg-[#242526] border border-amber-100 dark:border-[#393a3b] p-3">
              <button
                type="button"
                onClick={() => navigate(`/groups/${group.id}`)}
                className="flex-1 min-w-0 text-left cursor-pointer"
              >
                <span className="block text-sm font-bold text-gray-900 dark:text-[#e4e6eb] truncate hover:underline">{group.name}</span>
                <span className="block text-xs text-gray-500 dark:text-[#b0b3b8]">
                  Chờ quản trị viên duyệt · {group.memberCount.toLocaleString('vi-VN')} thành viên
                </span>
              </button>
              <button
                type="button"
                disabled={busyId === group.id}
                onClick={() => cancelRequest(group)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#4e4f50] disabled:opacity-60 cursor-pointer"
              >
                {busyId === group.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Hủy yêu cầu
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export const GroupsDiscover: React.FC<GroupsDiscoverProps> = ({ scope, onCreateGroupClick, onExplore }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const copy = COPY[scope];

  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState('');
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
      const result = await groupService.getGroups({ scope, keyword: copy.searchable ? keyword : '', page: 1, size: PAGE_SIZE });
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
  }, [scope, keyword, copy.searchable]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (loadingMore || last) return;
    const seq = requestSeq.current;
    setLoadingMore(true);
    try {
      const result = await groupService.getGroups({ scope, keyword: copy.searchable ? keyword : '', page: page + 1, size: PAGE_SIZE });
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

  const { busyId, requestJoin, cancelRequest, respondToInvitation, joinModal } = useGroupMembership((updated, previous) => {
    // Lời mời đã được trả lời thì không còn nằm trong danh sách lời mời
    if (scope === 'invited') {
      setGroups((prev) => prev.filter((g) => g.id !== previous.id));
      setTotal((t) => Math.max(0, t - 1));
      return;
    }
    if (!updated) {
      void loadFirstPage();
      return;
    }
    setGroups((prev) => prev.map((g) => (g.id === previous.id ? updated : g)));
  });

  const openGroup = (groupId: string) => navigate(`/groups/${groupId}`);
  const hasKeyword = keyword.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">{copy.title}</h2>
          <p className="text-sm text-gray-500 dark:text-[#b0b3b8]">{copy.subtitle}</p>
        </div>

        {copy.searchable && (
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={scope === 'joined' ? 'Tìm trong nhóm của bạn...' : 'Tìm nhóm theo tên hoặc mô tả...'}
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
        )}
      </div>

      {scope === 'joined' && !hasKeyword && <PendingRequests />}

      {!loading && !loadError && groups.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-[#b0b3b8]" aria-live="polite">
          {hasKeyword ? `${total} kết quả cho "${keyword}"` : `${total} nhóm`}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] overflow-hidden">
              <Skeleton className="w-full h-28 sm:h-32 rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton variant="text" width="70%" height="1.1rem" />
                <Skeleton variant="text" width="40%" height="0.8rem" />
                <Skeleton variant="text" width="100%" height="2rem" />
                <Skeleton width="100%" height="2.25rem" className="rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm text-red-700 dark:text-red-200">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadFirstPage()}
            className="mt-4 px-4 py-2 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-[#4e4f50] bg-white/60 dark:bg-[#242526]/60 px-6 py-12 text-center">
          {scope === 'invited' ? (
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          ) : scope === 'discover' ? (
            <Compass className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          ) : (
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          )}
          {hasKeyword ? (
            <>
              <h4 className="font-bold text-gray-800 dark:text-[#e4e6eb]">Không tìm thấy nhóm phù hợp</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Thử từ khóa khác hoặc xóa bộ lọc tìm kiếm.</p>
            </>
          ) : (
            <>
              <h4 className="font-bold text-gray-800 dark:text-[#e4e6eb]">{copy.empty}</h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8] max-w-md mx-auto">{copy.emptyHint}</p>
              {scope !== 'invited' && (
                <button
                  type="button"
                  onClick={scope === 'joined' ? onExplore : onCreateGroupClick}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-bold cursor-pointer"
                >
                  {scope === 'joined' ? <Compass className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {scope === 'joined' ? 'Khám phá nhóm' : 'Tạo nhóm mới'}
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                busy={busyId === group.id}
                onOpen={openGroup}
                onJoin={requestJoin}
                onCancelRequest={cancelRequest}
                onRespondInvitation={respondToInvitation}
              />
            ))}
          </div>
          {!last && (
            <div className="flex justify-center pt-2 pb-6">
              <button
                type="button"
                onClick={() => void loadMore()}
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
      {joinModal}
    </div>
  );
};
