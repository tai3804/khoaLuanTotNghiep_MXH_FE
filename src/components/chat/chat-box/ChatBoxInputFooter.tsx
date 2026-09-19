import React, { RefObject } from 'react';
import { Image as ImageIcon, Loader2, Smile, Send } from 'lucide-react';

interface ChatBoxInputFooterProps {
  inputText: string;
  setInputText: (text: string) => void;
  uploading: boolean;
  chatFileInputRef: RefObject<HTMLInputElement | null>;
  onChatFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSend: (e: React.FormEvent) => void;
}

export const ChatBoxInputFooter: React.FC<ChatBoxInputFooterProps> = ({
  inputText,
  setInputText,
  uploading,
  chatFileInputRef,
  onChatFileSelect,
  onSend,
}) => {
  return (
    <form onSubmit={onSend} className="p-2 bg-white dark:bg-[#242526] border-t border-gray-200 dark:border-[#393a3b] flex items-center space-x-1.5">
      <input
        type="file"
        ref={chatFileInputRef}
        onChange={onChatFileSelect}
        accept="image/*,video/*"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => chatFileInputRef.current?.click()}
        disabled={uploading}
        className="p-1.5 text-gray-400 hover:text-[#1877f2] dark:hover:text-[#4599ff] transition cursor-pointer disabled:opacity-50"
        title="Gửi ảnh/video đính kèm qua AWS S3"
      >
        {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#1877f2]" /> : <ImageIcon className="w-4 h-4" />}
      </button>
      <button type="button" className="p-1.5 text-gray-400 hover:text-[#f7b125] transition cursor-pointer">
        <Smile className="w-4 h-4" />
      </button>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Nhập tin nhắn..."
        className="flex-1 bg-gray-100 dark:bg-[#3a3b3c] text-gray-900 dark:text-[#e4e6eb] text-xs px-3 py-1.5 rounded-full border border-transparent focus:outline-none focus:border-[#1877f2] placeholder-gray-400 dark:placeholder-[#b0b3b8] transition"
      />
      <button
        type="submit"
        disabled={!inputText.trim()}
        className="p-1.5 bg-[#1877f2] hover:bg-[#166fe5] active:bg-[#1464d2] text-white rounded-full disabled:opacity-40 transition shadow-sm cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};
