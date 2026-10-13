import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Globe, Lock, Save, ShieldCheck, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { groupService, GroupResponse } from '../../services/groupService';
import { mediaService } from '../../services/mediaService';
import { useToast } from '../../context/ToastContext';

interface GroupSettingsTabProps {
  group: GroupResponse;
  onUpdated: (group: GroupResponse) => void;
  onDeleted: () => void;
}

export const GroupSettingsTab: React.FC<GroupSettingsTabProps> = ({ group, onUpdated, onDeleted }) => {
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

  const save = async () => {
    if (!name.trim()) return toast.showError('Tên nhóm không được để trống.');
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

  const deleteGroup = async () => {
    if (!window.confirm(`Xóa nhóm "${group.name}"? Thao tác này sẽ giải tán nhóm và không thể hoàn tác.`)) return;
    try {
      await groupService.deleteGroup(group.id);
      toast.showSuccess('Đã giải tán nhóm thành công.');
      onDeleted();
    } catch (err: any) {
      toast.showError(err?.response?.data?.message || err?.message || 'Không thể xóa nhóm.');
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-5">
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

        {/* Cover Photo Preview & Change */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
            Ảnh bìa nhóm
          </label>
          <div className="relative h-44 sm:h-52 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#1a1b1d] border border-gray-200 dark:border-[#393a3b] flex items-center justify-center">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400 text-xs">
                <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span>Chưa có ảnh bìa tùy chỉnh</span>
              </div>
            )}
            {canEditSettings && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {uploadingCover ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                  <span>{coverUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên'}</span>
                </button>
                {coverUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverUrl('')}
                    className="bg-red-600/80 hover:bg-red-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl backdrop-blur-sm transition cursor-pointer"
                    title="Gỡ ảnh bìa"
                  >
                    Gỡ
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Group Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
            Tên nhóm <span className="text-red-500">*</span>
          </label>
          <input
            disabled={!canEditSettings}
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên nhóm..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/80 dark:bg-[#1a1b1d] px-4 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] disabled:opacity-60 transition"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
            Giới thiệu về nhóm
          </label>
          <textarea
            disabled={!canEditSettings}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Mô tả mục đích hoạt động và chủ đề thảo luận của nhóm..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/80 dark:bg-[#1a1b1d] px-4 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] disabled:opacity-60 transition resize-none"
          />
        </div>

        {/* Privacy Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
            Quyền riêng tư
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            {(['PUBLIC', 'PRIVATE'] as const).map((value) => (
              <button
                key={value}
                type="button"
                disabled={!canEditSettings}
                onClick={() => setPrivacy(value)}
                className={`text-left rounded-2xl border p-3.5 transition cursor-pointer disabled:opacity-60 ${
                  privacy === value
                    ? 'border-[#1877f2] bg-blue-50/70 dark:bg-blue-900/20 shadow-xs'
                    : 'border-gray-200 dark:border-[#393a3b] hover:bg-gray-50 dark:hover:bg-[#3a3b3c]/40'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb]">
                  {value === 'PUBLIC' ? (
                    <Globe className="w-4 h-4 text-[#1877f2]" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-500" />
                  )}
                  <span>{value === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</span>
                </div>
                <p className="mt-1 text-[11px] text-gray-500 dark:text-[#b0b3b8] leading-relaxed">
                  {value === 'PUBLIC'
                    ? 'Bất kỳ ai cũng có thể tìm thấy nhóm và xem bài viết.'
                    : 'Chỉ thành viên mới nhìn thấy các thành viên và bài viết trong nhóm.'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-700 dark:text-[#b0b3b8]">
            Nội quy nhóm
          </label>
          <textarea
            disabled={!canEditSettings}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows={4}
            placeholder="1. Tôn trọng lẫn nhau&#10;2. Không đăng bài quảng cáo, spam&#10;3. Giữ gìn văn hóa thảo luận văn minh..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50/80 dark:bg-[#1a1b1d] px-4 py-2.5 text-xs sm:text-sm text-gray-900 dark:text-[#e4e6eb] focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] disabled:opacity-60 transition resize-none"
          />
        </div>

        {/* Post Approval */}
        <label className="flex items-start gap-3 rounded-2xl border border-gray-200 dark:border-[#393a3b] p-3.5 cursor-pointer bg-gray-50/50 dark:bg-[#1a1b1d]/50">
          <input
            type="checkbox"
            disabled={!canEditSettings}
            checked={postApprovalRequired}
            onChange={(e) => setPostApprovalRequired(e.target.checked)}
            className="mt-1 rounded text-[#1877f2] focus:ring-0"
          />
          <div>
            <b className="text-xs sm:text-sm flex gap-1.5 items-center text-gray-900 dark:text-[#e4e6eb]">
              <ShieldCheck className="w-4 h-4 text-[#1877f2]" /> Duyệt bài viết trước khi hiển thị
            </b>
            <small className="block mt-0.5 text-[11px] text-gray-500 dark:text-[#b0b3b8]">
              Bài đăng của thành viên sẽ chờ quản trị viên hoặc người kiểm duyệt phê duyệt trước khi xuất hiện trên dòng thời gian nhóm.
            </small>
          </div>
        </label>

        {/* Save Button */}
        {canEditSettings && (
          <div className="pt-2">
            <button
              disabled={saving}
              onClick={save}
              className="rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white px-5 py-2.5 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Đang lưu cài đặt…' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        )}
      </section>

      {/* Danger Zone */}
      {group.isAdmin && (
        <section className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm p-6 border border-red-200 dark:border-red-900/50 space-y-3">
          <h3 className="font-bold text-base flex gap-2 items-center text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" /> Vùng nguy hiểm
          </h3>
          <p className="text-xs text-gray-500 dark:text-[#b0b3b8]">
            Giải tán nhóm sẽ xóa vĩnh viễn nhóm và gỡ bỏ tất cả bài viết, thành viên. Hành động này không thể hoàn tác.
          </p>
          <button
            onClick={deleteGroup}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-xs sm:text-sm font-bold flex gap-2 items-center transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Giải tán nhóm</span>
          </button>
        </section>
      )}
    </div>
  );
};
