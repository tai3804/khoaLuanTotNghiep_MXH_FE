import React, { useState, useEffect } from 'react';
import { Users2, Plus, Globe, Lock, ArrowRight, Check, Clock, Search, RefreshCw, Compass, ShieldCheck } from 'lucide-react';
import { groupService, GroupResponse } from '../../services/groupService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface GroupsDiscoverProps {
  onCreateGroupClick: () => void;
}

export const GroupsDiscover: React.FC<GroupsDiscoverProps> = ({ onCreateGroupClick }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<GroupResponse[]>([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'joined' | 'managed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const loadGroups = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      setLoadError('');
      const data = await groupService.getGroups();
      setGroups(data);
    } catch {
      setGroups([]);
      setLoadError('Không thể tải danh sách nhóm. Hãy kiểm tra backend và thử lại.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
    const handleUpdate = () => loadGroups(true);
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
    loadGroups(true);
  };

  const joinedGroups = groups.filter((g) => g.isMember);
  const managedGroups = groups.filter((g) => g.isAdmin);

  const displayedGroups = groups
    .filter((g) => {
      if (filterTab === 'joined') return g.isMember;
      if (filterTab === 'managed') return g.isAdmin;
      return true;
    })
    .filter((g) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (g.name && g.name.toLowerCase().includes(term)) ||
        (g.description && g.description.toLowerCase().includes(term))
      );
    });

  return (
    <div className="w-full space-y-5">
      {/* Groups Navigation Options & Actions */}
      <div className="mb-4 space-y-3">
        {/* Row 1: Option Pills on Left, Compact Search & Reload on Right */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none min-w-0 flex-1">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                filterTab === 'all'
                  ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                  : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Tất cả nhóm</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                filterTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'
              }`}>
                {groups.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('joined')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                filterTab === 'joined'
                  ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                  : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
              }`}
            >
              <Users2 className="w-4 h-4" />
              <span>Đã tham gia</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                filterTab === 'joined' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'
              }`}>
                {joinedGroups.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('managed')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                filterTab === 'managed'
                  ? 'bg-[#1877f2] text-white shadow-xs font-bold'
                  : 'bg-white dark:bg-[#242526] text-gray-700 dark:text-[#b0b3b8] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] border border-gray-200/80 dark:border-[#393a3b]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Quản trị</span>
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                filterTab === 'managed' ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb]'
              }`}>
                {managedGroups.length}
              </span>
            </button>
          </div>

          {/* Right side: Compact Soft Capsule Search Bar & Reload Button */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <div className="relative w-36 sm:w-52">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400 dark:text-[#b0b3b8]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm nhóm..."
                className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-500 dark:placeholder-[#b0b3b8] rounded-full focus:outline-none focus:ring-1 focus:ring-[#1877f2] transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#e4e6eb] cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => loadGroups(false)}
              title="Làm mới danh sách nhóm"
              className="p-2 rounded-full bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-600 dark:text-[#b0b3b8] transition cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Row 2: Nút thêm nhóm đem xuống bên dưới */}
        <div className="flex items-center justify-between pt-0.5">
          <button
            onClick={onCreateGroupClick}
            className="w-full sm:w-auto bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold px-4 py-2 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo nhóm mới</span>
          </button>
        </div>
      </div>

      {/* Suggested Groups Grid */}
      <div className="space-y-4">
        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">{loadError}</div>
        ) : displayedGroups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-[#4e4f50] bg-white/60 dark:bg-[#242526]/60 px-6 py-12 text-center space-y-2">
            <Users2 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
            <h4 className="font-bold text-gray-800 dark:text-[#e4e6eb]">Không tìm thấy nhóm phù hợp</h4>
            <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">Hãy thử từ khóa khác hoặc tạo nhóm mới để bắt đầu xây dựng cộng đồng.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedGroups.map((group) => {
              const hasCover = typeof group.coverUrl === 'string' && group.coverUrl.trim() && !group.coverUrl.includes('images.unsplash.com/photo-1522071820081');
              return (
                <div
                  key={group.id}
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="bg-white dark:bg-[#242526] rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-sm hover:shadow-md transition overflow-hidden cursor-pointer flex flex-col group select-none"
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
                        <Users2 className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1">
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
                        {group.description || 'Không có mô tả chi tiết.'}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleJoin(e, group.id)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${group.isMember
                            ? 'bg-gray-100 dark:bg-[#3a3b3c] text-gray-700 dark:text-[#e4e6eb] hover:bg-gray-200'
                            : group.joinStatus === 'PENDING'
                              ? 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200'
                              : 'bg-[#1877f2] hover:bg-[#166fe5] text-white shadow-sm'
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


