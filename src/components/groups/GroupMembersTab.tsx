import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Search, Loader2, UserMinus, UserX, Check, X } from 'lucide-react';
import { groupService, GroupResponse, CommunityGroupMember } from '../../services/groupService';
import { UserAvatar } from '../common/UserAvatar';

interface GroupMembersTabProps {
  group: GroupResponse;
  onInviteClick?: () => void;
  onNavigateProfile?: (userId: string) => void;
}

export const GroupMembersTab: React.FC<GroupMembersTabProps> = ({ group, onInviteClick, onNavigateProfile }) => {
  const [members, setMembers] = useState<CommunityGroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMemberId, setActionMemberId] = useState<string | null>(null);
  const canModerate = Boolean(group.isAdmin || group.isModerator);

  useEffect(() => {
    if (group?.id) {
      loadMembers();
    }
  }, [group?.id, group?.memberCount]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await groupService.getGroupMembers(group.id, canModerate);
      setMembers(data);
    } catch (err) {
      console.error('Failed to load group members:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const admins = filteredMembers.filter((m) => m.role === 'ADMIN');
  const regularMembers = filteredMembers.filter((m) => m.role !== 'ADMIN');
  const pendingMembers = members.filter((m) => m.status === 'PENDING');

  const runAction = async (memberId: string, action: () => Promise<unknown>) => {
    try { setActionMemberId(memberId); await action(); await loadMembers(); } catch (err) { console.error('Group member action failed', err); } finally { setActionMemberId(null); }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl shadow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">
            Thành viên · <span className="text-[#1877f2]">{group.memberCount}</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8] mt-1">
            Những người trong nhóm này có thể xem và chia sẻ bài viết cùng nhau.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onInviteClick && (
            <button
              onClick={onInviteClick}
              className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              + Mời bạn bè
            </button>
          )}
        </div>
      </div>

      {/* Search Input Card */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl shadow p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm thành viên theo tên..."
            className="w-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] placeholder-gray-400 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-transparent focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-[#242526] rounded-2xl shadow p-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1877f2]" />
          <span className="text-sm text-gray-500 dark:text-[#b0b3b8]">Đang tải danh sách thành viên...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {canModerate && pendingMembers.length > 0 && (
            <div className="bg-white dark:bg-[#242526] rounded-2xl shadow p-5">
              <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb] mb-4">Yêu cầu tham gia ({pendingMembers.length})</h3>
              <div className="space-y-2">{pendingMembers.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 dark:border-[#393a3b] p-3">
                <div className="flex items-center gap-3 min-w-0"><UserAvatar src={member.avatar} alt={member.name} size="md" /><span className="font-semibold text-sm truncate">{member.name}</span></div>
                <div className="flex gap-2 shrink-0"><button disabled={actionMemberId === member.id} onClick={() => runAction(member.id, () => groupService.reviewMember(group.id, member.id, true))} className="rounded-lg bg-[#1877f2] px-3 py-1.5 text-xs font-bold text-white"><Check className="w-3.5 h-3.5 inline mr-1" />Duyệt</button><button disabled={actionMemberId === member.id} onClick={() => runAction(member.id, () => groupService.reviewMember(group.id, member.id, false))} className="rounded-lg bg-gray-100 dark:bg-[#3a3b3c] px-3 py-1.5 text-xs font-bold"><X className="w-3.5 h-3.5 inline mr-1" />Từ chối</button></div>
              </div>)}</div>
            </div>
          )}
          {/* Admin Section */}
          {admins.length > 0 && (
            <div className="bg-white dark:bg-[#242526] rounded-2xl shadow p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[#1877f2]" />
                <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb]">
                  Quản trị viên & Người kiểm duyệt ({admins.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/60 transition border border-gray-100 dark:border-transparent"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => onNavigateProfile?.(admin.id)}
                        title={`Xem trang cá nhân của ${admin.name}`}
                        className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                      >
                        <UserAvatar src={admin.avatar} alt={admin.name} size="md" className="w-11 h-11 rounded-full" />
                      </button>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-900 dark:text-[#e4e6eb] truncate">
                          {admin.name}
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-[#1877f2]">
                          <ShieldCheck className="w-3 h-3" /> Quản trị viên
                        </span>
                      </div>
                    </div>
                    {group.isAdmin && admin.id !== group.ownerId && <select disabled={actionMemberId === admin.id} value={admin.role} onChange={(e) => runAction(admin.id, () => groupService.changeMemberRole(group.id, admin.id, e.target.value as 'ADMIN' | 'MODERATOR' | 'MEMBER'))} className="text-xs rounded-lg bg-gray-100 dark:bg-[#3a3b3c] p-1.5"><option value="ADMIN">Admin</option><option value="MODERATOR">Kiểm duyệt</option><option value="MEMBER">Thành viên</option></select>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Members Section */}
          <div className="bg-white dark:bg-[#242526] rounded-2xl shadow p-5">
            <h3 className="font-bold text-base text-gray-900 dark:text-[#e4e6eb] mb-4">
              Thành viên ({regularMembers.length})
            </h3>

            {regularMembers.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-[#b0b3b8]">
                {searchQuery ? 'Không tìm thấy thành viên nào phù hợp với tìm kiếm.' : 'Chưa có thêm thành viên nào khác.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {regularMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/60 transition border border-gray-100 dark:border-transparent"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => onNavigateProfile?.(member.id)}
                        title={`Xem trang cá nhân của ${member.name}`}
                        className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
                      >
                        <UserAvatar src={member.avatar} alt={member.name} size="md" className="w-11 h-11 rounded-full" />
                      </button>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-gray-900 dark:text-[#e4e6eb] truncate">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#b0b3b8]">
                          Thành viên nhóm
                        </div>
                      </div>
                    </div>
                    {canModerate && member.id !== group.ownerId && <div className="flex gap-1 shrink-0">{group.isAdmin && <select disabled={actionMemberId === member.id} value={member.role} onChange={(e) => runAction(member.id, () => groupService.changeMemberRole(group.id, member.id, e.target.value as 'ADMIN' | 'MODERATOR' | 'MEMBER'))} className="text-xs rounded-lg bg-gray-100 dark:bg-[#3a3b3c] p-1.5"><option value="MEMBER">Thành viên</option><option value="MODERATOR">Kiểm duyệt</option><option value="ADMIN">Admin</option></select>}<button disabled={actionMemberId === member.id} onClick={() => runAction(member.id, () => groupService.removeMember(group.id, member.id))} title="Xóa khỏi nhóm" className="p-2 rounded-lg hover:bg-red-50 text-red-600"><UserMinus className="w-4 h-4" /></button><button disabled={actionMemberId === member.id} onClick={() => runAction(member.id, () => groupService.removeMember(group.id, member.id, true))} title="Chặn thành viên" className="p-2 rounded-lg hover:bg-red-50 text-red-600"><UserX className="w-4 h-4" /></button></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

