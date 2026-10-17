import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Users, Plus, Globe, Lock } from 'lucide-react';
import { groupService, GroupResponse } from '../../services/groupService';
import { useNavigate, useMatch } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../common/Skeleton';
import { GroupAvatar } from './GroupCover';

interface GroupsSidebarProps {
  onCreateGroupClick: () => void;
}

export const GroupsSidebar: React.FC<GroupsSidebarProps> = ({ onCreateGroupClick }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();
  const activeMatch = useMatch('/groups/:id');
  const requestSeq = useRef(0);

  const loadGroups = useCallback(async () => {
    const seq = ++requestSeq.current;
    try {
      setLoadError(false);
      const result = await groupService.getGroups({ scope: 'joined', page: 1, size: 50 });
      if (seq !== requestSeq.current) return;
      setGroups(result.groups);
      setTotal(result.totalElements);
    } catch {
      if (seq !== requestSeq.current) return;
      setGroups([]);
      setLoadError(true);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
    window.addEventListener('community_group_created', loadGroups);
    window.addEventListener('community_group_updated', loadGroups);
    return () => {
      window.removeEventListener('community_group_created', loadGroups);
      window.removeEventListener('community_group_updated', loadGroups);
    };
  }, [loadGroups, user?.id]);

  return (
    <div className="hidden md:flex w-[320px] lg:w-[360px] shrink-0 flex-col bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-[#393a3b] h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e4e6eb]">Nhóm</h1>
      </div>

      <div className="p-3 space-y-1">
        <button
          type="button"
          onClick={onCreateGroupClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition font-semibold text-sm cursor-pointer shadow-sm"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800/50 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          Tạo nhóm mới
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <div className="px-2">
          <h3 className="text-xs font-bold text-gray-500 dark:text-[#b0b3b8] uppercase tracking-wider">
            Nhóm bạn đã tham gia{!loading && !loadError ? ` (${total})` : ''}
          </h3>
        </div>

        {loading ? (
          <div className="space-y-2 px-1" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton variant="text" width="70%" height="0.9rem" />
                  <Skeleton variant="text" width="45%" height="0.7rem" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-red-500">Không tải được danh sách nhóm của bạn.</p>
            <button type="button" onClick={loadGroups} className="mt-2 text-xs font-bold text-[#1877f2] hover:underline cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center text-gray-400">
            <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="font-semibold text-xs text-gray-600 dark:text-gray-300">Chưa có nhóm nào</p>
            <p className="text-[11px] mt-1">Hãy tham gia hoặc tạo nhóm mới để kết nối!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {groups.map((g) => {
              const isActive = activeMatch?.params.id === g.id;
              return (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => navigate(`/groups/${g.id}`)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full text-left flex items-center gap-3 p-2 rounded-xl cursor-pointer transition group ${
                    isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-[#3a3b3c]'
                  }`}
                >
                  <GroupAvatar name={g.name} seed={g.id} coverUrl={g.coverUrl} className="w-10 h-10" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] truncate group-hover:text-[#1877f2] transition">
                      {g.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
                      {g.privacy === 'PUBLIC' ? <Globe className="w-3 h-3 shrink-0" /> : <Lock className="w-3 h-3 shrink-0" />}
                      <span className="truncate">{g.memberCount} thành viên</span>
                      {g.isOwner ? (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">· Chủ nhóm</span>
                      ) : g.isAdmin ? (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">· Quản trị viên</span>
                      ) : g.isModerator ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">· Điều hành viên</span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
