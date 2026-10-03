import React, { useState } from 'react';
import { aiService, AiEvaluationResult } from '../../../services/aiService';

interface Props {
  currentContent: string;
  onApplyContent: (newContent: string) => void;
  onClose: () => void;
}

export const CreatePostAiAssistant: React.FC<Props> = ({
  currentContent,
  onApplyContent,
  onClose,
}) => {
  const [tab, setTab] = useState<'suggest' | 'enhance' | 'hashtags' | 'check'>('suggest');

  // Suggestion state
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('tự nhiên, gần gũi');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Hashtag state
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);

  // Enhance state
  const [style, setStyle] = useState('lịch sự, rõ ràng');
  const [draftText, setDraftText] = useState(currentContent || '');
  const [enhancedText, setEnhancedText] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Sync draftText if currentContent changes and draftText is empty
  React.useEffect(() => {
    if (currentContent && !draftText) {
      setDraftText(currentContent);
    }
  }, [currentContent]);

  // Check state
  const [checkResult, setCheckResult] = useState<AiEvaluationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleSuggest = async () => {
    const inputTopic = topic.trim() || currentContent.trim();
    if (!inputTopic || isSuggesting) return;

    setIsSuggesting(true);
    try {
      const items = await aiService.suggestCaption(inputTopic, tone);
      setSuggestions(items);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerateHashtags = async () => {
    const text = (draftText.trim() || currentContent.trim() || topic.trim());
    if (!text || isGeneratingHashtags) return;

    setIsGeneratingHashtags(true);
    try {
      const items = await aiService.suggestHashtags(text, 6);
      setHashtags(items);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const handleEnhance = async () => {
    const textToEnhance = (draftText.trim() || currentContent.trim());
    if (!textToEnhance || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const text = await aiService.enhanceText(textToEnhance, style);
      setEnhancedText(text);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleCheck = async () => {
    if (!currentContent.trim() || isChecking) return

    setIsChecking(true);
    try {
      const res = await aiService.evaluateContent(currentContent.trim());
      setCheckResult(res);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-3 bg-gray-50 dark:bg-[#1e1f20] border border-gray-200 dark:border-[#393a3b] rounded-xl space-y-3">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex space-x-3 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setTab('suggest')}
            className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'suggest'
                ? 'border-[#1877f2] text-[#1877f2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Gợi ý viết bài
          </button>
          <button
            type="button"
            onClick={() => setTab('hashtags')}
            className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'hashtags'
                ? 'border-[#1877f2] text-[#1877f2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Tạo Hashtags
          </button>
          <button
            type="button"
            onClick={() => setTab('enhance')}
            className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'enhance'
                ? 'border-[#1877f2] text-[#1877f2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Cải thiện văn phong
          </button>
          <button
            type="button"
            onClick={() => setTab('check')}
            className={`pb-1 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'check'
                ? 'border-[#1877f2] text-[#1877f2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Kiểm tra tiêu chuẩn
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 shrink-0 ml-2"
        >
          Đóng
        </button>
      </div>

      {/* Tab: Suggest */}
      {tab === 'suggest' && (
        <div className="space-y-2 text-xs">
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Chủ đề bạn muốn chia sẻ (hoặc dùng nội dung hiện tại)..."
              className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#242526] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#242526] text-gray-900 dark:text-white"
            >
              <option value="tự nhiên, gần gũi">Thân thiện</option>
              <option value="hài hước, vui tươi">Hài hước</option>
              <option value="chuyên nghiệp, sâu sắc">Chuyên nghiệp</option>
            </select>
            <button
              type="button"
              onClick={handleSuggest}
              disabled={isSuggesting || (!topic.trim() && !currentContent.trim())}
              className="px-3 py-1.5 font-medium text-white bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-50 rounded-lg transition"
            >
              {isSuggesting ? 'Đang tạo...' : 'Tạo gợi ý'}
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-white dark:bg-[#242526] rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center gap-2"
                >
                  <p className="text-gray-800 dark:text-gray-200 flex-1">{item}</p>
                  <button
                    type="button"
                    onClick={() => {
                      onApplyContent(item);
                      onClose();
                    }}
                    className="px-2 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Hashtags */}
      {tab === 'hashtags' && (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center gap-2">
            <span className="text-gray-600 dark:text-gray-400">
              Tự động phân tích bài viết và gợi ý các hashtag thịnh hành
            </span>
            <button
              type="button"
              onClick={handleGenerateHashtags}
              disabled={isGeneratingHashtags || (!draftText.trim() && !currentContent.trim() && !topic.trim())}
              className="px-3 py-1.5 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition shrink-0"
            >
              {isGeneratingHashtags ? 'Đang tạo...' : 'Gợi ý Hashtags'}
            </button>
          </div>

          {hashtags.length > 0 && (
            <div className="p-2.5 bg-white dark:bg-[#242526] rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const base = currentContent.trim();
                      const next = base ? `${base} ${tag}` : tag;
                      onApplyContent(next);
                    }}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#1877f2] dark:text-blue-400 font-semibold rounded-md border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
                    title="Nhấn để thêm hashtag này vào bài viết"
                  >
                    {tag} +
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-1 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => {
                    const tagStr = hashtags.join(' ');
                    const base = currentContent.trim();
                    const next = base ? `${base}\n\n${tagStr}` : tagStr;
                    onApplyContent(next);
                    onClose();
                  }}
                  className="px-3 py-1 text-xs font-semibold text-white bg-[#1877f2] hover:bg-[#166fe5] rounded transition cursor-pointer"
                >
                  Thêm tất cả hashtag vào bài
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Enhance */}
      {tab === 'enhance' && (
        <div className="space-y-2.5 text-xs">
          <div>
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Nhập hoặc dán nội dung bạn muốn cải thiện văn phong..."
              rows={2}
              className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#242526] text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 dark:text-gray-400">Phong cách:</span>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#242526] text-gray-900 dark:text-white"
              >
                <option value="lịch sự, rõ ràng">Lịch sự, mạch lạc</option>
                <option value="cuốn hút, giàu cảm xúc">Cuốn hút, hấp dẫn</option>
                <option value="hài hước, gần gũi">Hài hước, hóm hỉnh</option>
                <option value="chuyên nghiệp, sâu sắc">Chuyên nghiệp, sâu sắc</option>
                <option value="ngắn gọn, súc tích">Ngắn gọn, trọng tâm</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleEnhance}
              disabled={isEnhancing || (!draftText.trim() && !currentContent.trim())}
              className="px-3 py-1 font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition"
            >
              {isEnhancing ? 'Đang chỉnh sửa...' : 'Nâng cấp nội dung'}
            </button>
          </div>

          {!draftText.trim() && !currentContent.trim() && (
            <p className="text-gray-400 italic">Nhập văn bản vào ô trên hoặc khung bài viết để AI hỗ trợ trau chuốt.</p>
          )}

          {enhancedText && (
            <div className="p-2.5 bg-white dark:bg-[#242526] rounded-lg border border-indigo-200 dark:border-indigo-900/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Đề xuất nâng cấp bởi AI:</span>
                {enhancedText === (draftText.trim() || currentContent.trim()) && (
                  <span className="text-gray-400 text-[11px]">Nội dung đã chuẩn mực</span>
                )}
              </div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{enhancedText}</p>
              <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 dark:border-gray-700/50">
                <button
                  type="button"
                  onClick={() => {
                    onApplyContent(enhancedText);
                    onClose();
                  }}
                  className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition"
                >
                  Áp dụng vào bài viết
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Check Standards */}
      {tab === 'check' && (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">
              Kiểm tra trước khi đăng để tránh vi phạm tiêu chuẩn cộng đồng
            </span>
            <button
              type="button"
              onClick={handleCheck}
              disabled={isChecking || !currentContent.trim()}
              className="px-3 py-1 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
            >
              {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}
            </button>
          </div>

          {!currentContent.trim() && (
            <p className="text-gray-400 italic">Chưa có nội dung văn bản để kiểm tra.</p>
          )}

          {checkResult && (
            <div className={`p-2.5 rounded-lg border ${
              checkResult.isToxic
                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300'
            }`}>
              <div className="flex justify-between items-center font-semibold">
                <span>
                  {checkResult.isToxic ? 'Phát hiện nguy cơ vi phạm' : 'Nội dung đạt chuẩn'}
                </span>
                <span>Điểm vi phạm: {Math.round((checkResult.toxicityScore || 0) * 100)}%</span>
              </div>
              <p className="mt-1 text-[11px] opacity-90">{checkResult.reason}</p>
              {checkResult.extractedKeywords && checkResult.extractedKeywords.length > 0 && (
                <p className="mt-1 text-[11px] font-mono">
                  Từ cần lưu ý: {checkResult.extractedKeywords.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default CreatePostAiAssistant;
