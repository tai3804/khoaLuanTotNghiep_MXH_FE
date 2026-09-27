import React, { useRef, useEffect, useState } from 'react';
import { Post } from '../../../types';
import { LiveStreamPlayer } from './LiveStreamPlayer';

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
  if (post.content && (post.content.includes('[ĐANG PHÁT TRỰC TIẾP]') || post.content.includes('🔴 [ĐANG PHÁT TRỰC TIẾP]'))) {
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
  const isLive = isLivePost(post);

  return (
    <>
      {/* Post Text Content */}
      {post.content && !isLive && (
        <div className="px-4 pb-2.5 text-sm text-gray-900 dark:text-[#e4e6eb] leading-normal whitespace-pre-line">
          {post.content}
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

