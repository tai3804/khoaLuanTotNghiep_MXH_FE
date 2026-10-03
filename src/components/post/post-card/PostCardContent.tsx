import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Languages, RotateCcw } from 'lucide-react';
import { Post } from '../../../types';
import { aiService } from '../../../services/aiService';
import { LiveStreamPlayer } from './live-stream';

interface PostCardContentProps {
  post: Post;
  setShowCommentModal: (val: boolean) => void;
}

export const isVideo = (url: string, mediaType?: string) => {
  if (mediaType && (mediaType.toUpperCase() === 'VIDEO' || mediaType.toLowerCase() === 'video')) return true;
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  if (url.match(/\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i) !== null) return true;
  if (url.includes('/video/') || url.includes('format=mp4') || url.includes('mediaType=VIDEO')) return true;
  return false;
};

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

export const VideoPlayer: React.FC<{ src: string; className?: string; autoPlayOnScroll?: boolean }> = ({
  src,
  className,
  autoPlayOnScroll = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!autoPlayOnScroll) return;
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);
    return () => {
      observer.unobserve(video);
    };
  }, [autoPlayOnScroll]);

  if (hasError) {
    return (
      <div className="w-full h-48 bg-gray-900 flex flex-col items-center justify-center text-gray-400 text-xs p-4 text-center">
        <span>Không thể phát video</span>
        <a href={src} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline mt-1 text-[11px]">
          Mở liên kết video
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        controls
        loop
        muted
        playsInline
        preload="metadata"
        onError={() => setHasError(true)}
        className={className || "w-full max-h-[550px] object-contain bg-black"}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export const PostCardContent: React.FC<PostCardContentProps> = ({
  post,
  setShowCommentModal,
}) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLang, setTargetLang] = useState<'vi' | 'en'>('vi');

  const handleSummarize = async () => {
    if (!post.content || isSummarizing) return;
    if (summary) {
      setSummary(null); // Toggle off
      return;
    }
    setIsSummarizing(true);
    try {
      const res = await aiService.summarizePost(post.content);
      setSummary(res);
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
      // If content seems Vietnamese, default translate to English, else Vietnamese
      const lang = /^[a-zA-Z0-9\s.,!?'"()-]+$/.test(post.content.slice(0, 100)) ? 'vi' : 'en';
      setTargetLang(lang);
      const res = await aiService.translatePost(post.content, lang);
      setTranslatedText(res);
    } finally {
      setIsTranslating(false);
    }
  };

  const renderContent = (content: string) => content.split(/(#[\p{L}\p{N}_]+|@[\p{L}\p{N}_.-]+)/gu).map((part, index) =>
    part.startsWith('#') ? <button key={index} type="button" className="text-[#1877f2] font-semibold hover:underline">{part}</button> :
    part.startsWith('@') ? <span key={index} className="text-[#1877f2] font-semibold">{part}</span> : part
  );
  const isLive = isLivePost(post);
  const displayContent = translatedText || post.content;

  return (
    <>
      {/* Post Text Content */}
      {post.content && !isLive && (
        <div className="px-4 pb-2.5 space-y-2">
          <div className="text-sm text-gray-900 dark:text-[#e4e6eb] leading-normal whitespace-pre-line">
            {renderContent(displayContent)}
          </div>

          {/* AI Action Chips */}
          <div className="flex items-center gap-2 pt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {post.content.length > 120 && (
              <button
                type="button"
                onClick={handleSummarize}
                disabled={isSummarizing}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-semibold transition cursor-pointer ${
                  summary
                    ? 'bg-blue-100 dark:bg-blue-900/40 text-[#1877f2] dark:text-blue-400'
                    : 'bg-gray-100 dark:bg-[#3a3b3c] hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300 hover:text-[#1877f2]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1877f2]" />
                <span>{isSummarizing ? 'Đang tóm tắt...' : summary ? 'Đóng tóm tắt' : 'Tóm tắt AI'}</span>
              </button>
            )}

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
          </div>

          {/* AI Summary Highlight Box */}
          {summary && (
            <div className="p-3 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-[#2d88ff]/10 dark:to-[#8b5cf6]/10 border border-blue-200/80 dark:border-blue-900/40 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between text-[#1877f2] dark:text-blue-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tóm tắt nhanh bởi AI:
                </span>
                <button
                  type="button"
                  onClick={() => setSummary(null)}
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

      {/* Live Stream Viewport */}
      {isLive ? (
        <div className="w-full">
          <LiveStreamPlayer post={post} setShowCommentModal={setShowCommentModal} />
        </div>
      ) : (
        /* Standard Media Grid / Gallery */
        post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="w-full bg-black/5 dark:bg-black/40 overflow-hidden">
            {post.mediaUrls.length === 1 ? (
              isVideo(post.mediaUrls[0], post.mediaList?.[0]?.mediaType) ? (
                <VideoPlayer src={post.mediaUrls[0]} />
              ) : (
                <img
                  src={post.mediaUrls[0]}
                  alt="Post media"
                  className="w-full max-h-[550px] object-cover hover:opacity-95 transition cursor-pointer"
                  onClick={() => setShowCommentModal(true)}
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              )
            ) : (
              <div className="grid grid-cols-2 gap-0.5">
                {post.mediaUrls.map((url, i) => {
                  const itemMediaType = post.mediaList?.[i]?.mediaType;
                  return isVideo(url, itemMediaType) ? (
                    <VideoPlayer key={i} src={url} className="w-full h-64 object-cover bg-black" />
                  ) : (
                    <img
                      key={i}
                      src={url}
                      alt={`Media ${i}`}
                      className="w-full h-64 object-cover hover:opacity-95 transition cursor-pointer"
                      onClick={() => setShowCommentModal(true)}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )
      )}
    </>
  );
};

