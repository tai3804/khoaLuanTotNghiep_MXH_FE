import React, { useState } from 'react';
import { MoreHorizontal, Undo2, Edit2, Trash2, Check, CheckCheck } from 'lucide-react';
import { UserAvatar } from '../../common/UserAvatar';
import { Message } from './useChatBoxData';
import { ChatFileAttachment } from './ChatFileAttachment';
import { ChatInlineEditor } from './ChatInlineEditor';
import { ChatSharedPostCard } from './ChatSharedPostCard';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { mediaService } from '../../../services/mediaService';
import { useLanguage } from '../../../context/LanguageContext';
import { attachmentName, classifyAttachment } from './chatAttachment';

interface ChatMessageBubbleProps {
  msg: Message;
  isMe: boolean;
  isGroup?: boolean;
  isUnread?: boolean;
  onEdit: (messageId: string, newContent: string) => Promise<void>;
  onRecall: (messageId: string) => Promise<void>;
  onDeleteForMe: (messageId: string) => Promise<void>;
  onMediaLoad?: () => void;
}

/** Lớp phủ khi ảnh/video đang được tải lên và xử lý. */
const UploadOverlay: React.FC<{ progress: number; isEn: boolean }> = ({ progress, isEn }) => {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="absolute inset-0 rounded-2xl bg-black/35 flex flex-col items-center justify-center gap-1 text-white pointer-events-none">
      <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0.04, progress / 100))}
          className="transition-[stroke-dashoffset] duration-200"
        />
      </svg>
      <span className="text-[10px] font-semibold drop-shadow">
        {isEn ? 'Processing…' : 'Đang xử lý…'}
      </span>
    </div>
  );
};

const POST_URL_REGEX = /(?:https?:\/\/[^\s/]+)?\/posts?\/([a-zA-Z0-9_-]+)/;

