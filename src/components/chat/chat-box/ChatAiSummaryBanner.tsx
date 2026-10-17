import React, { useState } from 'react';
import { Sparkles, CheckSquare, Image as ImageIcon, Copy, Check, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';
import { SummarizeMessagesResponse } from '../../../services/aiService';
import { useLanguage } from '../../../context/LanguageContext';

interface ChatAiSummaryBannerProps {
  summaryData: SummarizeMessagesResponse | null;
  loading: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  isUnreadSummary?: boolean;
  unreadCount?: number;
}

export const ChatAiSummaryBanner: React.FC<ChatAiSummaryBannerProps> = ({
  summaryData,
  loading,
  onClose,
  onRefresh,
  isUnreadSummary,
  unreadCount,
}) => {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!loading && !summaryData) return null;

  const handleCopy = () => {
    if (!summaryData) return;
    const title = isUnreadSummary
      ? isEn ? '✨ [AI UNREAD MESSAGES SUMMARY]' : '✨ [TÓM TẮT TIN NHẮN CHƯA ĐỌC AI]'
      : isEn ? '✨ [AI CONVERSATION SUMMARY]' : '✨ [TÓM TẮT CUỘC TRÒ CHUYỆN AI]';
    const mediaLabel = isEn ? '🖼️ Media' : '🖼️ Phương tiện';
    const actionLabel = isEn ? '✅ Action Items' : '✅ Việc cần làm';
    const textToCopy = `${title}\n${summaryData.summary}\n\n${mediaLabel}: ${summaryData.mediaDescription}\n\n${actionLabel}:\n${summaryData.actionItems.map((item) => `- ${item}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-2.5 my-2 rounded-xl bg-gradient-to-r from-blue-50/95 via-indigo-50/95 to-purple-50/95 dark:from-[#1e2330] dark:via-[#212433] dark:to-[#251f33] border border-blue-200/80 dark:border-indigo-500/30 shadow-sm overflow-hidden text-xs transition-all duration-300">
      {/* Banner Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-white/70 dark:bg-black/20 border-b border-blue-100/60 dark:border-indigo-500/20">
        <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin-slow shrink-0" />
          <span className="truncate">
            {isUnreadSummary
              ? isEn ? 'AI Unread Summary' : 'AI Tóm tắt tin chưa đọc'
              : isEn ? 'AI Message Summary' : 'AI Tóm tắt tin nhắn'}
          </span>
          {summaryData && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isUnreadSummary
                  ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900/50'
                  : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
              }`}
            >
              {isUnreadSummary && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />}
              {summaryData.messageCount} {isEn ? 'messages' : 'tin'}{summaryData.imageCount > 0 ? ` • ${summaryData.imageCount} ${isEn ? 'photos' : 'ảnh'}` : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          {summaryData && (
            <button
              onClick={handleCopy}
              className="p-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition cursor-pointer"
              title={isEn ? 'Copy summary' : 'Sao chép tóm tắt'}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition cursor-pointer"
            title={isExpanded ? (isEn ? 'Collapse' : 'Thu gọn') : (isEn ? 'Expand' : 'Mở rộng')}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:text-red-500 transition cursor-pointer"
            title={isEn ? 'Close summary' : 'Đóng tóm tắt'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3 space-y-2.5">
          {loading ? (
            <div className="flex items-center justify-center py-4 space-x-2 text-indigo-600 dark:text-indigo-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="font-medium animate-pulse">
                {isEn ? 'AI is reading messages and analyzing attached photos...' : 'AI đang đọc tin nhắn và phân tích hình ảnh đính kèm...'}
              </span>
            </div>
          ) : summaryData ? (
            <>
              {/* Summary Paragraph */}
              <div className="text-gray-800 dark:text-gray-200 leading-relaxed font-normal">
                {summaryData.summary}
              </div>

              {/* Media Breakdown */}
              {summaryData.imageCount > 0 && (
                <div className="p-2 rounded-lg bg-white/80 dark:bg-white/5 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug">
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      {isEn ? `Image analysis (${summaryData.imageCount} photos): ` : `Phân tích hình ảnh (${summaryData.imageCount} ảnh): `}
                    </span>
                    {summaryData.mediaDescription}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {summaryData.actionItems && summaryData.actionItems.length > 0 && (
                <div className="p-2 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
                  <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300 mb-1 text-[11px]">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isEn ? 'Key Action Items / Highlights:' : 'Nội dung chính / Việc cần làm:'}</span>
                  </div>
                  <ul className="space-y-1 pl-4 list-disc text-[11px] text-gray-700 dark:text-gray-300">
                    {summaryData.actionItems.map((item, idx) => (
                      <li key={idx} className="leading-snug">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
