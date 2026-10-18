import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { groupService, GroupResponse } from '../../services/groupService';
import { Skeleton } from '../common/Skeleton';
import { GroupAvatar } from './GroupCover';
import { useGroupMembership } from './useGroupMembership';

interface GroupsSuggestionsProps {
  /** Đổi giá trị này để tải lại gợi ý (vd. sau khi mình vào thêm nhóm). */
  refreshKey?: string;
  onSeeAll: () => void;
}

const SUGGESTION_COUNT = 3;

/** Cột "Gợi ý cho bạn" bên phải bảng feed nhóm: vài nhóm công khai mình chưa tham gia, vào nhóm ngay tại chỗ. */
export const GroupsSuggestions: React.FC<GroupsSuggestionsProps> = ({ refreshKey, onSeeAll }) => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const mySeq = ++seq.current;
    setLoading(true);
    setFailed(false);
    try {
      const result = await groupService.getGroups({ scope: 'discover', page: 1, size: SUGGESTION_COUNT });
      if (mySeq === seq.current) setGroups(result.groups);
    } catch {
      if (mySeq === seq.current) {
        setGroups([]);
        setFailed(true);
      }
    } finally {
      if (mySeq === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const { busyId, requestJoin, cancelRequest, joinModal } = useGroupMembership((updated, previous) => {
    if (updated) setGroups((prev) => prev.map((g) => (g.id === previous.id ? updated : g)));
  });

  if (!loading && !failed && groups.length === 0) return null;

  return (
    <aside aria-label="Gợi ý nhóm" className="bg-white dark:bg-[#242526] rounded-xl border border-gray-200 dark:border-[#393a3b] shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[17px] font-bold text-gray-900 dark:text-[#e4e6eb]">Gợi ý cho bạn</h3>
        <button type="button" onClick={onSeeAll} className="text-sm font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer">
          Xem tất cả
        </button>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {Array.from({ length: SUGGESTION_COUNT }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="70%" height="0.9rem" />
                <Skeleton variant="text" width="40%" height="0.7rem" />
              </div>
            </div>
          ))}
        </div>
      ) : failed ? (
        <div className="text-center py-2">
          <p className="text-xs text-red-500">Không tải được gợi ý.</p>
          <button type="button" onClick={() => void load()} className="mt-1 text-xs font-bold text-[#1877f2] hover:underline cursor-pointer">
            Thử lại
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => {
            const busy = busyId === group.id;
            const pending = group.joinStatus === 'PENDING' && !group.isMember;
            return (
              <li key={group.id} className="flex items-center gap-3">
                <button type="button" onClick={() => navigate(`/groups/${group.id}`)} aria-label={`Mở nhóm ${group.name}`} className="shrink-0 cursor-pointer">
                  <GroupAvatar name={group.name} seed={group.id} coverUrl={group.coverUrl} className="w-12 h-12" />
                </button>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="block max-w-full text-left text-sm font-bold text-gray-900 dark:text-[#e4e6eb] truncate hover:underline cursor-pointer"
                    title={group.name}
                  >
                    {group.name}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">{group.memberCount.toLocaleString('vi-VN')} thành viên</p>
                </div>
                {group.isMember ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 dark:bg-[#3a3b3c] text-gray-800 dark:text-[#e4e6eb] hover:bg-gray-200 dark:hover:bg-[#4e4f50] cursor-pointer"
                  >
                    Vào nhóm
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => (pending ? cancelRequest(group) : requestJoin(group))}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60 ${
                      pending
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                        : 'bg-blue-50 hover:bg-blue-100 text-[#1877f2] dark:bg-blue-900/30 dark:text-[#4599ff]'
                    }`}
                  >
                    {busy && <Loader2 className="w-3 h-3 animate-spin" />}
                    {pending ? 'Hủy yêu cầu' : 'Tham gia'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {joinModal}
    </aside>
  );
};
