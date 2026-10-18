import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, Globe, Image as ImageIcon, Loader2, Lock, Save, ShieldCheck, Trash2, Undo2 } from 'lucide-react';
import { groupService, GroupResponse } from '../../services/groupService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { TabCard } from './groupTabUi';
import { GroupQuestionsEditor, MAX_QUESTION_LENGTH } from './GroupQuestionsEditor';

interface GroupSettingsTabProps {
  group: GroupResponse;
  onUpdated: (group: GroupResponse) => void;
  onDeleted: () => void;
}

const LIMITS = { name: 100, description: 1000, rules: 3000 };

const Counter: React.FC<{ value: string; max: number }> = ({ value, max }) => (
  <span className={`text-xs font-normal ${value.length >= max ? 'text-red-500' : 'text-gray-400'}`}>{value.length}/{max}</span>
);

const inputClass = 'mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-900 placeholder-gray-400 disabled:opacity-60 focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:border-[#393a3b] dark:bg-[#3a3b3c] dark:text-[#e4e6eb]';

const Section: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <TabCard className="p-4 sm:p-5">
    <h3 className="text-base font-extrabold text-gray-900 dark:text-[#e4e6eb]">{title}</h3>
    {hint && <p className="mt-0.5 text-sm text-gray-500 dark:text-[#b0b3b8]">{hint}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </TabCard>
);

const cleanQuestions = (questions: string[]) => questions.map((q) => q.trim()).filter(Boolean);

