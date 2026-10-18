import React, { useLayoutEffect, useRef, useState, useMemo } from 'react';
import { Languages, RotateCcw } from 'lucide-react';
import { Post } from '../../../types';
import { aiService } from '../../../services/aiService';
import { LiveStreamPlayer } from './live-stream';
import { RichContentRenderer } from '../../common/RichContentRenderer';
import { useToast } from '../../../context/ToastContext';
import { useLanguage } from '../../../context/LanguageContext';
import { needsTranslation } from '../../../utils/languageDetect';
import { PostPollView } from '../PostPollView';
import { PostMediaGallery } from './PostMediaGallery';
import { isVideo, VideoPlayer } from './postMedia';

// isVideo/VideoPlayer vốn nằm ở file này; giữ đường dẫn import cũ cho comment-modal, ShareModal, post-card
export { isVideo, VideoPlayer };

// Chỉ bài viết dài hơn ngưỡng này mới có tóm tắt AI (khớp ai.summary.min-length ở ai-service)
const SUMMARY_MIN_LENGTH = 1000;

interface PostCardContentProps {
  post: Post;
  setShowCommentModal: (val: boolean) => void;
}

export const isLivePost = (post: Post) => {
  if (post.isLive || post.liveStatus === 'LIVE' || post.liveStatus === 'ENDED') return true;
  if (
    post.content &&
    (post.content.includes('[ĐANG PHÁT TRỰC TIẾP]') ||
      post.content.includes('🔴 [ĐANG PHÁT TRỰC TIẾP]') ||
      post.content.includes('[ĐÃ KẾT THÚC]') ||
      post.content.includes('⏹ [ĐÃ KẾT THÚC]'))
  ) {
    return true;
  }
  return false;
};

export const PostCardContent: React.FC<PostCardContentProps> = ({
  post,
  setShowCommentModal,
}) => {
  const toast = useToast();
  // Bản tóm tắt tạo theo yêu cầu, chỉ dùng cho bài cũ chưa có bản tóm tắt lưu sẵn từ AI
  const [onDemandSummary, setOnDemandSummary] = useState<string | null>(null);
  // Mặc định thu gọn: chỉ hiện bản tóm tắt khi người xem bấm "Bản tóm tắt bằng AI"
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Dịch sang ngôn ngữ giao diện của người xem; chỉ hiện nút khi bài viết rõ ràng không cùng ngôn ngữ đó
  const viewerLang: 'vi' | 'en' = language === 'en' ? 'en' : 'vi';
  const canTranslate = useMemo(() => needsTranslation(post.content, viewerLang), [post.content, viewerLang]);

  const summary = post.summary || onDemandSummary;
  const isLongPost = (post.content?.trim().length ?? 0) > SUMMARY_MIN_LENGTH;

  const handleSummarize = async () => {
    if (!post.content || isSummarizing) return;
    if (summary) {
      setSummaryOpen((open) => !open); // Ẩn/hiện bản tóm tắt đã có, không gọi lại AI
      return;
    }
    setIsSummarizing(true);
    try {
      const res = await aiService.summarizePost(post.content);
      // aiService trả lại nguyên văn bài viết khi gọi lỗi, không coi đó là bản tóm tắt
      if (res && res.trim() && res.trim() !== post.content.trim()) {
        setOnDemandSummary(res);
        setSummaryOpen(true);
      } else {
        toast.showError('Không thể tóm tắt bài viết lúc này. Vui lòng thử lại sau.');
      }
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTranslate = async () => {
    if (!post.content || isTranslating) return;
    if (translatedText) {
      setTranslatedText(null); // Switch back to original
      return;
    }
    setIsTranslating(true);
    try {
      const res = await aiService.translatePost(post.content, viewerLang);
      // aiService trả lại nguyên văn bài viết khi gọi lỗi, không coi đó là bản dịch
      if (res && res.trim() && res.trim() !== post.content.trim()) {
        setTranslatedText(res);
      } else {
        toast.showError('Không thể dịch bài viết lúc này. Vui lòng thử lại sau.');
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const isLive = isLivePost(post);
  const displayContent = translatedText || post.content;

  // Bài dài chỉ hiện CLAMP_LINES dòng đầu kèm "Xem thêm" (giống Facebook); đo thật trên giao diện nên đúng với mọi độ rộng
  const textRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    const measure = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [displayContent, expanded]);

  return (
    <>
      {/* Post Text Content */}
      {post.content && !isLive && (
        <div className="px-4 pb-2.5 space-y-2">
          <div>
            <div
              ref={textRef}
              className={`text-sm text-gray-900 dark:text-[#e4e6eb] leading-normal whitespace-pre-line break-words ${
                expanded ? '' : 'line-clamp-8'
              }`}
            >
              <RichContentRenderer content={displayContent} />
            </div>
            {(overflowing || expanded) && (
              <button
                type="button"
                onClick={() => setExpanded((open) => !open)}
                className="mt-0.5 text-[13px] font-semibold text-gray-500 dark:text-[#b0b3b8] hover:underline cursor-pointer"
              >
                {expanded ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>

          {/* AI Action Chips */}
          {(isLongPost || canTranslate || translatedText) && (
          <div className="flex items-center gap-2 pt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {isLongPost && (
              <button
                type="button"
                onClick={handleSummarize}
                disabled={isSummarizing}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold transition cursor-pointer ${
                  summary && summaryOpen
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-[#1877f2] dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-[#3a3b3c] hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-[#1877f2]'
                }`}
              >
                <span>{isSummarizing ? 'Đang tóm tắt...' : summary && summaryOpen ? 'Ẩn bản tóm tắt' : 'Bản tóm tắt bằng AI'}</span>
              </button>
            )}

            {(canTranslate || translatedText) && (
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold transition cursor-pointer ${
                translatedText
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-gray-100 dark:bg-[#3a3b3c] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 hover:text-emerald-600'
              }`}
            >
              {translatedText ? (
                <>
                  <RotateCcw className="w-3 h-3 text-emerald-600" />
                  <span>Xem bản gốc</span>
                </>
              ) : (
                <>
                  <Languages className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isTranslating ? 'Đang dịch...' : 'Dịch bài viết'}</span>
                </>
              )}
            </button>
            )}
          </div>
          )}

          {/* AI Summary Highlight Box */}
          {isLongPost && summary && summaryOpen && (
            <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-[#2d88ff]/10 dark:to-[#8b5cf6]/10 border border-blue-200/80 dark:border-blue-900/40 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between text-[#1877f2] dark:text-blue-400 font-bold">
                <span>Bản tóm tắt bằng AI:</span>
                <button
                  type="button"
                  onClick={() => setSummaryOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-[11px]"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-800 dark:text-gray-200 leading-relaxed italic whitespace-pre-line">
                {summary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Interactive Poll Component */}
      {post.poll && (
        <div className="px-4 pb-2">
          <PostPollView
            postId={post.id}
            poll={post.poll}
            onPollUpdated={(updatedPoll) => {
              post.poll = updatedPoll;
            }}
          />
        </div>
      )}

      {/* Live Stream Viewport */}
      {isLive ? (
        <div className="w-full">
          <LiveStreamPlayer post={post} setShowCommentModal={setShowCommentModal} />
        </div>
      ) : (
        /* Ảnh/video của bài: lưới kiểu Facebook, giữ chỗ cố định, bấm mở trình xem ảnh */
        post.mediaUrls && post.mediaUrls.length > 0 && (
          <PostMediaGallery urls={post.mediaUrls} mediaList={post.mediaList} />
        )
      )}
    </>
  );
};