const renderOnlyText = (text: string, isMe: boolean) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text ? text.split(urlRegex) : [];

  return (
    <div className="whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`underline font-medium break-all hover:opacity-80 transition ${
                isMe ? 'text-white' : 'text-[#1877f2] dark:text-[#4599ff]'
              }`}
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  msg,
  isMe,
  isGroup,
  isUnread: _isUnread,
  onEdit,
  onRecall,
  onDeleteForMe,
  onMediaLoad,
}) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isRecalled = Boolean(msg.deleted || (msg as any).isDeleted || (msg as any).type === 'MESSAGE_RECALLED');
  const rawText = msg.text || '';
  const isUrl = rawText.startsWith('http://') || rawText.startsWith('https://');
  const rawMediaUrl = msg.mediaUrl || (isUrl ? rawText : '');
  const mediaUrl = mediaService.getMediaUrl(rawMediaUrl);

  // Detect shared post link
  const postMatch = rawText ? rawText.match(POST_URL_REGEX) : null;
  const sharedPostId = postMatch ? postMatch[1] : null;
  const textWithoutPostUrl = postMatch ? rawText.replace(postMatch[0], '').trim() : rawText;
  const isSolelyPostUrl = Boolean(sharedPostId && !textWithoutPostUrl);

  // Phân loại theo loại tin nhắn từ server + phần mở rộng tên tệp (ảnh gửi qua nút đính kèm vẫn là ảnh)
  const kind = isRecalled ? null : classifyAttachment(msg);
  const isAudio = kind === 'audio';
  const isVideo = kind === 'video';
  const isImage = kind === 'image' && !imageError;
  const isFile = kind === 'file' || (kind === 'image' && imageError);
  const fileName = attachmentName(msg);
  // Đang tải lên: hiển thị ngay bản xem trước trên máy, kèm tiến độ "Đang xử lý"
  const displayUrl = msg.previewUrl || mediaUrl;
  const processing = msg.uploadProgress !== undefined;

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
            <CheckCheck className="w-3 h-3" /> {t('chat.seen', isEn ? 'Seen' : 'Đã xem')}
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="flex items-center text-[9px] text-gray-400 gap-0.5">
            <CheckCheck className="w-3 h-3" /> {t('chat.delivered', isEn ? 'Delivered' : 'Đã nhận')}
          </span>
        );
      case 'SENT':
        return (
          <span className="flex items-center text-[9px] text-gray-400 gap-0.5">
            <Check className="w-3 h-3" /> {t('chat.sent', isEn ? 'Sent' : 'Đã gửi')}
          </span>
        );
      case 'SENDING':
        return <span className="text-[9px] text-gray-400">{t('chat.sending', isEn ? 'Sending...' : 'Đang gửi...')}</span>;
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
            <span>{t('chat.messageRecalled', isEn ? 'Message has been recalled' : 'Tin nhắn đã được thu hồi')}</span>
          </div>
        ) : isAudio ? (
          /* Voice Audio Message Player */
          <VoiceMessagePlayer audioUrl={mediaUrl || msg.text} isMe={isMe} />
        ) : isImage ? (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-700/70 shadow-xs max-w-full my-0.5 bg-black/5 dark:bg-white/5">
            <img
              src={displayUrl}
              alt={fileName || (isEn ? 'Photo' : 'Ảnh')}
              onError={() => setImageError(true)}
              onLoad={onMediaLoad}
              className={`max-w-full max-h-48 sm:max-h-52 object-contain rounded-2xl block transition ${
                processing ? 'opacity-70' : 'cursor-pointer hover:opacity-95'
              }`}
              onClick={() => !processing && window.open(mediaUrl, '_blank')}
              title={processing ? undefined : isEn ? 'Click to view original image' : 'Bấm để xem ảnh gốc'}
            />
            {processing && <UploadOverlay progress={msg.uploadProgress!} isEn={isEn} />}
          </div>
        ) : isVideo ? (
          <div className="relative my-0.5">
            <video
              src={displayUrl}
              controls={!processing}
              muted={processing}
              onLoadedData={onMediaLoad}
              className="max-w-full max-h-52 rounded-2xl border border-gray-200 dark:border-[#393a3b] shadow-xs block"
            />
            {processing && <UploadOverlay progress={msg.uploadProgress!} isEn={isEn} />}
          </div>
        ) : isFile ? (
          <ChatFileAttachment
            fileUrl={mediaUrl}
            fileName={fileName}
            fileSize={msg.fileSize}
            isMe={isMe}
            progress={msg.uploadProgress}
          />
        ) : isSolelyPostUrl ? (
          /* Pure Shared Post (No outer speech bubble, direct rich card) */
          <ChatSharedPostCard postId={sharedPostId!} isMe={isMe} />
        ) : sharedPostId ? (
          /* Message with text + Shared Post Card attached */
          <div className={`flex flex-col gap-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
            <div
              className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs break-words break-all ${
                isMe
                  ? 'bg-[var(--chat-accent,#1877f2)] text-white rounded-br-none'
                  : 'bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] rounded-bl-none'
              }`}
            >
              {renderOnlyText(textWithoutPostUrl, isMe)}
            </div>
            <ChatSharedPostCard postId={sharedPostId} isMe={isMe} />
          </div>
        ) : (
          /* Standard Text Message */
          <div
            className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs break-words break-all ${
              isMe
                ? 'bg-[var(--chat-accent,#1877f2)] text-white rounded-br-none'
                : 'bg-white dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] border border-gray-200 dark:border-[#4e4f50] rounded-bl-none'
            }`}
          >
            {renderOnlyText(msg.text, isMe)}
          </div>
        )}

        {/* Hover Action Menu Trigger (Only if not editing & not recalled) */}
        {!isEditing && !isRecalled && !msg.id.startsWith('msg-') && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity self-center">
            <button
              type="button"
              onClick={() => setShowMenu((prev) => !prev)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
              title={t('chat.messageOptions', isEn ? 'Message options' : 'Tùy chọn tin nhắn')}
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
                {isMe && !isFile && !isVideo && !isImage && !isSolelyPostUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition text-left cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t('chat.edit', isEn ? 'Edit' : 'Chỉnh sửa')}</span>
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
                    <span>{t('chat.unsendForEveryone', isEn ? 'Unsend for everyone' : 'Thu hồi với mọi người')}</span>
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
                  <span>{t('chat.deleteForYou', isEn ? 'Delete for you' : 'Xóa ở phía bạn')}</span>
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
            {t('chat.edited', isEn ? '(Edited)' : '(Đã chỉnh sửa)')}
          </span>
        )}
        {renderStatus()}
      </div>
    </div>
  );
};
