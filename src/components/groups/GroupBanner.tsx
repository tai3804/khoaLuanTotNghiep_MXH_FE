import React from 'react';
import { Globe, Lock, Image as ImageIcon, UserPlus, Settings } from 'lucide-react';
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
}

interface GroupBannerProps {
  group: GroupData;
  activeTab: string;
  setActiveTab: (tab: 'discussion' | 'members' | 'media' | 'settings') => void;
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
  return (
    <div className="w-full max-w-[1000px] bg-white dark:bg-[#242526] shadow-sm sm:rounded-b-lg overflow-hidden">
      {/* Cover Photo */}
      <div className="relative h-64 sm:h-80 w-full bg-gray-200 dark:bg-gray-700">
        {group.coverUrl ? (
          <img src={group.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {group.isAdmin && (
          <button className="absolute bottom-4 right-4 bg-white dark:bg-[#3a3b3c] hover:bg-gray-100 dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] px-3 py-1.5 rounded-lg font-semibold text-sm flex items-center gap-2 shadow transition">
            <ImageIcon className="w-4 h-4" /> Chỉnh sửa ảnh bìa
          </button>
        )}
      </div>

      {/* Group Header Info */}
      <div className="px-4 sm:px-8 pt-4 pb-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">{group.name}</h1>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#b0b3b8] mt-1 font-medium">
          {group.privacy === 'PUBLIC' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span>{group.privacy === 'PUBLIC' ? 'Nhóm Công khai' : 'Nhóm Riêng tư'}</span>
          <span>·</span>
          <span className="font-semibold text-gray-900 dark:text-[#e4e6eb]">{group.memberCount} thành viên</span>
        </div>

        <div className="flex items-center gap-2 mt-4 pb-4 border-b border-gray-200 dark:border-[#393a3b]">
          <div className="flex -space-x-2">
            {members.slice(0, 3).map((member) => (
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
                Rời nhóm
              </button>
            ) : (
              <button
                onClick={onToggleJoin}
                className="bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition cursor-pointer"
              >
                {group.joinStatus === 'PENDING' ? 'Đang chờ duyệt' : 'Tham gia nhóm'}
              </button>
            )}

            {(group.isAdmin || group.isModerator) && (
              <button onClick={() => setActiveTab('settings')} className="bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] p-2 rounded-xl transition" title="Quản lý nhóm">
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
          <button onClick={() => setActiveTab('media')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition ${activeTab === 'media' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            File phương tiện
          </button>
          {(group.isAdmin || group.isModerator) && <button onClick={() => setActiveTab('settings')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition ${activeTab === 'settings' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Quản lý
          </button>}
        </div>
      </div>
    </div>
  );
};
