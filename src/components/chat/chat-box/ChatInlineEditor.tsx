import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Loader2 } from 'lucide-react';

interface ChatInlineEditorProps {
  initialContent: string;
  onSave: (newContent: string) => Promise<void>;
  onCancel: () => void;
}

export const ChatInlineEditor: React.FC<ChatInlineEditorProps> = ({
  initialContent,
  onSave,
  onCancel,
}) => {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.setSelectionRange(content.length, content.length);
  }, []);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || trimmed === initialContent.trim() || saving) {
      if (trimmed === initialContent.trim()) onCancel();
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-[280px] sm:max-w-[340px] my-1 p-2 rounded-2xl bg-white dark:bg-[#2b2d2f] border border-[#1877f2] shadow-md">
      <textarea
        ref={inputRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
        rows={2}
        className="w-full text-xs text-gray-900 dark:text-[#e4e6eb] bg-transparent resize-none border-0 outline-none leading-relaxed placeholder-gray-400"
        placeholder="Nhập nội dung mới..."
      />
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700/60 mt-1">
        <span className="text-[10px] text-gray-400">Esc để hủy · Enter để lưu</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#3a3b3c] transition cursor-pointer"
            title="Hủy chỉnh sửa"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || !content.trim()}
            className="p-1 rounded-full bg-[#1877f2] hover:bg-[#166fe5] text-white disabled:opacity-40 transition shadow-xs cursor-pointer"
            title="Lưu thay đổi"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
