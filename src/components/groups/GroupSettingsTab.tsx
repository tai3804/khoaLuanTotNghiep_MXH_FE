import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { GroupResponse } from '../../services/groupService';
import {
  useGroupSettings,
  GroupCoverSetting,
  GroupBasicInfoSetting,
  GroupPrivacySetting,
  GroupRulesAndApprovalSetting,
  GroupDangerZoneSetting,
} from './group-settings';

interface GroupSettingsTabProps {
  group: GroupResponse;
  onUpdated: (group: GroupResponse) => void;
  onDeleted: () => void;
}

export const GroupSettingsTab: React.FC<GroupSettingsTabProps> = ({
  group,
  onUpdated,
  onDeleted,
}) => {
  const {
    name,
    setName,
    description,
    setDescription,
    privacy,
    setPrivacy,
    rules,
    setRules,
    coverUrl,
    setCoverUrl,
    postApprovalRequired,
    setPostApprovalRequired,
    saving,
    uploadingCover,
    coverInputRef,
    canEditSettings,
    handleCoverUpload,
    handleSave,
    handleDeleteGroup,
  } = useGroupSettings({ group, onUpdated, onDeleted });

  return (
    <div className="w-full space-y-5">
      {/* Main Settings Card */}
      <section className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-gray-200 dark:border-[#393a3b] p-6 space-y-6">
        <div className="border-b border-gray-100 dark:border-[#393a3b] pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e4e6eb]">Cài đặt thông tin nhóm</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#b0b3b8] mt-1">
            Quản trị viên có thể tùy chỉnh tên nhóm, ảnh bìa, quyền riêng tư và quy tắc kiểm duyệt.
          </p>
        </div>

        {!canEditSettings && (
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 p-3.5 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
            Bạn là người kiểm duyệt; chỉ quản trị viên tạo nhóm mới có quyền thay đổi thông tin cài đặt nhóm.
          </div>
        )}

        {/* 1. Cover Photo Setting */}
        <GroupCoverSetting
          coverUrl={coverUrl}
          setCoverUrl={setCoverUrl}
          canEditSettings={canEditSettings}
          uploadingCover={uploadingCover}
          coverInputRef={coverInputRef}
          onCoverUpload={handleCoverUpload}
        />

        {/* 2. Basic Info Setting (Name, Description) */}
        <GroupBasicInfoSetting
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          canEditSettings={canEditSettings}
        />

        {/* 3. Privacy Setting (Public, Private) */}
        <GroupPrivacySetting
          privacy={privacy}
          setPrivacy={setPrivacy}
          canEditSettings={canEditSettings}
        />

        {/* 4. Rules & Post Approval Setting */}
        <GroupRulesAndApprovalSetting
          rules={rules}
          setRules={setRules}
          postApprovalRequired={postApprovalRequired}
          setPostApprovalRequired={setPostApprovalRequired}
          canEditSettings={canEditSettings}
        />

        {/* Save Button */}
        {canEditSettings && (
          <div className="pt-2">
            <button
              disabled={saving}
              onClick={handleSave}
              className="rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white px-5 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Đang lưu cài đặt…' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        )}
      </section>

      {/* 5. Danger Zone Setting */}
      {group.isAdmin && (
        <GroupDangerZoneSetting onDeleteGroup={handleDeleteGroup} />
      )}
    </div>
  );
};

export default GroupSettingsTab;
