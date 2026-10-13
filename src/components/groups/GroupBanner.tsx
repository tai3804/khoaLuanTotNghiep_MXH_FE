import React, { useRef, useState } from 'react';
import { Globe, Lock, Image as ImageIcon, UserPlus, Settings, Users, Clock, Loader2, Edit3 } from 'lucide-react';
import { CommunityGroupMember, GroupResponse, groupService } from '../../services/groupService';
import { mediaService } from '../../services/mediaService';
import { useToast } from '../../context/ToastContext';
import { UserAvatar } from '../common/UserAvatar';
import { GroupAvatar } from '../common/GroupAvatar';

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
  onGroupUpdated?: (updated: GroupResponse) => void;
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
  onGroupUpdated,
}) => {
  const approvedMembers = members.filter((m) => m.status !== 'PENDING');
  const isPrivateLocked = group.privacy === 'PRIVATE' && !group.isMember && !group.isAdmin;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const toast = useToast();

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !group.id) return;
    try {
      setIsUploadingCover(true);
      const mediaItem = await mediaService.uploadMedia(file, 'groups');
      if (mediaItem?.fileUrl) {
        const updated = await groupService.updateGroup(group.id, { coverUrl: mediaItem.fileUrl });
        onGroupUpdated?.(updated);
        toast.showSuccess('Cập nhật ảnh bìa nhóm thành công!');
      } else {
        toast.showError('Không nhận được đường dẫn ảnh từ máy chủ.');
      }
    } catch (err: any) {
      console.error('Failed to update group cover:', err);
      toast.showError(err?.message || 'Không thể cập nhật ảnh bìa nhóm.');
    } finally {
      setIsUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#242526] shadow-sm rounded-3xl border border-gray-200 dark:border-[#393a3b] overflow-hidden">
      {/* Cover Photo Frame */}
      {(() => {
        const hasCover = typeof group.coverUrl === 'string' && group.coverUrl.trim() && !group.coverUrl.includes('images.unsplash.com/photo-1522071820081');
        return (
          <div className="relative h-56 sm:h-80 md:h-96 w-full bg-gradient-to-br from-slate-100 via-gray-200 to-slate-300 dark:from-[#242526] dark:via-[#3a3b3c] dark:to-[#18191a] flex items-center justify-center overflow-hidden">
            {hasCover ? (
              <img src={group.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 via-gray-300 to-slate-200 dark:from-[#2a2b2d] dark:via-[#343538] dark:to-[#222325]">
                <GroupAvatar
                  name={group.name}
                  size="2xl"
                  shape="squircle"
                  className="scale-125 shadow-2xl ring-8 ring-white/30 dark:ring-white/10"
                />
              </div>
            )}

            {group.isAdmin && (
              <>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCoverFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="absolute bottom-4 right-4 bg-white/90 dark:bg-[#3a3b3c]/90 hover:bg-white dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer backdrop-blur-sm disabled:opacity-60 z-10"
                >
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#1877f2]" />
                      <span>Đang tải ảnh lên...</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      <span>{hasCover ? 'Chỉnh sửa ảnh bìa' : 'Thêm ảnh bìa'}</span>
                    </>
                  )}
                </button>
              </>
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

            {group.isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className="bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] px-3.5 py-2 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
                title="Chỉnh sửa thông tin & cài đặt nhóm"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Chỉnh sửa thông tin</span>
              </button>
            )}

            {(group.isAdmin || group.isModerator) && (
              <button
                onClick={() => setActiveTab(group.isAdmin ? 'settings' : 'management')}
                className="bg-gray-200 dark:bg-[#3a3b3c] hover:bg-gray-300 dark:hover:bg-[#4e4f50] text-gray-900 dark:text-[#e4e6eb] p-2 rounded-xl transition cursor-pointer"
                title={group.isAdmin ? 'Cài đặt nhóm' : 'Quản trị nhóm'}
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mt-1 overflow-x-auto scrollbar-none">
          <button onClick={() => setActiveTab('discussion')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition whitespace-nowrap cursor-pointer ${activeTab === 'discussion' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Thảo luận
          </button>
          <button onClick={() => setActiveTab('members')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition whitespace-nowrap cursor-pointer ${activeTab === 'members' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Thành viên
          </button>
          {!isPrivateLocked && (
            <button onClick={() => setActiveTab('media')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition whitespace-nowrap cursor-pointer ${activeTab === 'media' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
              File phương tiện
            </button>
          )}
          {group.isMember && <button onClick={() => setActiveTab('appeals')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition whitespace-nowrap cursor-pointer ${activeTab === 'appeals' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Kháng nghị
          </button>}
          {(group.isAdmin || group.isModerator) && <button onClick={() => setActiveTab('pending-posts')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition whitespace-nowrap cursor-pointer ${activeTab === 'pending-posts' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Bài chờ duyệt
          </button>}
          {(group.isAdmin || group.isModerator) && <button onClick={() => setActiveTab('management')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition whitespace-nowrap cursor-pointer ${activeTab === 'management' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Quản trị nhóm
          </button>}
          {group.isAdmin && <button onClick={() => setActiveTab('settings')} className={`px-4 py-4 font-bold text-sm border-b-[3px] transition whitespace-nowrap cursor-pointer ${activeTab === 'settings' ? 'text-[#1877f2] border-[#1877f2]' : 'text-gray-500 dark:text-[#b0b3b8] border-transparent hover:bg-gray-100 dark:hover:bg-[#3a3b3c]/50 rounded-t-lg'}`}>
            Cài đặt nhóm
          </button>}
        </div>
      </div>
    </div>
  );
};
