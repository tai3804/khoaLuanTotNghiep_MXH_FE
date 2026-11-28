import { api } from './axiosClient';

export interface AiEvaluationResult {
  isToxic: boolean;
  toxicityScore: number;
  category: string;
  severity: string;
  suggestedAction: string;
  reason: string;
  extractedKeywords: string[];
  isFallback: boolean;
}

export interface CaptionSuggestions {
  suggestions: string[];
}

export interface EnhancedTextResult {
  original: string;
  enhanced: string;
}

export interface HashtagSuggestions {
  hashtags: string[];
}

export interface SummarizeResult {
  original: string;
  summary: string;
}

export interface TranslateResult {
  original: string;
  translated: string;
  targetLanguage: string;
}

export interface SmartRepliesResult {
  replies: string[];
}

export interface ChatHistoryItem {
  sender: 'user' | 'ai' | 'assistant' | 'model';
  text: string;
}

export interface ChatMessageItemDto {
  senderName: string;
  text: string;
  time?: string;
  mediaUrl?: string;
}

export interface SummarizeMessagesRequest {
  conversationName?: string;
  isGroup?: boolean;
  messages: ChatMessageItemDto[];
}

export interface SummarizeMessagesResponse {
  summary: string;
  mediaDescription: string;
  actionItems: string[];
  messageCount: number;
  imageCount: number;
}

export interface ChatSource {
  postId: string;
  snippet: string;
}

export interface ChatResult {
  reply: string;
  /** Các bài viết trợ lý dùng làm tư liệu (RAG), theo thứ tự số nguồn [1], [2], ... trong câu trả lời. */
  sources?: ChatSource[];
}

export interface ChatAnswer {
  reply: string;
  sources: ChatSource[];
}

export interface BioSuggestionRequest {
  name?: string;
  major?: string;
  interests?: string;
  tone?: string;
}

export interface BioSuggestionResult {
  suggestions: string[];
}

export interface PostAnalysisResult {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | string;
  engagementScore: number;
  vibe: string;
  suggestions: string[];
}

const EMPTY_AI_RESULT = 'Máy chủ không trả về kết quả của AI.';
const requireText = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(EMPTY_AI_RESULT);
  return value;
};
const requireList = (value: unknown): string[] => {
  if (!Array.isArray(value) || value.length === 0) throw new Error(EMPTY_AI_RESULT);
  return value as string[];
};

