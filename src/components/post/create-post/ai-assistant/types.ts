import { AiEvaluationResult, PostAnalysisResult } from '../../../../services/aiService';

export type AiTab = 'suggest' | 'enhance' | 'hashtags' | 'check' | 'analyze';

export interface CreatePostAiAssistantProps {
  currentContent: string;
  onApplyContent: (newContent: string) => void;
  onClose: () => void;
}

export interface UseCreatePostAiReturn {
  tab: AiTab;
  setTab: (tab: AiTab) => void;
  // Suggestion
  topic: string;
  setTopic: (topic: string) => void;
  tone: string;
  setTone: (tone: string) => void;
  suggestions: string[];
  isSuggesting: boolean;
  handleSuggest: () => Promise<void>;
  // Hashtags
  hashtags: string[];
  isGeneratingHashtags: boolean;
  handleGenerateHashtags: () => Promise<void>;
  // Enhance
  style: string;
  setStyle: (style: string) => void;
  draftText: string;
  setDraftText: (draft: string) => void;
  enhancedText: string;
  isEnhancing: boolean;
  handleEnhance: () => Promise<void>;
  // Check
  checkResult: AiEvaluationResult | null;
  isChecking: boolean;
  handleCheck: () => Promise<void>;
  // Analyze
  analysisResult: PostAnalysisResult | null;
  isAnalyzing: boolean;
  handleAnalyze: () => Promise<void>;
  // Apply helpers
  handleApply: (text: string) => void;
  handleAppendHashtags: (selectedTags?: string[]) => void;
}
