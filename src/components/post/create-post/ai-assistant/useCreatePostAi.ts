import { useState, useEffect } from 'react';
import { aiService, AiEvaluationResult, PostAnalysisResult } from '../../../../services/aiService';
import { AiTab, CreatePostAiAssistantProps, UseCreatePostAiReturn } from './types';

export const useCreatePostAi = ({
  currentContent,
  onApplyContent,
}: Pick<CreatePostAiAssistantProps, 'currentContent' | 'onApplyContent'>): UseCreatePostAiReturn => {
  const [tab, setTab] = useState<AiTab>('suggest');

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
  useEffect(() => {
    if (currentContent && !draftText) {
      setDraftText(currentContent);
    }
  }, [currentContent, draftText]);

  // Check state
  const [checkResult, setCheckResult] = useState<AiEvaluationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Analyze state
  const [analysisResult, setAnalysisResult] = useState<PostAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    const text = draftText.trim() || currentContent.trim() || topic.trim();
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
    const textToEnhance = draftText.trim() || currentContent.trim();
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
    if (!currentContent.trim() || isChecking) return;

    setIsChecking(true);
    try {
      const res = await aiService.evaluateContent(currentContent.trim());
      setCheckResult(res);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAnalyze = async () => {
    const textToAnalyze = draftText.trim() || currentContent.trim();
    if (!textToAnalyze || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const res = await aiService.analyzePost(textToAnalyze);
      setAnalysisResult(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = (text: string) => {
    onApplyContent(text);
  };

  const handleAppendHashtags = (selectedTags?: string[]) => {
    const tagsToAppend = selectedTags || hashtags;
    if (tagsToAppend.length === 0) return;
    const tagString = tagsToAppend.join(' ');
    const newText = currentContent ? `${currentContent.trim()} ${tagString}` : tagString;
    onApplyContent(newText);
  };

  return {
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
  };
};