export const aiService = {
  /**
   * Đánh giá mức độ độc hại / chuẩn mực cộng đồng của nội dung bằng AI
   */
  evaluateContent: async (content: string): Promise<AiEvaluationResult> => {
    const response = await api.post('/ai/moderation/evaluate', { content });
    const data: AiEvaluationResult | undefined = response.data?.data || response.data;
    if (!data) throw new Error(EMPTY_AI_RESULT);
    return data;
  },

  /**
   * Các hàm AI bên dưới KHÔNG có kết quả mặc định: máy chủ báo lỗi (ví dụ 400 khi không kết nối được Gemini)
   * hoặc trả về dữ liệu rỗng thì hàm ném lỗi để nơi gọi hiển thị thông báo (xem formatAiError trong utils/apiError).
   */

  /** Tạo gợi ý caption bài viết theo chủ đề và giọng điệu */
  suggestCaption: async (topic: string, tone = 'tự nhiên, thân thiện'): Promise<string[]> => {
    const response = await api.post('/ai/assistant/suggest-caption', { topic, tone });
    const data: CaptionSuggestions = response.data?.data || response.data || {};
    return requireList(data?.suggestions);
  },

  /** Tinh chỉnh, sửa lỗi chính tả và nâng cấp văn phong bài viết */
  enhanceText: async (content: string, style = 'lịch sự, rõ ràng'): Promise<string> => {
    const response = await api.post('/ai/assistant/enhance', { content, style });
    const data: EnhancedTextResult = response.data?.data || response.data || {};
    return requireText(data?.enhanced);
  },

  /** Tự động tạo và gợi ý hashtag liên quan cho bài viết */
  suggestHashtags: async (content: string, count = 5): Promise<string[]> => {
    const response = await api.post('/ai/assistant/suggest-hashtags', { content, count });
    const data: HashtagSuggestions = response.data?.data || response.data || {};
    return requireList(data?.hashtags);
  },

  /** Tóm tắt bài viết dài thành 1-2 câu ngắn gọn */
  summarizePost: async (content: string, maxSentences = 2): Promise<string> => {
    const response = await api.post('/ai/assistant/summarize', { content, maxSentences });
    const data: SummarizeResult = response.data?.data || response.data || {};
    return requireText(data?.summary);
  },

  /** Dịch nội dung bài viết sang ngôn ngữ chỉ định ('vi' hoặc 'en') */
  translatePost: async (content: string, targetLanguage = 'vi'): Promise<string> => {
    const response = await api.post('/ai/assistant/translate', { content, targetLanguage });
    const data: TranslateResult = response.data?.data || response.data || {};
    return requireText(data?.translated);
  },

  /** Gợi ý câu trả lời nhanh dựa vào ngữ cảnh bài viết / bình luận */
  suggestReplies: async (postContent: string, commentContent?: string): Promise<string[]> => {
    const response = await api.post('/ai/assistant/suggest-replies', { postContent, commentContent });
    const data: SmartRepliesResult = response.data?.data || response.data || {};
    return requireList(data?.replies);
  },

  /**
   * Trò chuyện đa lượt có nhớ ngữ cảnh với Trợ lý AI KLTN
   */
  chatWithAiAssistant: async (message: string, history?: any[]): Promise<string> => {
    const answer = await aiService.chatWithAiAssistantDetailed(message, history);
    return answer.reply;
  },

  /**
   * Như chatWithAiAssistant nhưng trả thêm danh sách bài viết được dùng làm tư liệu (RAG).
   */
  /**
   * Không có câu trả lời mặc định: khi máy chủ báo lỗi (ví dụ 400 vì không kết nối được Gemini)
   * hoặc không trả về nội dung, hàm ném lỗi để giao diện hiển thị đúng thông báo lỗi.
   */
  chatWithAiAssistantDetailed: async (message: string, history?: any[]): Promise<ChatAnswer> => {
    const formattedHistory: ChatHistoryItem[] = (history || []).map((item) => ({
      sender: (item.sender || (item.role === 'user' ? 'user' : 'ai')) as any,
      text: item.text || item.content || '',
    }));
    const response = await api.post('/ai/assistant/chat', { message, history: formattedHistory });
    const data: ChatResult = response.data?.data || response.data || {};
    if (!data?.reply || !String(data.reply).trim()) {
      throw new Error('Máy chủ không trả về câu trả lời của Trợ lý AI.');
    }
    return {
      reply: data.reply,
      sources: Array.isArray(data?.sources) ? data.sources : [],
    };
  },

  chatWithAi: async (message: string, history?: ChatHistoryItem[]): Promise<string> => {
    return aiService.chatWithAiAssistant(message, history);
  },

  /** Tóm tắt tin nhắn cuộc trò chuyện kèm phân tích hình ảnh (Multimodal AI) */
  summarizeMessages: async (request: SummarizeMessagesRequest): Promise<SummarizeMessagesResponse> => {
    const response = await api.post('/ai/assistant/summarize-messages', request);
    const data: SummarizeMessagesResponse | undefined = response.data?.data || response.data;
    if (!data?.summary || !String(data.summary).trim()) throw new Error(EMPTY_AI_RESULT);
    return data;
  },

  /** Gợi ý tiểu sử trang cá nhân (Profile Bio) bằng AI */
  suggestBio: async (request: BioSuggestionRequest): Promise<string[]> => {
    const response = await api.post('/ai/assistant/suggest-bio', request);
    const data: BioSuggestionResult = response.data?.data || response.data || {};
    return requireList(data?.suggestions);
  },

  /** Phân tích cảm xúc, độ lan tỏa và gợi ý tối ưu bài viết */
  analyzePost: async (content: string): Promise<PostAnalysisResult> => {
    const response = await api.post('/ai/assistant/analyze-post', { content });
    const data: PostAnalysisResult | undefined = response.data?.data || response.data;
    if (!data?.sentiment) throw new Error(EMPTY_AI_RESULT);
    return data;
  },
};
