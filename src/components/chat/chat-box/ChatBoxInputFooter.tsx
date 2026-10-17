import React, { RefObject, useState } from 'react';
import { Image as ImageIcon, Paperclip, Loader2, Smile, Send, Mic, ThumbsUp, Plus, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { ChatVoiceRecorder } from './ChatVoiceRecorder';

interface ChatBoxInputFooterProps {
  inputText: string;
  setInputText: (text: string) => void;
  uploading: boolean;
  chatFileInputRef: RefObject<HTMLInputElement | null>;
  chatDocInputRef?: RefObject<HTMLInputElement | null>;
  onChatFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChatDocSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: React.FormEvent) => void;
  onSendVoice?: (audioBlob: Blob) => void;
  onQuickReaction?: () => void;
  quickEmoji?: string;
}

export const ChatBoxInputFooter: React.FC<ChatBoxInputFooterProps> = ({
  inputText,
  setInputText,
  uploading,
  chatFileInputRef,
  chatDocInputRef,
  onChatFileSelect,
  onChatDocSelect,
  onSend,
  onSendVoice,
  onQuickReaction,
  quickEmoji = '👍',
}) => {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [isRecording, setIsRecording] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  const hasText = inputText.trim().length > 0;

  if (isRecording && onSendVoice) {
    return (
      <ChatVoiceRecorder
        uploading={uploading}
        onSendVoice={onSendVoice}
        onCancel={() => setIsRecording(false)}
      />
    );
  }

  return (
    <form
      onSubmit={onSend}
      className="p-2 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#393a3b] flex items-center space-x-1 w-full min-w-0 box-border overflow-hidden"
    >
      {/* Hidden input for images & videos */}
      <input
        type="file"
        ref={chatFileInputRef}
        onChange={onChatFileSelect}
        accept="image/*,video/*"
        className="hidden"
      />

      {/* Hidden input for general documents (PDF, Word, Excel, ZIP, etc.) */}
      <input
        type="file"
        ref={chatDocInputRef}
        onChange={onChatDocSelect || onChatFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.tar,.gz,.csv,application/*,text/*"
        className="hidden"
      />

      {/* Left tools group: when typing text, optionally collapse extra tools into a "+" button like Messenger */}
      {hasText && !showMoreTools ? (
        <button
          type="button"
          onClick={() => setShowMoreTools(true)}
          className="shrink-0 p-1.5 text-[#1877f2] dark:text-[#4599ff] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer"
          title={isEn ? 'More actions' : 'Thêm tác vụ'}
        >
          <Plus className="w-4 h-4" />
        </button>
      ) : (
        <>
          {hasText && showMoreTools && (
            <button
              type="button"
              onClick={() => setShowMoreTools(false)}
              className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition cursor-pointer"
              title={isEn ? 'Collapse' : 'Thu gọn'}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Attach Image/Video button */}
          <button
            type="button"
            onClick={() => chatFileInputRef.current?.click()}
            disabled={uploading}
            className="shrink-0 p-1.5 text-gray-400 hover:text-[#1877f2] dark:hover:text-[#4599ff] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer disabled:opacity-50"
            title={t('chat.sendPhotoVideo', isEn ? 'Send photo/video' : 'Gửi hình ảnh/video')}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#1877f2]" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
          </button>

          {/* Attach Document button */}
          <button
            type="button"
            onClick={() => (chatDocInputRef?.current ? chatDocInputRef.current.click() : chatFileInputRef.current?.click())}
            disabled={uploading}
            className="shrink-0 p-1.5 text-gray-400 hover:text-[#1877f2] dark:hover:text-[#4599ff] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer disabled:opacity-50"
            title={t('chat.sendDocument', isEn ? 'Send document (PDF, Word, Excel, ZIP...)' : 'Gửi tập tin tài liệu (PDF, Word, Excel, ZIP...)')}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Record Voice button */}
          {onSendVoice && (
            <button
              type="button"
              onClick={() => setIsRecording(true)}
              disabled={uploading}
              className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full transition cursor-pointer disabled:opacity-50"
              title={isEn ? 'Record voice message' : 'Ghi âm tin nhắn thoại'}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </>
      )}

      {/* Main text input field - with min-w-0 to prevent flexbox overflow */}
      <div className="relative min-w-0 flex-1 flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('chat.typeMessage', isEn ? 'Type a message...' : 'Nhập tin nhắn...')}
          className="w-full min-w-0 bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] text-xs px-3 py-1.5 pr-7 rounded-full border border-transparent focus:outline-none focus:border-[#1877f2] placeholder-gray-400 dark:placeholder-[#b0b3b8] transition"
        />

        <button
          type="button"
          className="absolute right-1.5 p-1 text-gray-400 hover:text-[#f7b125] transition cursor-pointer"
          title={t('chat.emoji', isEn ? 'Emoji' : 'Biểu tượng cảm xúc')}
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Send button when text is present, or Quick Reaction (Like 👍) when empty like FB Messenger */}
      {hasText ? (
        <button
          type="submit"
          className="shrink-0 w-7 h-7 bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464d2] text-white rounded-full flex items-center justify-center transition shadow-xs cursor-pointer"
          title={t('chat.send', isEn ? 'Send message' : 'Gửi tin nhắn')}
        >
          <Send className="w-3.5 h-3.5 ml-0.5" />
        </button>
      ) : onQuickReaction ? (
        <button
          type="button"
          onClick={onQuickReaction}
          className="shrink-0 w-7 h-7 text-[#1877f2] hover:text-[#166fe5] hover:bg-gray-100 dark:hover:bg-[#3a3b3c] rounded-full flex items-center justify-center transition cursor-pointer text-sm"
          title={isEn ? `Send ${quickEmoji}` : `Gửi biểu tượng ${quickEmoji}`}
        >
          {quickEmoji === '👍' ? (
            <ThumbsUp className="w-4 h-4 fill-current" />
          ) : (
            <span className="text-base leading-none">{quickEmoji}</span>
          )}
        </button>
      ) : (
        <button
          type="submit"
          disabled
          className="shrink-0 w-7 h-7 bg-[#1877f2] text-white rounded-full flex items-center justify-center opacity-40 cursor-not-allowed"
          title={t('chat.send', isEn ? 'Send message' : 'Gửi tin nhắn')}
        >
          <Send className="w-3.5 h-3.5 ml-0.5" />
        </button>
      )}
    </form>
  );
};
