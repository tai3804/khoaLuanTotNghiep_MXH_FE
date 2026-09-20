import React, { useState, useEffect } from 'react';
import { Users, Plus, Globe, Lock } from 'lucide-react';
import { groupService, GroupResponse } from '../../services/groupService';
import { useNavigate } from 'react-router-dom';

interface GroupsSidebarProps {
  onCreateGroupClick: () => void;
}

export const GroupsSidebar: React.FC<GroupsSidebarProps> = ({ onCreateGroupClick }) => {
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const navigate = useNavigate();

  const loadGroups = async () => {
    const list = await groupService.getGroups();
    setGroups(list);
  };

  useEffect(() => {
    loadGroups();
    const handleUpdate = () => loadGroups();
    window.addEventListener('community_group_created', handleUpdate);
    window.addEventListener('community_group_updated', handleUpdate);
    return () => {
      window.removeEventListener('community_group_created', handleUpdate);
      window.removeEventListener('community_group_updated', handleUpdate);
    };
  }, []);

  const myGroups = groups.filter((g) => g.isMember || g.isAdmin);

  return (
    <div className="hidden md:flex w-[360px] flex-col bg-white dark:bg-[#242526] border-r border-gray-200 dark:border-[#393a3b] h-[calc(100vh-3.5rem)] sticky top-14">
      <div className="p-4 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#e4e6eb]">Nhóm</h1>
      </div>

      <div className="p-3 space-y-1">
        <button
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
            Nhóm bạn đã tham gia ({myGroups.length})
          </h3>
        </div>

        {myGroups.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center text-gray-400">
            <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="font-semibold text-xs text-gray-600 dark:text-gray-300">Chưa có nhóm nào</p>
            <p className="text-[11px] mt-1">Hãy tham gia hoặc tạo nhóm mới để kết nối!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {myGroups.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0">
                  {g.coverUrl ? (
                    <img src={g.coverUrl} alt={g.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-[#e4e6eb] truncate group-hover:text-[#1877f2] transition">
                    {g.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
                    {g.privacy === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span>{g.memberCount} thành viên</span>
                    {g.isAdmin && (
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">· Quản trị viên</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
