import React, { useEffect, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Post } from '../../types';
import { useToast } from '../../context/ToastContext';
import { postService } from '../../services/postService';

interface Props { isOpen: boolean; post: Post; onClose: () => void; onUpdated: (post: Post) => void; }

const toInputValue = (value?: string) => {
  let parsed = value ? new Date(value) : null;
  if (value && (!parsed || Number.isNaN(parsed.getTime()))) {
    const vietnameseDate = value.match(/(\d{1,2})\s+Tháng\s+(\d{1,2}),?\s+(\d{4})/i);
    if (vietnameseDate) parsed = new Date(Number(vietnameseDate[3]), Number(vietnameseDate[2]) - 1, Number(vietnameseDate[1]));
  }
  // Feed cards format dates for display (for example "11 Tháng 9, 2021"),
  // which is not guaranteed to be parseable by Date across browsers.
  const date = parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export const EditPostDateModal: React.FC<Props> = ({ isOpen, post, onClose, onUpdated }) => {
  const toast = useToast();
  const [date, setDate] = useState(toInputValue(post.createdAt));
  const [saving, setSaving] = useState(false);
  useEffect(() => setDate(toInputValue(post.createdAt)), [post.createdAt, isOpen]);
  if (!isOpen) return null;
  const save = async () => {
    if (!date) return;
    setSaving(true);
    try {
      onUpdated(await postService.updatePostDate(post.id, new Date(date).toISOString()));
      toast.showSuccess('Đã cập nhật ngày bài viết.');
      onClose();
    } catch (error: any) {
      toast.showError(error?.response?.data?.message || 'Không thể cập nhật ngày bài viết.');
    } finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <button aria-label="Đóng" className="absolute inset-0 bg-black/60" onClick={onClose} />
    <section className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#242526]">
      <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2 font-bold dark:text-white"><Calendar className="w-5 h-5 text-blue-500" />Chỉnh sửa ngày</div><button onClick={onClose}><X className="w-5 h-5" /></button></div>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-300">Chọn ngày và giờ hiển thị cho bài viết của bạn.</p>
      <input type="datetime-local" value={date} max={toInputValue()} onChange={(event) => setDate(event.target.value)} className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-[#555] dark:bg-[#3a3b3c] dark:text-white" />
      <button disabled={saving || !date} onClick={save} className="mt-4 w-full rounded-xl bg-[#1877f2] py-2.5 font-bold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
    </section>
  </div>;
};
