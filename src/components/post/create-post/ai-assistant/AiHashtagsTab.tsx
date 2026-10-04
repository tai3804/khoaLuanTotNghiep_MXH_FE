import React, { useState } from 'react';
import { Hash, Plus, Copy, Check } from 'lucide-react';
import { UseCreatePostAiReturn } from './types';

type AiHashtagsTabProps = Pick<
  UseCreatePostAiReturn,
  'draftText' | 'setDraftText' | 'hashtags' | 'isGeneratingHashtags' | 'handleGenerateHashtags' | 'handleAppendHashtags'
>;

export const AiHashtagsTab: React.FC<AiHashtagsTabProps> = ({
  draftText,
  setDraftText,
  hashtags,
  isGeneratingHashtags,
  handleGenerateHashtags,
  handleAppendHashtags,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    if (hashtags.length === 0) return;
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Nội dung hoặc chủ đề để gợi ý hashtag:
        </label>
        <textarea
          rows={2}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Nhập nội dung bài viết để AI trích xuất hashtag phù hợp..."
          className="w-full text-xs p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2b2d2f] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="button"
        disabled={isGeneratingHashtags || !draftText.trim()}
        onClick={handleGenerateHashtags}
        className="w-full py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition disabled:opacity-60 cursor-pointer"
      >
        <Hash className="w-3.5 h-3.5" />
        <span>{isGeneratingHashtags ? 'AI đang tìm kiếm hashtag viral...' : 'Tạo 6 Hashtag thịnh hành'}</span>
      </button>

      {hashtags.length > 0 && (
        <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-200">
              Gợi ý hashtag phù hợp:
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 hover:underline flex items-center space-x-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép tất cả'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleAppendHashtags()}
                className="px-2 py-0.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-bold flex items-center space-x-1 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Chèn vào bài</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {hashtags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAppendHashtags([tag])}
                className="px-2.5 py-1 bg-white dark:bg-[#2b2d2f] border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-full text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                title="Bấm để chèn hashtag này vào bài viết"
              >
                <span>{tag}</span>
                <Plus className="w-3 h-3 text-teal-500 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
