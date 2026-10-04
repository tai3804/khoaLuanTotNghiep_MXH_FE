import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { UseCreatePostAiReturn } from './types';

type AiCaptionTabProps = Pick<
  UseCreatePostAiReturn,
  'topic' | 'setTopic' | 'tone' | 'setTone' | 'suggestions' | 'isSuggesting' | 'handleSuggest' | 'handleApply'
>;

const TONES = [
  'tự nhiên, gần gũi',
  'hài hước, dí dỏm',
  'truyền cảm hứng, tích cực',
  'chuyên nghiệp, trang trọng',
  'ngắn gọn, ấn tượng',
];

export const AiCaptionTab: React.FC<AiCaptionTabProps> = ({
  topic,
  setTopic,
  tone,
  setTone,
  suggestions,
  isSuggesting,
  handleSuggest,
  handleApply,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Chủ đề hoặc ý tưởng bài viết:
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Ví dụ: Một ngày học tập hiệu quả, Hoàn thành đồ án tốt nghiệp..."
          className="w-full text-xs p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2b2d2f] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSuggest();
            }
          }}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Phong cách / Giọng điệu:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                tone === t
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={isSuggesting}
        onClick={handleSuggest}
        className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition disabled:opacity-60 cursor-pointer"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{isSuggesting ? 'AI đang tạo gợi ý...' : 'Tạo 3 gợi ý bài viết ngay'}</span>
      </button>

      {suggestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Chọn một gợi ý để áp dụng:
          </p>
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              className="p-2.5 bg-white dark:bg-[#2b2d2f] border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-800 dark:text-gray-200 flex items-start justify-between gap-2 hover:border-blue-300 dark:hover:border-blue-600 transition"
            >
              <p className="whitespace-pre-line leading-relaxed flex-1">{s}</p>
              <button
                type="button"
                onClick={() => handleApply(s)}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded text-[11px] font-bold shrink-0 flex items-center space-x-1 transition cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>Chọn</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
