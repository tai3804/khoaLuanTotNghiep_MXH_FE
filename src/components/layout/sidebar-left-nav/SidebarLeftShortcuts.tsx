import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Users2 } from 'lucide-react';
import { groupService, GroupResponse } from '../../../services/groupService';
import { GroupAvatar } from '../../common/GroupAvatar';

interface SidebarLeftShortcutsProps {
  isCollapsed?: boolean;
  onFilterChange?: (filter: string) => void;
}

export const SidebarLeftShortcuts: React.FC<SidebarLeftShortcutsProps> = ({
  isCollapsed = false,
  onFilterChange,
}) => {
  const navigate = useNavigate();
  const [joinedGroups, setJoinedGroups] = useState<GroupResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchJoinedGroups = async () => {
    try {
      const all = await groupService.getGroups();
      const userGroups = all.filter((g) => g.isMember || g.isAdmin);
      setJoinedGroups(userGroups);
    } catch (err) {
      console.warn('Failed to fetch joined groups for shortcuts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJoinedGroups();

    const handleUpdate = () => fetchJoinedGroups();
    window.addEventListener('community_group_updated', handleUpdate);
    window.addEventListener('community_group_created', handleUpdate);

    return () => {
      window.removeEventListener('community_group_updated', handleUpdate);
      window.removeEventListener('community_group_created', handleUpdate);
    };
  }, []);

  const handleNavigateGroup = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  const handleNavigateAllGroups = () => {
    if (onFilterChange) {
      onFilterChange('groups');
    } else {
      navigate('/groups');
    }
  };

  return (
    <div className="pt-1">
      <div className="px-2 mb-1.5 overflow-hidden min-h-[16px] flex items-center justify-between">
        <span
          className={`text-xs font-bold text-gray-500 dark:text-[#b0b3b8] transition-all duration-300 ease-in-out block whitespace-nowrap overflow-hidden ${
            isCollapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-[180px] opacity-100 translate-x-0'
          }`}
        >
          Lối tắt của bạn
        </span>
      </div>

      <div className="space-y-0.5">
        {/* Joined groups list (Facebook style) */}
        {joinedGroups.slice(0, 6).map((group) => (
          <button
            key={group.id}
            onClick={() => handleNavigateGroup(group.id)}
            title={isCollapsed ? group.name : undefined}
            className="w-full flex items-center px-2 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 text-gray-800 dark:text-[#e4e6eb] text-xs font-semibold cursor-pointer transition-colors duration-150 group text-left"
          >
            <div className="shrink-0 w-8 h-8 flex items-center justify-center">
              <GroupAvatar
                src={group.coverUrl}
                name={group.name}
                size="sm"
                shape="squircle"
                className="group-hover:scale-105 transition-transform"
              />
            </div>
            <div
              className={`min-w-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ml-2.5 flex-1 ${
                isCollapsed
                  ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                  : 'max-w-[180px] opacity-100 translate-x-0'
              }`}
            >
              <span className="truncate block font-semibold text-gray-900 dark:text-[#e4e6eb] group-hover:text-[#1877f2] transition-colors">
                {group.name}
              </span>
            </div>
          </button>
        ))}

        {/* Explore all groups link */}
        <button
          onClick={handleNavigateAllGroups}
          title={isCollapsed ? 'Khám phá nhóm & cộng đồng' : undefined}
          className="w-full flex items-center px-2 py-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-[#3a3b3c]/60 text-[#2d88ff] text-xs font-semibold cursor-pointer transition-colors duration-150 group"
        >
          <div className="shrink-0 w-8 h-8 flex items-center justify-center">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[#2d88ff]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {joinedGroups.length > 0 ? (
                <Compass className="w-4 h-4 text-[#2d88ff]" />
              ) : (
                <Users2 className="w-4 h-4 text-[#2d88ff]" />
              )}
            </div>
          </div>
          <div
            className={`min-w-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ml-2.5 ${
              isCollapsed
                ? 'max-w-0 opacity-0 -translate-x-2 pointer-events-none'
                : 'max-w-[180px] opacity-100 translate-x-0'
            }`}
          >
            <span className="truncate block font-semibold">
              {joinedGroups.length > 0 ? 'Khám phá tất cả nhóm' : 'Khám phá nhóm & cộng đồng'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default SidebarLeftShortcuts;
