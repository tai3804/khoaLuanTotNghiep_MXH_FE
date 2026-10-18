import { useCallback, useEffect, useRef, useState } from 'react';
import { CommunityGroupMember, groupService, MemberScope } from '../../services/groupService';
import { getApiErrorMessage } from '../../utils/apiError';

interface Options {
  groupId: string;
  scope: MemberScope;
  keyword?: string;
  pageSize?: number;
  /** false: chưa tải (vd. mục bị cấm của người không có quyền, hoặc nhóm riêng tư đang khóa). */
  enabled?: boolean;
}

/**
 * Danh sách thành viên phân trang theo từng scope (members, pending, invited, banned...).
 * Chỉ nhận kết quả của lần gọi mới nhất để đổi từ khóa nhanh không bị kết quả cũ ghi đè.
 */
export const useGroupMemberList = ({ groupId, scope, keyword = '', pageSize = 20, enabled = true }: Options) => {
  const [items, setItems] = useState<CommunityGroupMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [last, setLast] = useState(true);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const seq = useRef(0);

  const loadFirst = useCallback(async (silent = false) => {
    const current = ++seq.current;
    if (!enabled) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    setError('');
    try {
      const result = await groupService.getGroupMembersPage(groupId, { scope, keyword, page: 1, size: pageSize });
      if (current !== seq.current) return;
      setItems(result.members);
      setTotal(result.totalElements);
      setPage(1);
      setLast(result.last);
    } catch (err) {
      if (current !== seq.current) return;
      if (!silent) setItems([]);
      setError(getApiErrorMessage(err, 'Không thể tải danh sách thành viên.'));
    } finally {
      if (current === seq.current) setLoading(false);
    }
  }, [groupId, scope, keyword, pageSize, enabled]);

  useEffect(() => {
    void loadFirst();
  }, [loadFirst]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || last || !enabled) return;
    const current = seq.current;
    setLoadingMore(true);
    try {
      const result = await groupService.getGroupMembersPage(groupId, { scope, keyword, page: page + 1, size: pageSize });
      if (current !== seq.current) return;
      setItems((prev) => {
        const known = new Set(prev.map((m) => m.id));
        return [...prev, ...result.members.filter((m) => !known.has(m.id))];
      });
      setTotal(result.totalElements);
      setPage(result.page);
      setLast(result.last);
    } catch (err) {
      if (current === seq.current) setError(getApiErrorMessage(err, 'Không thể tải thêm thành viên.'));
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, last, enabled, groupId, scope, keyword, page, pageSize]);

  /** Bỏ một người khỏi danh sách đang hiển thị (sau khi duyệt/xóa/cấm) mà không cần tải lại. */
  const removeLocal = useCallback((memberId: string) => {
    setItems((prev) => prev.filter((m) => m.id !== memberId));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  const reload = useCallback((silent = true) => loadFirst(silent), [loadFirst]);

  return { items, total, loading, loadingMore, error, last, loadMore, reload, removeLocal };
};
