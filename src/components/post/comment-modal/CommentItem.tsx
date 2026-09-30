import React, { useState } from 'react';
import { CornerDownRight, Pencil, Trash2 } from 'lucide-react';
import { Comment } from '../../../types';
import { UserAvatar } from '../../common/UserAvatar';

interface CommentItemProps {
  comment: Comment;
  user: any;
  replies: Comment[];
  language: string;
  t: (key: string) => string;
  onViewProfile?: (userId: string) => void;
  onClose: () => void;
  handleStartReply: (commentId: string, author: string) => void;
  onUpdate: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment: c,
  user,
  replies,
  language,
  t,
  onViewProfile,
  onClose,
  handleStartReply,
  onUpdate,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.content);
  const [saving, setSaving] = useState(false);
  const isOwner = Boolean(user && (String(c.userId) === String(user.id) || c.userId === 'me'));
  const saveEdit = async () => {
    if (!draft.trim() || saving) return;
    setSaving(true);
    try { await onUpdate(c.id, draft.trim()); setEditing(false); } finally { setSaving(false); }
  };
  const remove = async () => {
    if (window.confirm(language === 'en' ? 'Delete this comment?' : 'Xóa bình luận này?')) await onDelete(c.id);
  };
  const displayName =
    (c.userId === user?.id || c.userId === 'me') && user?.fullName
      ? user.fullName
      : c.authorName || 'Thành viên KLTN';
  const displayAvatar =
    (c.userId === user?.id || c.userId === 'me') && user?.avatar
      ? user.avatar
      : c.authorAvatar;

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      <div className="flex space-x-2.5 items-start group">
        <div
          onClick={() => {
            if (onViewProfile && c.userId) {
              onClose();
              onViewProfile(c.userId);
            }
          }}
          className="cursor-pointer shrink-0"
        >
          <UserAvatar src={displayAvatar} alt={displayName} size="sm" className="w-8.5 h-8.5 rounded-full" />
        </div>
        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-[#3a3b3c] p-3 rounded-2xl inline-block max-w-full">
            <h5
              onClick={() => {
                if (onViewProfile && c.userId) {
                  onClose();
                  onViewProfile(c.userId);
                }
              }}
              className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] cursor-pointer hover:underline"
            >
              {displayName}
            </h5>
            {editing ? (
              <div className="mt-1 flex gap-1">
                <input value={draft} onChange={(event) => setDraft(event.target.value)} className="min-w-48 rounded bg-white dark:bg-[#242526] px-2 py-1 text-xs text-gray-900 dark:text-white" autoFocus />
                <button type="button" onClick={saveEdit} disabled={saving} className="text-xs text-blue-600 font-bold">{language === 'en' ? 'Save' : 'Lưu'}</button>
                <button type="button" onClick={() => { setDraft(c.content); setEditing(false); }} className="text-xs">{language === 'en' ? 'Cancel' : 'Hủy'}</button>
              </div>
            ) : <p className="text-xs text-gray-800 dark:text-[#e4e6eb] mt-0.5 leading-relaxed break-words whitespace-pre-wrap">{c.content}</p>}
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-gray-500 dark:text-[#b0b3b8] mt-1 ml-2 font-semibold">
            <button className="hover:underline hover:text-[#2d88ff] cursor-pointer">{t('like') || 'Thích'}</button>
            <span>•</span>
            <button
              onClick={() => handleStartReply(c.id, displayName)}
              className="hover:underline hover:text-[#2d88ff] flex items-center space-x-1 cursor-pointer"
            >
              <CornerDownRight className="w-3 h-3" />
              <span>{language === 'en' ? 'Reply' : 'Phản hồi'}</span>
            </button>
            <span>•</span>
            <span>{c.createdAt}</span>
            {isOwner && <><span>•</span><button type="button" onClick={() => setEditing(true)} aria-label="Edit comment"><Pencil className="w-3 h-3" /></button><button type="button" onClick={remove} aria-label="Delete comment" className="text-red-500"><Trash2 className="w-3 h-3" /></button></>}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {replies.length > 0 && (
        <div className="ml-9 pl-3 border-l-2 border-gray-200 dark:border-[#393a3b] space-y-2.5 mt-2">
          {replies.map((reply) => {
            const rName =
              (reply.userId === user?.id || reply.userId === 'me') && user?.fullName
                ? user.fullName
                : reply.authorName || 'Thành viên KLTN';
            const rAvatar =
              (reply.userId === user?.id || reply.userId === 'me') && user?.avatar
                ? user.avatar
                : reply.authorAvatar;

            return (
              <div key={reply.id} className="flex space-x-2.5 items-start">
                <UserAvatar src={rAvatar} alt={rName} size="sm" className="w-7 h-7 rounded-full shrink-0" />
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-[#3a3b3c] p-2.5 rounded-2xl inline-block max-w-full">
                    <h6 className="font-bold text-xs text-gray-900 dark:text-[#e4e6eb] cursor-pointer hover:underline">
                      {rName}
                    </h6>
                    <p className="text-xs text-gray-800 dark:text-[#e4e6eb] mt-0.5 leading-relaxed break-words whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 text-[10px] text-gray-500 dark:text-[#b0b3b8] mt-0.5 ml-2 font-semibold">
                    <button className="hover:underline hover:text-[#2d88ff] cursor-pointer">{t('like') || 'Thích'}</button>
                    <span>•</span>
                    <button
                      onClick={() => handleStartReply(c.id, rName)}
                      className="hover:underline hover:text-[#2d88ff] cursor-pointer"
                    >
                      {language === 'en' ? 'Reply' : 'Phản hồi'}
                    </button>
                    <span>•</span>
                    <span>{reply.createdAt}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
