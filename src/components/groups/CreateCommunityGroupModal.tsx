import React from 'react';
import { createPortal } from 'react-dom';
import { Monitor, Smartphone } from 'lucide-react';
import { useCreateGroupData } from './create-group/useCreateGroupData';
import { CreateGroupSidebar } from './create-group/CreateGroupSidebar';
import { CreateGroupDesktopPreview } from './create-group/CreateGroupDesktopPreview';
import { CreateGroupMobilePreview } from './create-group/CreateGroupMobilePreview';
import { GroupResponse } from '../../services/groupService';

interface CreateCommunityGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated?: (group: GroupResponse) => void;
}

export const CreateCommunityGroupModal: React.FC<CreateCommunityGroupModalProps> = ({
  isOpen,
  onClose,
  onGroupCreated,
}) => {
  const {
    user,
    name,
    setName,
    description,
    setDescription,
    privacy,
    setPrivacy,
    postApprovalRequired,
    setPostApprovalRequired,
    rules,
    setRules,
    friends,
    selectedFriendIds,
    toggleFriend,
    friendSearch,
    setFriendSearch,
    filteredFriends,
    loadingFriends,
    creating,
    previewDevice,
    setPreviewDevice,
    showAdvanced,
    setShowAdvanced,
    getFriendName,
    handleCreateGroup,
  } = useCreateGroupData({ isOpen, onClose, onGroupCreated });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-[#f0f2f5] dark:bg-[#18191a] flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-200">
      {/* Left Sidebar Controller */}
      <CreateGroupSidebar
        user={user}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        privacy={privacy}
        setPrivacy={setPrivacy}
        postApprovalRequired={postApprovalRequired}
        setPostApprovalRequired={setPostApprovalRequired}
        rules={rules}
        setRules={setRules}
        selectedFriendIds={selectedFriendIds}
        toggleFriend={toggleFriend}
        friendSearch={friendSearch}
        setFriendSearch={setFriendSearch}
        filteredFriends={filteredFriends}
        friendsCount={friends.length}
        loadingFriends={loadingFriends}
        creating={creating}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        getFriendName={getFriendName}
        onClose={onClose}
        onSubmit={handleCreateGroup}
      />

      {/* Right Canvas Area: Device Switcher & Live Preview */}
      <div className="flex-1 h-full bg-[#f0f2f5] dark:bg-[#18191a] flex flex-col overflow-hidden">
        {/* Canvas Toolbar */}
        <div className="px-6 py-3.5 border-b border-gray-200 dark:border-[#393a3b] bg-white dark:bg-[#242526] flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#e4e6eb] leading-tight">
              Bản xem trước trực tiếp
            </h2>
            <p className="text-[11px] text-gray-500 dark:text-[#b0b3b8] hidden sm:block">
              Xem trước giao diện trang nhóm của bạn theo thời gian thực
            </p>
          </div>

          {/* Device Switcher (Desktop 💻 vs Mobile 📱) */}
          <div className="flex items-center bg-gray-100 dark:bg-[#3a3b3c] p-1 rounded-xl space-x-1 border border-gray-200/60 dark:border-transparent">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                previewDevice === 'desktop'
                  ? 'bg-white dark:bg-[#242526] text-[#1877f2] shadow-xs'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Máy tính</span>
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                previewDevice === 'mobile'
                  ? 'bg-white dark:bg-[#242526] text-[#1877f2] shadow-xs'
                  : 'text-gray-600 dark:text-[#b0b3b8] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Điện thoại</span>
            </button>
          </div>
        </div>

        {/* Canvas Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start scrollbar-thin">
          {previewDevice === 'desktop' ? (
            <CreateGroupDesktopPreview
              user={user}
              name={name}
              description={description}
              privacy={privacy}
              memberCount={selectedFriendIds.size + 1}
            />
          ) : (
            <CreateGroupMobilePreview
              user={user}
              name={name}
              description={description}
              privacy={privacy}
              memberCount={selectedFriendIds.size + 1}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateCommunityGroupModal;
