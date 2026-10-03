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

export interface ChatResult {
  reply: string;
}

export const aiService = {
  /**
   * Đánh giá mức độ độc hại / chuẩn mực cộng đồng của nội dung bằng AI
   */
  evaluateContent: async (content: string): Promise<AiEvaluationResult | null> => {
    try {
      const response = await api.post('/ai/moderation/evaluate', { content });
      return response.data?.data || response.data || null;
    } catch (error) {
      console.warn('AI moderation evaluation failed or unavailable:', error);
      return null;
    }
  },

  /**
   * Tạo gợi ý caption bài viết theo chủ đề và giọng điệu
   */
  suggestCaption: async (topic: string, tone = 'tự nhiên, thân thiện'): Promise<string[]> => {
    try {
      const response = await api.post('/ai/assistant/suggest-caption', { topic, tone });
      const data: CaptionSuggestions = response.data?.data || response.data || {};
      return Array.isArray(data?.suggestions) ? data.suggestions : [];
    } catch (error) {
      console.warn('AI suggest caption failed:', error);
      return [];
    }
  },

  /**
   * Tinh chỉnh, sửa lỗi chính tả và nâng cấp văn phong bài viết
   */
  enhanceText: async (content: string, style = 'lịch sự, rõ ràng'): Promise<string> => {
    try {
      const response = await api.post('/ai/assistant/enhance', { content, style });
      const data: EnhancedTextResult = response.data?.data || response.data || {};
      return data?.enhanced || content;
    } catch (error) {
      console.warn('AI enhance text failed:', error);
      return content;
    }
  },

  /**
   * Tự động tạo và gợi ý hashtag viral, liên quan cho bài viết
   */
  suggestHashtags: async (content: string, count = 5): Promise<string[]> => {
    try {
      const response = await api.post('/ai/assistant/suggest-hashtags', { content, count });
      const data: HashtagSuggestions = response.data?.data || response.data || {};
      return Array.isArray(data?.hashtags) ? data.hashtags : [];
    } catch (error) {
      console.warn('AI suggest hashtags failed:', error);
      return ['#ChiaSe', '#KLTN', '#KetNoi', '#CongDong'];
    }
  },

  /**
   * Tóm tắt bài viết dài thành 1-2 câu ngắn gọn hoặc gạch đầu dòng
   */
  summarizePost: async (content: string, maxSentences = 2): Promise<string> => {
    try {
      const response = await api.post('/ai/assistant/summarize', { content, maxSentences });
      const data: SummarizeResult = response.data?.data || response.data || {};
      return data?.summary || content;
    } catch (error) {
      console.warn('AI summarize post failed:', error);
      return content;
    }
  },

  /**
   * Dịch nội dung bài viết sang ngôn ngữ chỉ định (mặc định: 'vi' hoặc 'en')
   */
  translatePost: async (content: string, targetLanguage = 'vi'): Promise<string> => {
    try {
      const response = await api.post('/ai/assistant/translate', { content, targetLanguage });
      const data: TranslateResult = response.data?.data || response.data || {};
      return data?.translated || content;
    } catch (error) {
      console.warn('AI translate post failed:', error);
      return content;
    }
  },

  /**
   * Gợi ý câu trả lời nhanh thông minh dựa vào ngữ cảnh bài viết / bình luận
   */
  suggestReplies: async (postContent: string, commentContent?: string): Promise<string[]> => {
    try {
      const response = await api.post('/ai/assistant/suggest-replies', { postContent, commentContent });
      const data: SmartRepliesResult = response.data?.data || response.data || {};
      return Array.isArray(data?.replies) ? data.replies : [];
    } catch (error) {
      console.warn('AI suggest replies failed:', error);
      return ['Tuyệt vời quá! 🎉', 'Cảm ơn bạn đã chia sẻ ❤️', 'Bài viết rất hay! 👏'];
    }
  },

  /**
   * Trò chuyện, giải đáp thắc mắc và tư vấn ý tưởng với Trợ lý AI
   */
  chatWithAi: async (message: string): Promise<string> => {
    try {
      const response = await api.post('/ai/assistant/chat', { message });
      const data: ChatResult = response.data?.data || response.data || {};
      return data?.reply || 'Xin lỗi, hiện tại tôi chưa thể phản hồi. Vui lòng thử lại sau ít phút.';
    } catch (error) {
      console.warn('AI chat failed:', error);
      return 'Không thể kết nối với Trợ lý AI. Vui lòng thử lại sau.';
    }
  },
};