/** Cài đặt nhóm (chỉ quản trị viên chỉnh được): thông tin, quyền riêng tư, câu hỏi tham gia, duyệt bài, nội quy, xóa nhóm. */
export const GroupSettingsTab: React.FC<GroupSettingsTabProps> = ({ group, onUpdated, onDeleted }) => {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>(group.privacy);
  const [rules, setRules] = useState(group.rules || '');
  const [questions, setQuestions] = useState<string[]>(group.membershipQuestions);
  const [postApprovalRequired, setPostApprovalRequired] = useState(Boolean(group.postApprovalRequired));
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const canEdit = Boolean(group.isAdmin);

  const resetToGroup = () => {
    setName(group.name);
    setDescription(group.description || '');
    setPrivacy(group.privacy);
    setRules(group.rules || '');
    setQuestions(group.membershipQuestions);
    setPostApprovalRequired(Boolean(group.postApprovalRequired));
  };

  // Nhóm được làm mới từ nơi khác (vd. sau khi lưu): đồng bộ lại biểu mẫu
  useEffect(() => { resetToGroup(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [group]);

  const dirty = useMemo(() => (
    name.trim() !== group.name
    || description.trim() !== (group.description || '').trim()
    || privacy !== group.privacy
    || rules.trim() !== (group.rules || '').trim()
    || postApprovalRequired !== Boolean(group.postApprovalRequired)
    || JSON.stringify(cleanQuestions(questions)) !== JSON.stringify(group.membershipQuestions)
  ), [name, description, privacy, rules, postApprovalRequired, questions, group]);

  const errors = {
    name: !name.trim() ? 'Tên nhóm không được để trống.' : name.trim().length > LIMITS.name ? `Tên nhóm tối đa ${LIMITS.name} ký tự.` : '',
    description: description.length > LIMITS.description ? `Giới thiệu tối đa ${LIMITS.description} ký tự.` : '',
    rules: rules.length > LIMITS.rules ? `Nội quy tối đa ${LIMITS.rules} ký tự.` : '',
    questions: questions.some((q) => q.length > MAX_QUESTION_LENGTH) ? `Mỗi câu hỏi tối đa ${MAX_QUESTION_LENGTH} ký tự.` : '',
  };
  const hasError = Object.values(errors).some(Boolean);

  const save = async () => {
    if (!canEdit || saving || !dirty) return;
    if (hasError) {
      toast.showError(Object.values(errors).find(Boolean) || 'Thông tin chưa hợp lệ.');
      return;
    }
    try {
      setSaving(true);
      const updated = await groupService.updateGroup(group.id, {
        name: name.trim(),
        description: description.trim(),
        privacy,
        rules: rules.trim(),
        postApprovalRequired,
        membershipQuestions: cleanQuestions(questions),
      });
      onUpdated(updated);
      toast.showSuccess('Đã lưu cài đặt nhóm.');
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể lưu cài đặt nhóm.'));
    } finally {
      setSaving(false);
    }
  };

  const deleteGroup = async () => {
    try {
      setDeleting(true);
      await groupService.deleteGroup(group.id);
      toast.showSuccess('Đã xóa nhóm.');
      onDeleted();
    } catch (err) {
      toast.showError(getApiErrorMessage(err, 'Không thể xóa nhóm.'));
    } finally {
      setDeleting(false);
    }
  };

  if (!canEdit) {
    return (
      <TabCard className="mx-auto w-full max-w-[720px] p-6 text-center">
        <Lock className="mx-auto mb-2 h-8 w-8 text-amber-500" />
        <p className="font-bold text-gray-900 dark:text-[#e4e6eb]">Chỉ quản trị viên mới đổi được cài đặt nhóm</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Người kiểm duyệt có thể duyệt bài, duyệt thành viên và xử lý kháng nghị.</p>
      </TabCard>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-4 pb-40 md:pb-24">
      <TabCard className="p-4 sm:p-5">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-[#e4e6eb]">Cài đặt nhóm</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Thông tin, quyền riêng tư, câu hỏi tham gia và quy tắc của nhóm.</p>
      </TabCard>

      <Section title="Tên và mô tả">
        <label className="block text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
          <span className="flex items-center justify-between">Tên nhóm <Counter value={name} max={LIMITS.name} /></span>
          <input value={name} maxLength={LIMITS.name} onChange={(e) => setName(e.target.value)} className={inputClass} aria-invalid={Boolean(errors.name)} />
          {errors.name && <span className="mt-1 block text-xs font-normal text-red-500">{errors.name}</span>}
        </label>
        <label className="block text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
          <span className="flex items-center justify-between">Giới thiệu <Counter value={description} max={LIMITS.description} /></span>
          <textarea value={description} maxLength={LIMITS.description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Nhóm này nói về điều gì?" className={`${inputClass} resize-none`} />
        </label>
        <div className="flex items-start gap-2.5 rounded-xl bg-gray-50 p-3 text-sm text-gray-600 dark:bg-[#3a3b3c]/60 dark:text-[#b0b3b8]">
          <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
          <span>Muốn đổi ảnh bìa? Bấm nút <b>Đổi ảnh bìa</b> ở góc ảnh bìa ngay đầu trang nhóm.</span>
        </div>
      </Section>

      <Section title="Quyền riêng tư" hint="Ai có thể xem thành viên, bài viết và tham gia nhóm.">
        <div role="radiogroup" aria-label="Quyền riêng tư" className="grid gap-3 sm:grid-cols-2">
          {(['PUBLIC', 'PRIVATE'] as const).map((value) => {
            const selected = privacy === value;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                key={value}
                onClick={() => setPrivacy(value)}
                className={`flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition cursor-pointer ${
                  selected ? 'border-[#1877f2] bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 hover:border-gray-300 dark:border-[#393a3b] dark:hover:border-[#4e4f50]'
                }`}
              >
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${selected ? 'bg-[#1877f2] text-white' : 'bg-gray-100 text-gray-600 dark:bg-[#3a3b3c] dark:text-[#b0b3b8]'}`}>
                  {value === 'PUBLIC' ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">{value === 'PUBLIC' ? 'Công khai' : 'Riêng tư'}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-gray-600 dark:text-[#b0b3b8]">
                    {value === 'PUBLIC'
                      ? 'Bất kỳ ai cũng có thể thấy mọi người trong nhóm và những gì họ đăng, và tham gia ngay.'
                      : 'Chỉ thành viên mới thấy những người trong nhóm và những gì họ đăng. Người mới cần được duyệt.'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {privacy !== group.privacy && (
          <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <Eye className="mt-0.5 h-4 w-4 shrink-0" />
            {privacy === 'PUBLIC'
              ? 'Sau khi lưu, bài viết và danh sách thành viên sẽ hiển thị công khai với mọi người.'
              : 'Sau khi lưu, bài viết và danh sách thành viên chỉ còn hiển thị với thành viên của nhóm.'}
          </p>
        )}
      </Section>

      <Section title="Câu hỏi tham gia" hint={privacy === 'PRIVATE' ? 'Người xin vào nhóm phải trả lời trước khi gửi yêu cầu (tối đa 3 câu).' : 'Chỉ áp dụng cho nhóm riêng tư. Nhóm công khai cho phép tham gia ngay nên không hỏi.'}>
        <GroupQuestionsEditor questions={questions} onChange={setQuestions} disabled={privacy !== 'PRIVATE'} />
        {errors.questions && <p className="text-xs text-red-500">{errors.questions}</p>}
      </Section>

      <Section title="Duyệt bài viết">
        <label className="flex cursor-pointer items-start justify-between gap-4">
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-[#e4e6eb]"><ShieldCheck className="h-4 w-4 text-[#1877f2]" />Duyệt bài viết trước khi hiển thị</span>
            <span className="mt-1 block text-xs leading-relaxed text-gray-500 dark:text-[#b0b3b8]">Bài của thành viên sẽ chờ quản trị viên hoặc người kiểm duyệt duyệt. Bài của quản trị viên hiển thị ngay.</span>
          </span>
          <span className="relative mt-0.5 inline-flex shrink-0">
            <input type="checkbox" role="switch" checked={postApprovalRequired} onChange={(e) => setPostApprovalRequired(e.target.checked)} className="peer sr-only" />
            <span className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-[#1877f2] peer-focus-visible:ring-2 peer-focus-visible:ring-[#1877f2] dark:bg-[#4e4f50]" />
            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
          </span>
        </label>
      </Section>

      <Section title="Nội quy nhóm" hint="Hiển thị trong phần giới thiệu và khi có người xin vào nhóm.">
        <label className="block text-sm font-bold text-gray-900 dark:text-[#e4e6eb]">
          <span className="flex items-center justify-between">Nội quy <Counter value={rules} max={LIMITS.rules} /></span>
          <textarea value={rules} maxLength={LIMITS.rules} onChange={(e) => setRules(e.target.value)} rows={6} placeholder={'1. Tôn trọng mọi thành viên\n2. Không quảng cáo, không spam'} className={`${inputClass} resize-y`} />
        </label>
      </Section>

      <section className="rounded-2xl border border-red-200 bg-white p-4 shadow-sm sm:p-5 dark:border-red-900/50 dark:bg-[#242526]">
        <h3 className="flex items-center gap-2 text-base font-extrabold text-red-600"><AlertTriangle className="h-5 w-5" />Vùng nguy hiểm</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#b0b3b8]">Xóa nhóm sẽ gỡ nhóm cùng toàn bộ bài viết khỏi mọi thành viên. Không thể hoàn tác.</p>
        <button type="button" onClick={() => { setDeleteConfirmName(''); setShowDelete(true); }} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 cursor-pointer">
          <Trash2 className="h-4 w-4" />
          Xóa nhóm
        </button>
      </section>

      {/* Thanh lưu dính đáy khi có thay đổi */}
      {dirty && (
        <div className="fixed inset-x-0 bottom-14 md:bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur dark:border-[#393a3b] dark:bg-[#242526]/95">
          <div className="mx-auto flex max-w-[720px] items-center justify-end gap-3 sm:justify-between">
            <p className="hidden text-sm font-semibold sm:block text-gray-700 dark:text-[#e4e6eb]">Bạn có thay đổi chưa lưu</p>
            <div className="flex gap-2">
              <button type="button" disabled={saving} onClick={resetToGroup} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-gray-200 disabled:opacity-60 dark:bg-[#3a3b3c] dark:text-[#e4e6eb] dark:hover:bg-[#4e4f50] cursor-pointer">
                <Undo2 className="h-4 w-4" />
                Hủy thay đổi
              </button>
              <button type="button" disabled={saving || hasError} onClick={() => void save()} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-[#1877f2] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#166fe5] disabled:opacity-60 cursor-pointer">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-group-title" onClick={() => { if (!deleting) setShowDelete(false); }}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#242526]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30"><AlertTriangle className="h-6 w-6" /></div>
              <h3 id="delete-group-title" className="text-lg font-extrabold text-gray-900 dark:text-[#e4e6eb]">Xóa nhóm này?</h3>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-[#b0b3b8]">
              Nhóm <b className="text-gray-900 dark:text-[#e4e6eb]">{group.name}</b> và toàn bộ bài viết trong nhóm sẽ bị xóa. Để xác nhận, hãy nhập đúng tên nhóm bên dưới.
            </p>
            <input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder={group.name}
              aria-label="Nhập tên nhóm để xác nhận xóa"
              autoFocus
              className={inputClass}
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={deleting} onClick={() => setShowDelete(false)} className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 dark:text-[#e4e6eb] dark:hover:bg-[#3a3b3c] cursor-pointer">Hủy</button>
              <button
                type="button"
                disabled={deleting || deleteConfirmName.trim() !== group.name}
                onClick={() => void deleteGroup()}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Xóa nhóm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
