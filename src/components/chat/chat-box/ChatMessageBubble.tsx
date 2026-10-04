import React, { useState } from 'react';
import { MoreHorizontal, Undo2, Edit2, Trash2, Eye, Check, CheckCheck } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { Message } from './useChatBoxData';
import { ChatFileAttachment } from './ChatFileAttachment';
import { ChatInlineEditor } from './ChatInlineEditor';

interface ChatMessageBubbleProps {
  msg: Message;
  isMe: boolean;
  isGroup?: boolean;
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onRecall: (messageId: string) => Promise<void>;
  onDeleteForMe: (messageId: string) => Promise<void>;
}

const isMediaExtension = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url);
};

const isVideoExtension = (url: string) => {
  return /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(url);
};

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  msg,
  isMe,
  isGroup,
  onEdit,
  onRecall,
  onDeleteForMe,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isRecalled = Boolean(msg.deleted);
  const isUrl = msg.text.startsWith('http://') || msg.text.startsWith('https://');
  const mediaUrl = msg.mediaUrl || (isUrl ? msg.text : '');

  // Detect type accurately
  const isFile =
    msg.type === 'FILE' ||
    (isUrl && !isMediaExtension(msg.text) && !isVideoExtension(msg.text) && !imageError && /\.[a-z0-9]{2,5}(\?.*)?$/i.test(msg.text));
  const isVideo =
    msg.type === 'VIDEO' ||
    (isUrl && isVideoExtension(msg.text));
  const isImage =
    !isFile && !isVideo && (msg.type === 'IMAGE' || (isUrl && isMediaExtension(msg.text)));

  const handleSaveEdit = async (newContent: string) => {
    await onEdit(msg.id, newContent);
    setIsEditing(false);
  };

  const renderStatus = () => {
    if (!isMe) return null;
    switch (msg.status) {
      case 'SEEN':
        return (
          <span className="flex items-center text-[9px] text-[#1877f2] font-semibold gap-0.5">
            <CheckCheck className="w-3 h-3" /> Đã xem
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="flex items-center text-[9px] text-gray-400 gap-0.5">
            <CheckCheck className="w-3 h-3" /> Đã nhận
          </span>
        );
      case 'SENT':
        return (
          <span className="flex items-center text-[9px] text-gray-400 gap-0.5">
            <Check className="w-3 h-3" /> Đã gửi
          </span>
        );
      case 'SENDING':
        return <span className="text-[9px] text-gray-400">Đang gửi...</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative flex flex-col ${isMe ? 'items-end' : 'items-start'} my-0.5`}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Group Member Name */}
      {isGroup && !isMe && msg.senderName && (
        <span className="text-[10px] font-semibold text-gray-500 dark:text-[#b0b3b8] mb-0.5 ml-7 truncate max-w-[180px]">
          {msg.senderName}
        </span>
      )}

      <div className={`flex items-end gap-1.5 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {isGroup && !isMe && (
          <UserAvatar
            src={msg.senderAvatar}
            alt={msg.senderName || 'Thành viên'}
            size="sm"
            className="w-6 h-6 rounded-full shrink-0 mb-0.5"
          />
        )}

        {/* Bubble Content or Editor */}
        {isEditing ? (
          <ChatInlineEditor
            initialContent={msg.text}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        ) : isRecalled ? (
          /* Recalled Message State (Facebook Messenger Style) */
          <div className="flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs italic text-gray-400 dark:text-gray-500 bg-gray-100/70 dark:bg-[#2b2d2f]/50 border border-dashed border-gray-300 dark:border-gray-700 select-none">
            <Undo2 className="w-3.5 h-3.5 text-gray-400" />
            <span>Tin nhắn đã được thu hồi</span>
          </div>
        ) : isFile || (imageError && mediaUrl) ? (
          /* File Attachment (PDF, Word, Excel, ZIP, or fallback) */
          <ChatFileAttachment
            fileUrl={mediaUrl}
            fileName={msg.fileName || (!isUrl ? msg.text : undefined)}
            fileSize={msg.fileSize}
            isMe={isMe}
          />
        ) : isVideo ? (
          /* Video Player */
          <video
            src={mediaUrl}
            controls
            className="max-w-full max-h-52 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs my-0.5"
          />
        ) : isImage && !imageError ? (
          /* Image Preview */
          <div className="overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-700/70 shadow-xs max-w-full my-0.5 bg-black/5 dark:bg-white/5">
            <img
              src={mediaUrl}
              alt="Ảnh đính kèm"
              onError={() => setImageError(true)}
              className="max-w-full max-h-48 sm:max-h-52 object-contain rounded-2xl block cursor-pointer hover:opacity-95 transition"
              onClick={() => window.open(mediaUrl, '_blank')}
              title="Bấm để xem ảnh gốc"
            />
          </div>
        ) : (
          /* Standard Text Message */
          <div
            className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs break-words break-all ${
              isMe
                ? 'bg-[#1877f2] text-white rounded-br-none'
                : 'bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] rounded-bl-none'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Hover Action Menu Trigger (Only if not editing & not recalled) */}
        {!isEditing && !isRecalled && !msg.id.startsWith('msg-') && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity self-center">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
              title="Tùy chọn tin nhắn"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Action Popup Menu */}
            {showMenu && (
              <div
                className={`absolute z-30 bottom-full mb-1 ${
                  isMe ? 'right-0' : 'left-0'
                } w-44 bg-white dark:bg-[#242526] rounded-xl shadow-xl border border-gray-100 dark:border-[#3e4042] py-1 text-xs text-gray-700 dark:text-[#e4e6eb]`}
              >
                {/* Edit (only own text messages) */}
                {isMe && !isFile && !isVideo && !isImage && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition text-left cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Chỉnh sửa</span>
                  </button>
                )}

                {/* Recall for everyone (only sender) */}
                {isMe && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onRecall(msg.id);
                    }}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition text-left text-amber-600 dark:text-amber-400 cursor-pointer"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Thu hồi với mọi người</span>
                  </button>
                )}

                {/* Delete for me */}
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteForMe(msg.id);
                  }}
                  className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition text-left text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ở phía bạn</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timestamp, Edited Badge & Delivery Status */}
      <div
        className={`flex items-center gap-1.5 text-[9px] text-gray-400 dark:text-[#b0b3b8] mt-0.5 px-1 ${
          isMe ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <span>{msg.time}</span>
        {msg.edited && !isRecalled && (
          <span className="text-[9px] text-gray-400 font-normal italic">
            (Đã chỉnh sửa)
          </span>
        )}
        {renderStatus()}
      </div>
    </div>
  );
};
