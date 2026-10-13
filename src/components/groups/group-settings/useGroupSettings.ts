import { useState, useEffect, useRef } from 'react';
import { GroupResponse, groupService } from '../../../services/groupService';
import { mediaService } from '../../../services/mediaService';
import { useToast } from '../../../context/ToastContext';

interface UseGroupSettingsProps {
  group: GroupResponse;
  onUpdated: (group: GroupResponse) => void;
  onDeleted: () => void;
}

export const useGroupSettings = ({ group, onUpdated, onDeleted }: UseGroupSettingsProps) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>(group.privacy);
  const [rules, setRules] = useState(group.rules || '');
  const [coverUrl, setCoverUrl] = useState(group.coverUrl || '');
  const [postApprovalRequired, setPostApprovalRequired] = useState(Boolean(group.postApprovalRequired));
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const canEditSettings = Boolean(group.isAdmin);

  useEffect(() => {
    setName(group.name);
    setDescription(group.description || '');
    setPrivacy(group.privacy);
    setRules(group.rules || '');
    setCoverUrl(group.coverUrl || '');
    setPostApprovalRequired(Boolean(group.postApprovalRequired));
  }, [group]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const media = await mediaService.uploadMedia(file, 'groups');
      if (media?.fileUrl) {
        setCoverUrl(media.fileUrl);
        toast.showSuccess('Đã tải ảnh lên! Hãy bấm "Lưu thay đổi" để áp dụng ảnh bìa.');
      }
    } catch (err: any) {
      toast.showError(err?.message || 'Không thể tải ảnh bìa lên.');
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.showError('Tên nhóm không được để trống.');
      return;
    }
    try {
      setSaving(true);
      const updated = await groupService.updateGroup(group.id, {
        name: name.trim(),
        description: description.trim(),
        privacy,
        rules: rules.trim(),
        coverUrl: coverUrl.trim() || undefined,
        postApprovalRequired,
      });
      onUpdated(updated);
      toast.showSuccess('Đã lưu thông tin và cài đặt nhóm thành công!');
    } catch (err: any) {
      console.error('Failed to update group:', err);
      toast.showError(err?.response?.data?.message || err?.message || 'Không thể lưu cài đặt nhóm.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm(`Xóa nhóm "${group.name}"? Thao tác này sẽ giải tán nhóm và không thể hoàn tác.`)) return;
    try {
      await groupService.deleteGroup(group.id);
      toast.showSuccess('Đã giải tán nhóm thành công.');
      onDeleted();
    } catch (err: any) {
      toast.showError(err?.response?.data?.message || err?.message || 'Không thể xóa nhóm.');
    }
  };

  return {
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
  };
};
