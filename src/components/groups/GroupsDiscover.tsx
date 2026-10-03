import React, { useState, useEffect } from 'react';
import { Users, Plus, Globe, Lock, ArrowRight, Check, Clock } from 'lucide-react';
import { groupService, GroupResponse } from '../../services/groupService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface GroupsDiscoverProps {
  onCreateGroupClick: () => void;
}

export const GroupsDiscover: React.FC<GroupsDiscoverProps> = ({ onCreateGroupClick }) => {
  const { user } = useAuth();
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
  }, [user?.id]);

  const handleToggleJoin = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    await groupService.toggleJoinGroup(groupId);
    loadGroups();
  };

  return (
    <div className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)] p-4 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            Cộng Đồng Mạng Xã Hội
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Khám phá & Tham gia các Nhóm
          </h2>
          <p className="text-blue-100 text-sm">
            Giao lưu, học hỏi, kết nối và chia sẻ bài viết cùng những người có chung đam mê và mục tiêu.
          </p>
        </div>
        <button
          onClick={onCreateGroupClick}
          className="bg-white hover:bg-gray-100 text-blue-600 font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition flex items-center gap-2 shrink-0 cursor-pointer text-sm"
        >
          <Plus className="w-5 h-5" />
          + Tạo nhóm mới
        </button>
      </div>

      {/* Suggested Groups Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#e4e6eb]">
              Gợi ý nhóm cho bạn
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
              Các nhóm cộng đồng hoạt động sôi nổi nhất
            </p>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-[#4e4f50] bg-white/60 dark:bg-[#242526]/60 px-6 py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h4 className="font-bold text-gray-800 dark:text-[#e4e6eb]">Chưa có nhóm nào</h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Hãy tạo nhóm mới để bắt đầu xây dựng cộng đồng.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => {
              const hasCover = typeof group.coverUrl === 'string' && group.coverUrl.trim() && !group.coverUrl.includes('images.unsplash.com/photo-1522071820081');
              return (
              <div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer flex flex-col group"
              >
                {/* Cover Image Frame */}
                <div className="h-36 w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#2a2b2d] dark:to-[#1e1f20] relative overflow-hidden flex items-center justify-center">
                  {hasCover ? (
                    <img
                      src={group.coverUrl}
                      alt={group.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <Users className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1">
                    {group.privacy === 'PUBLIC' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {group.privacy === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}
                  </div>
                </div>

                {/* Group Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb] line-clamp-1 group-hover:text-[#1877f2] transition">
                      {group.name}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-[#b0b3b8] font-medium block">
                      {group.memberCount} thành viên
                    </span>
                  <p className="text-xs text-gray-600 dark:text-[#b0b3b8] line-clamp-2 leading-relaxed pt-1">
                    {group.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleJoin(e, group.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      group.isMember
                        ? 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200'
                        : group.joinStatus === 'PENDING'
                        ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                        : 'bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-sm shadow-blue-500/20'
                    }`}
                    title={group.joinStatus === 'PENDING' ? 'Bấm để hủy yêu cầu tham gia' : undefined}
                  >
                    {group.isMember ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Đã tham gia
                      </>
                    ) : group.joinStatus === 'PENDING' ? (
                      <>
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        Đã gửi yêu cầu (Hủy)
                      </>
                    ) : (
                      'Tham gia nhóm'
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-[#3a3b3c] rounded-xl transition cursor-pointer"
                    title="Xem nhóm"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
          </div>
        )}
      </div>
    </div>
  );
};
