import React, { useEffect, useState } from 'react';
import { AlertTriangle, Globe, Lock, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { groupService, GroupResponse } from '../../services/groupService';
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
  const [postApprovalRequired, setPostApprovalRequired] = useState(Boolean(group.postApprovalRequired));
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const canEditSettings = Boolean(group.isAdmin);

  useEffect(() => {
    setName(group.name); setDescription(group.description || ''); setPrivacy(group.privacy);
    setRules(group.rules || ''); setPostApprovalRequired(Boolean(group.postApprovalRequired));
  }, [group]);

  const save = async () => {
    if (!name.trim()) return toast.showError('Tên nhóm không được để trống.');
    try {
      setSaving(true);
      const updated = await groupService.updateGroup(group.id, { name: name.trim(), description: description.trim(), privacy, rules: rules.trim(), postApprovalRequired });
      onUpdated(updated);
      toast.showSuccess('Đã lưu cài đặt nhóm.');
    } catch {
      toast.showError('Không thể lưu cài đặt nhóm.');
    } finally { setSaving(false); }
  };

  const deleteGroup = async () => {
    if (!window.confirm(`Xóa nhóm “${group.name}”? Thao tác này không thể hoàn tác.`)) return;
    try {
      await groupService.deleteGroup(group.id);
      toast.showSuccess('Đã xóa nhóm.');
      onDeleted();
    } catch { toast.showError('Không thể xóa nhóm.'); }
  };

  return <div className="w-full max-w-[720px] space-y-4">
    <section className="bg-white dark:bg-[#242526] rounded-2xl shadow p-5 space-y-4">
      <div><h2 className="text-xl font-bold">Cài đặt nhóm</h2><p className="text-sm text-gray-500 mt-1">Cấu hình thông tin, quyền riêng tư và quy tắc thảo luận.</p></div>
      {!canEditSettings && <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-amber-800 dark:text-amber-200">Bạn là người kiểm duyệt; chỉ quản trị viên có thể thay đổi cài đặt nhóm.</div>}
      <label className="block text-sm font-semibold">Tên nhóm<input disabled={!canEditSettings} value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] p-2.5 disabled:opacity-60" /></label>
      <label className="block text-sm font-semibold">Giới thiệu<textarea disabled={!canEditSettings} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] p-2.5 disabled:opacity-60" /></label>
      <div className="grid sm:grid-cols-2 gap-3">
        {(['PUBLIC', 'PRIVATE'] as const).map((value) => <button key={value} disabled={!canEditSettings} onClick={() => setPrivacy(value)} className={`text-left rounded-xl border p-3 disabled:opacity-60 ${privacy === value ? 'border-[#1877f2] bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#393a3b]'}`}>
          <div className="flex gap-2 font-bold text-sm">{value === 'PUBLIC' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}{value === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</div><p className="mt-1 text-xs text-gray-500">{value === 'PUBLIC' ? 'Ai cũng có thể xem và tham gia.' : 'Cần được duyệt để trở thành thành viên.'}</p>
        </button>)}
      </div>
      <label className="block text-sm font-semibold">Nội quy nhóm<textarea disabled={!canEditSettings} value={rules} onChange={(e) => setRules(e.target.value)} rows={5} placeholder="Mỗi dòng là một quy tắc…" className="mt-1.5 w-full rounded-xl border border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#3a3b3c] p-2.5 disabled:opacity-60" /></label>
      <label className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-[#393a3b] p-3 cursor-pointer"><input type="checkbox" disabled={!canEditSettings} checked={postApprovalRequired} onChange={(e) => setPostApprovalRequired(e.target.checked)} className="mt-1" /><span><b className="text-sm flex gap-1.5 items-center"><ShieldCheck className="w-4 h-4 text-[#1877f2]" />Duyệt bài viết trước khi hiển thị</b><small className="block mt-1 text-gray-500">Bài đăng của thành viên sẽ chờ quản trị viên hoặc người kiểm duyệt xét duyệt.</small></span></label>
      {canEditSettings && <button disabled={saving} onClick={save} className="rounded-xl bg-[#1877f2] hover:bg-[#166fe5] text-white px-4 py-2.5 font-bold text-sm flex items-center gap-2 disabled:opacity-60"><Save className="w-4 h-4" />{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button>}
    </section>
    {group.isAdmin && <section className="bg-white dark:bg-[#242526] rounded-2xl shadow p-5 border border-red-200 dark:border-red-900/50"><h3 className="font-bold flex gap-2 items-center text-red-600"><AlertTriangle className="w-5 h-5" />Vùng nguy hiểm</h3><p className="mt-1 text-sm text-gray-500">Xóa nhóm sẽ ẩn nhóm khỏi mọi thành viên.</p><button onClick={deleteGroup} className="mt-4 rounded-xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-bold flex gap-2 items-center"><Trash2 className="w-4 h-4" />Xóa nhóm</button></section>}
  </div>;
};
