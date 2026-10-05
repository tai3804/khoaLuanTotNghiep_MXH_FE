import React from 'react';
import { Globe, Lock, Image as ImageIcon, UserPlus, Settings, Users, Clock } from 'lucide-react';
import { CommunityGroupMember } from '../../services/groupService';
import { UserAvatar } from '../common/UserAvatar';

export interface GroupData {
  id?: string;
  name: string;
  coverUrl?: string;
  privacy: string;
  memberCount: number;
  isMember: boolean;
  isAdmin: boolean;
  isModerator?: boolean;
  joinStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
  description?: string;
  rules?: string;
  postApprovalRequired?: boolean;
  createdAt?: string;
}

interface GroupBannerProps {
  group: GroupData;
  activeTab: string;
  setActiveTab: (tab: 'discussion' | 'members' | 'media' | 'appeals' | 'management' | 'pending-posts' | 'settings') => void;
  members?: CommunityGroupMember[];
  onNavigateProfile?: (userId: string) => void;
  onInviteClick?: () => void;
  onToggleJoin?: () => void;
  onLeaveGroup?: () => void;
}

export const GroupBanner: React.FC<GroupBannerProps> = ({
  group,
  activeTab,
  setActiveTab,
  members = [],
  onNavigateProfile,
  onInviteClick,
  onToggleJoin,
  onLeaveGroup,
}) => {
  const approvedMembers = members.filter((m) => m.status !== 'PENDING');
  const isPrivateLocked = group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin;

  return (
    <div className="w-full max-w-[1000px] bg-white dark:bg-[#242526] shadow-sm sm:rounded-b-lg overflow-hidden">
      {/* Cover Photo Frame */}
      {(() => {
        const hasCover = typeof group.coverUrl === 'string' && group.coverUrl.trim() && !group.coverUrl.includes('images.unsplash.com/photo-1522071820081');
        return (
          <div className="relative h-48 sm:h-72 w-full bg-gradient-to-br from-slate-100 via-gray-200 to-slate-300 dark:from-[#242526] dark:via-[#3a3b3c] dark:to-[#18191a] flex items-center justify-center overflow-hidden">
            {hasCover ? (
              <img src={group.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : null}
            {group.isAdmin && (
              <button className="absolute bottom-4 right-4 bg-white/90 dark:bg-[#3a3b3c]/90 hover:bg-white dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer backdrop-blur-sm">
                <ImageIcon className="w-4 h-4" />
                <span>{hasCover ? 'Chỉnh sửa ảnh bìa' : 'Thêm ảnh bìa'}</span>
              </button>
            )}
          </div>
        );
      })()}

      {/* Group Header Info */}
      <div className="px-4 sm:px-8 pt-4 pb-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">{group.name}</h1>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#b0b3b8] mt-1 font-medium">
          {group.privacy === 'PUBLIC' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
          <span>{group.privacy === 'PUBLIC' ? 'Nhóm Công khai' : 'Nhóm Riêng tư'}</span>
          <span>·</span>
          <span className="font-semibold text-gray-900 dark:text-[#e4e6eb]">{group.memberCount} thành viên</span>
        </div>

        <div className="flex items-center gap-2 mt-4 pb-4 border-b border-gray-200 dark:border-[#393a3b]">
          <div className="flex -space-x-2">
            {approvedMembers.slice(0, 3).map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onNavigateProfile?.(member.id)}
                title={`Xem trang cá nhân của ${member.name}`}
                aria-label={`Xem trang cá nhân của ${member.name}`}
                className="rounded-full transition-transform hover:z-10 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1877f2]"
              >
                <UserAvatar
                  src={member.avatar}
                  alt={member.name}
                  size="sm"
                  className="border-2 border-white dark:border-[#242526]"
                />
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {group.isMember && onInviteClick && (
              <button
                onClick={onInviteClick}
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                + Mời
              </button>
            )}

            {group.isMember ? (
              <button
                onClick={onLeaveGroup}
                className="bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
              >
                Đã tham gia
              </button>
            ) : group.joinStatus === 'PENDING' ? (
              <button
                onClick={onToggleJoin}
                className="bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
                title="Bấm để hủy yêu cầu tham gia nhóm"
              >
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Đã gửi yêu cầu (Hủy)
              </button>
            ) : (
              <button
                onClick={onToggleJoin}
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                + Tham gia nhóm
              </button>
            )}

            {(group.isAdmin || group.isModerator) && (
              <button onClick={() => setActiveTab('management')} className="bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] p-2 rounded-xl transition" title="Quản trị nhóm">
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mt-1">
          <button onClick={() => setActiveTab('discussion')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition ${activeTab === 'discussion' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Thảo luận
          </button>
          <button onClick={() => setActiveTab('members')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition ${activeTab === 'members' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Thành viên
          </button>
          {!isPrivateLocked && (
            <button onClick={() => setActiveTab('media')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition ${activeTab === 'media' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
              File phương tiện
            </button>
          )}
          {group.isMember && <button onClick={() => setActiveTab('appeals')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition ${activeTab === 'appeals' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Kháng nghị
          </button>}
          {(group.isAdmin || group.isModerator) && <button onClick={() => setActiveTab('pending-posts')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition ${activeTab === 'pending-posts' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Bài chờ duyệt
          </button>}
          {(group.isAdmin || group.isModerator) && <button onClick={() => setActiveTab('management')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition ${activeTab === 'management' || activeTab === 'settings' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Quản trị nhóm
          </button>}
        </div>
      </div>
    </div>
  );
};
