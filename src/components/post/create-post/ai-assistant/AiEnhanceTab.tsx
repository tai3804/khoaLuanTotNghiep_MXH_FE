import React from 'react';
import { Wand2, Check } from 'lucide-react';
import { UseCreatePostAiReturn } from './types';

type AiEnhanceTabProps = Pick<
  UseCreatePostAiReturn,
  'draftText' | 'setDraftText' | 'style' | 'setStyle' | 'enhancedText' | 'isEnhancing' | 'handleEnhance' | 'handleApply'
>;

const STYLES = [
  'lịch sự, rõ ràng',
  'hào hứng, sôi nổi',
  'ngắn gọn, súc tích',
  'học thuật, chuyên nghiệp',
  'tâm sự, nhẹ nhàng',
];

export const AiEnhanceTab: React.FC<AiEnhanceTabProps> = ({
  draftText,
  setDraftText,
  style,
  setStyle,
  enhancedText,
  isEnhancing,
  handleEnhance,
  handleApply,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Nội dung cần trau chuốt / sửa lỗi chính tả:
        </label>
        <textarea
          rows={3}
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Dán hoặc nhập nội dung bài viết vào đây..."
          className="w-full text-xs p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2b2d2f] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Phong cách viết mong muốn:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStyle(st)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                style === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={isEnhancing || !draftText.trim()}
        onClick={handleEnhance}
        className="w-full py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition disabled:opacity-60 cursor-pointer"
      >
        <Wand2 className="w-3.5 h-3.5" />
        <span>{isEnhancing ? 'AI đang nâng cấp câu từ...' : 'Trau chuốt văn phong ngay'}</span>
      </button>

      {enhancedText && (
        <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center space-x-1">
              <Wand2 className="w-3.5 h-3.5" />
              <span>Bản sau khi nâng cấp:</span>
            </span>
            <button
              type="button"
              onClick={() => handleApply(enhancedText)}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold flex items-center space-x-1 shadow-sm transition cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Áp dụng</span>
            </button>
          </div>
          <p className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed bg-white dark:bg-[#2b2d2f] p-2.5 rounded border border-purple-100 dark:border-purple-900/50">
            {enhancedText}
          </p>
        </div>
      )}
    </div>
  );
};
