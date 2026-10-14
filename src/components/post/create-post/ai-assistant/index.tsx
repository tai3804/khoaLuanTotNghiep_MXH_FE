import React from 'react';
import { Sparkles, Wand2, Hash, ShieldCheck, BarChart3, X } from 'lucide-react';
import { CreatePostAiAssistantProps, AiTab } from './types';
import { useCreatePostAi } from './useCreatePostAi';
import { AiCaptionTab } from './AiCaptionTab';
import { AiEnhanceTab } from './AiEnhanceTab';
import { AiHashtagsTab } from './AiHashtagsTab';
import { AiSafetyCheckTab } from './AiSafetyCheckTab';
import { AiPostAnalyzerTab } from './AiPostAnalyzerTab';

export const CreatePostAiAssistant: React.FC<CreatePostAiAssistantProps> = ({
  currentContent,
  onApplyContent,
  onClose,
}) => {
  const {
    tab,
    setTab,
    topic,
    setTopic,
    tone,
    setTone,
    suggestions,
    isSuggesting,
    handleSuggest,
    hashtags,
    isGeneratingHashtags,
    handleGenerateHashtags,
    style,
    setStyle,
    draftText,
    setDraftText,
    enhancedText,
    isEnhancing,
    handleEnhance,
    checkResult,
    isChecking,
    handleCheck,
    analysisResult,
    isAnalyzing,
    handleAnalyze,
    handleApply,
    handleAppendHashtags,
  } = useCreatePostAi({ currentContent, onApplyContent });

  const hasContent = Boolean(currentContent?.trim() || draftText?.trim());

  return (
    <div className="p-3 bg-gray-50 dark:bg-[#1e1f20] border border-gray-200 dark:border-[#393a3b] rounded-xl space-y-3">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
        <div className="flex space-x-2 text-xs font-semibold overflow-x-auto py-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => setTab('suggest')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${
              tab === 'suggest'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Viết Caption</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('enhance')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${
              tab === 'enhance'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Trau chuốt câu từ</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('hashtags')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${
              tab === 'hashtags'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Gợi ý Hashtag</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('analyze')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${
              tab === 'analyze'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Độ lan tỏa</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('check')}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${
              tab === 'check'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Kiểm tra an toàn</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer ml-2"
          title="Đóng trợ lý AI"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Panels with stable min-height to prevent jitter when switching tabs */}
      <div className="min-h-[220px] transition-all duration-200 ease-out flex flex-col justify-start">
        {tab === 'suggest' && (
          <div className="animate-in fade-in duration-150">
            <AiCaptionTab
              topic={topic}
              setTopic={setTopic}
              tone={tone}
              setTone={setTone}
              suggestions={suggestions}
              isSuggesting={isSuggesting}
              handleSuggest={handleSuggest}
              handleApply={handleApply}
            />
          </div>
        )}

        {tab === 'enhance' && (
          <div className="animate-in fade-in duration-150">
            <AiEnhanceTab
              draftText={draftText}
              setDraftText={setDraftText}
              style={style}
              setStyle={setStyle}
              enhancedText={enhancedText}
              isEnhancing={isEnhancing}
              handleEnhance={handleEnhance}
              handleApply={handleApply}
            />
          </div>
        )}

        {tab === 'hashtags' && (
          <div className="animate-in fade-in duration-150">
            <AiHashtagsTab
              draftText={draftText}
              setDraftText={setDraftText}
              hashtags={hashtags}
              isGeneratingHashtags={isGeneratingHashtags}
              handleGenerateHashtags={handleGenerateHashtags}
              handleAppendHashtags={handleAppendHashtags}
            />
          </div>
        )}

        {tab === 'analyze' && (
          <div className="animate-in fade-in duration-150">
            <AiPostAnalyzerTab
              analysisResult={analysisResult}
              isAnalyzing={isAnalyzing}
              handleAnalyze={handleAnalyze}
              hasContent={hasContent}
            />
          </div>
        )}

        {tab === 'check' && (
          <div className="animate-in fade-in duration-150">
            <AiSafetyCheckTab
              checkResult={checkResult}
              isChecking={isChecking}
              handleCheck={handleCheck}
              hasContent={hasContent}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePostAiAssistant;
