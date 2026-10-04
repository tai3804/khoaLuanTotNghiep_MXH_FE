import React from 'react';
import { BarChart3, TrendingUp, Sparkles, Smile, Lightbulb } from 'lucide-react';
import { UseCreatePostAiReturn } from './types';

type AiPostAnalyzerTabProps = Pick<
  UseCreatePostAiReturn,
  'analysisResult' | 'isAnalyzing' | 'handleAnalyze'
> & {
  hasContent: boolean;
};

export const AiPostAnalyzerTab: React.FC<AiPostAnalyzerTabProps> = ({
  analysisResult,
  isAnalyzing,
  handleAnalyze,
  hasContent,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg text-xs text-amber-900 dark:text-amber-200 space-y-1">
        <p className="font-semibold flex items-center space-x-1">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          <span>Tối ưu hóa lượt tương tác & cảm xúc bài viết:</span>
        </p>
        <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-normal">
          AI sẽ phân tích cảm xúc (sentiment), ước tính mức độ hấp dẫn (engagement score) và đưa ra các mẹo cụ thể để bài viết nhận được nhiều tương tác nhất.
        </p>
      </div>

      <button
        type="button"
        disabled={isAnalyzing || !hasContent}
        onClick={handleAnalyze}
        className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition disabled:opacity-60 cursor-pointer"
      >
        <BarChart3 className="w-3.5 h-3.5" />
        <span>{isAnalyzing ? 'AI đang phân tích độ lan tỏa...' : 'Phân tích tiềm năng tương tác bài viết'}</span>
      </button>

      {analysisResult && (
        <div className="p-3.5 bg-white dark:bg-[#2b2d2f] border border-gray-200 dark:border-gray-700 rounded-xl space-y-3 text-xs">
          {/* Header Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#343537] border border-gray-100 dark:border-gray-700 flex flex-col">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Điểm tương tác dự kiến
              </span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                  {analysisResult.engagementScore}/100
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold">
                  {analysisResult.engagementScore >= 80 ? 'Rất cao 🔥' : analysisResult.engagementScore >= 65 ? 'Khá tốt 👍' : 'Trung bình ⚡'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#343537] border border-gray-100 dark:border-gray-700 flex flex-col">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Cảm xúc chủ đạo
              </span>
              <div className="flex items-center space-x-1.5 mt-1">
                <Smile className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                  {analysisResult.sentiment === 'POSITIVE'
                    ? 'Tích cực'
                    : analysisResult.sentiment === 'NEGATIVE'
                    ? 'Trầm lắng'
                    : 'Trung tính'}
                </span>
              </div>
            </div>
          </div>

          {/* Vibe badge */}
          {analysisResult.vibe && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Vibe bài viết:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>{analysisResult.vibe}</span>
              </span>
            </div>
          )}

          {/* Suggestions List */}
          {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-1 text-[11px]">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Gợi ý để bài viết viral hơn:</span>
              </p>
              <ul className="space-y-1 pl-1">
                {analysisResult.suggestions.map((sug, i) => (
                  <li key={i} className="text-[11px] text-gray-600 dark:text-gray-400 flex items-start space-x-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
