import React, { useEffect, useRef, useState } from 'react';
import { X, Globe, Users, Lock, Smile, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Post } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { EditAudienceModal, PostPrivacy } from './EditAudienceModal';
import { postService } from '../../services/postService';
import { mediaService } from '../../services/mediaService';
import { useToast } from '../../context/ToastContext';

interface EditPostModalProps {
  isOpen: boolean;
  post: Post;
  authorName: string;
  authorAvatar: string;
  onClose: () => void;
  onPostUpdated: (updatedPost: Post) => void;
}

interface PendingMedia { file: File; previewUrl: string; }

const emojis = ['😀', '😂', '😍', '🥳', '😢', '😡', '👍', '❤️', '🎉', '🔥'];
const isVideo = (url: string) => /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

export const EditPostModal: React.FC<EditPostModalProps> = ({
  isOpen, post, authorName, authorAvatar, onClose, onPostUpdated,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingMediaRef = useRef<PendingMedia[]>([]);
  const [content, setContent] = useState(post.content || '');
  const [privacy, setPrivacy] = useState<PostPrivacy>((post.privacy as PostPrivacy) || 'PUBLIC');
  const [mediaUrls, setMediaUrls] = useState<string[]>(post.mediaUrls || []);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setContent(post.content || '');
    setPrivacy((post.privacy as PostPrivacy) || 'PUBLIC');
    setMediaUrls(post.mediaUrls || []);
    setPendingMedia((current) => {
      current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
      return [];
    });
    setShowEmojiPicker(false);
    setShowAudienceModal(false);
  }, [isOpen, post.id, post.content, post.privacy, post.mediaUrls]);

  useEffect(() => {
    pendingMediaRef.current = pendingMedia;
  }, [pendingMedia]);

  useEffect(() => () => {
    pendingMediaRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
  }, []);

  if (!isOpen) return null;

  const audience = privacy === 'FRIENDS'
    ? { label: 'Bạn bè', icon: <Users className="w-3.5 h-3.5" /> }
    : privacy === 'PRIVATE'
      ? { label: 'Chỉ mình tôi', icon: <Lock className="w-3.5 h-3.5" /> }
      : { label: 'Công khai', icon: <Globe className="w-3.5 h-3.5" /> };
  const totalMedia = mediaUrls.length + pendingMedia.length;

  const addFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    if (!files.length) return;
    setPendingMedia((current) => [...current, ...files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))]);
    event.target.value = '';
  };

  const removePending = (index: number) => setPendingMedia((current) => {
    const removed = current[index];
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    return current.filter((_, itemIndex) => itemIndex !== index);
  });

  const handleSave = async () => {
    if (!content.trim() && totalMedia === 0) {
      toast.showError('Bài viết không thể để trống nội dung hoặc ảnh/video.');
      return;
    }
    setSaving(true);
    try {
      const uploaded = pendingMedia.length
        ? await mediaService.uploadMultipleMedia(pendingMedia.map(({ file }) => file), 'posts')
        : [];
      const updated = await postService.updatePost(post.id, {
        content: content.trim(),
        privacy,
        mediaUrls: [...mediaUrls, ...uploaded.map((item) => item.fileUrl).filter(Boolean)],
      });
      toast.showSuccess('Đã cập nhật bài viết thành công.');
      onPostUpdated(updated);
      onClose();
    } catch (err: any) {
      console.error('Failed to update post:', err);
      toast.showError(`Không thể cập nhật bài viết: ${err.response?.data?.message || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm" onClick={() => !saving && onClose()} />
        <div className="relative bg-white dark:bg-[#242526] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-5 py-3.5 border-b border-gray-200 dark:border-[#393a3b] flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-[#e4e6eb] mx-auto">Chỉnh sửa bài viết</h3>
            <button type="button" onClick={onClose} disabled={saving} aria-label="Đóng" className="absolute right-4 p-1.5 rounded-full bg-gray-100 dark:bg-[#3a3b3c] text-gray-500"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            <div className="flex items-center space-x-3">
              <UserAvatar src={authorAvatar || post.authorAvatar} alt={authorName} size="md" className="w-11 h-11 rounded-full" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-[#e4e6eb]">{authorName || post.authorName}</h4>
                <button type="button" onClick={() => setShowAudienceModal(true)} className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-[#3a3b3c] hover:bg-gray-200 dark:hover:bg-[#4e4f50] text-gray-700 dark:text-[#e4e6eb] rounded-lg text-xs font-semibold">
                  {audience.icon}<span>{audience.label}</span><span className="text-[10px]">▼</span>
                </button>
              </div>
            </div>
            <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Bạn đang nghĩ gì thế?" rows={5} autoFocus className="w-full min-h-[120px] text-base sm:text-lg text-gray-900 dark:text-[#e4e6eb] bg-transparent border-none focus:outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed" />

            {totalMedia > 0 && <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-[#393a3b] max-h-64 overflow-y-auto bg-gray-50 dark:bg-black/20 p-1"><div className={`grid gap-1 ${totalMedia === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {mediaUrls.map((url, index) => <div key={`${url}-${index}`} className="relative rounded-lg overflow-hidden bg-black h-40">
                {isVideo(url) ? <video src={url} className="w-full h-full object-cover" /> : <img src={url} alt={`Tệp đính kèm ${index + 1}`} className="w-full h-full object-cover" />}
                <button type="button" onClick={() => setMediaUrls((current) => current.filter((_, i) => i !== index))} disabled={saving} aria-label="Xóa tệp" className="absolute top-2 right-2 p-1 rounded-full bg-black/65 text-white"><X className="w-4 h-4" /></button>
              </div>)}
              {pendingMedia.map(({ file, previewUrl }, index) => <div key={`${file.name}-${index}`} className="relative rounded-lg overflow-hidden bg-black h-40">
                {file.type.startsWith('video/') ? <video src={previewUrl} className="w-full h-full object-cover" /> : <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />}
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] rounded bg-blue-600 text-white">Mới</span>
                <button type="button" onClick={() => removePending(index)} disabled={saving} aria-label="Bỏ tệp mới" className="absolute top-2 right-2 p-1 rounded-full bg-black/65 text-white"><X className="w-4 h-4" /></button>
              </div>)}
            </div></div>}

            <div className="relative flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-[#393a3b] shadow-xs">
              <span className="text-xs font-bold text-gray-700 dark:text-[#e4e6eb]">Thêm vào bài viết của bạn</span>
              <div className="flex items-center space-x-1">
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple onChange={addFiles} className="hidden" />
                <button type="button" title="Thêm ảnh hoặc video" onClick={() => fileInputRef.current?.click()} disabled={saving} className="p-2 rounded-full text-emerald-500"><ImageIcon className="w-5 h-5" /></button>
                <button type="button" title="Chèn emoji" onClick={() => setShowEmojiPicker((value) => !value)} disabled={saving} className="p-2 rounded-full text-amber-500"><Smile className="w-5 h-5" /></button>
              </div>
              {showEmojiPicker && <div className="absolute right-3 bottom-12 z-10 grid grid-cols-5 gap-1 p-2 rounded-xl bg-white dark:bg-[#3a3b3c] shadow-xl border border-gray-200 dark:border-[#555]">
                {emojis.map((emoji) => <button key={emoji} type="button" onClick={() => { setContent((value) => `${value}${emoji}`); setShowEmojiPicker(false); }} className="p-1 text-xl hover:bg-gray-100 dark:hover:bg-[#4e4f50] rounded" aria-label={`Chèn ${emoji}`}>{emoji}</button>)}
              </div>}
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-[#393a3b] bg-gray-50 dark:bg-[#242526]">
            <button type="button" onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50">{saving && <Loader2 className="w-4 h-4 animate-spin" />}Lưu</button>
          </div>
        </div>
      </div>
      {showAudienceModal && <EditAudienceModal isOpen={showAudienceModal} currentPrivacy={privacy} onClose={() => setShowAudienceModal(false)} onSave={async (newPrivacy) => setPrivacy(newPrivacy)} showBackButton />}
    </>
  );
};
