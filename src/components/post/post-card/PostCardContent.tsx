import React, { useRef, useEffect } from 'react';
import { Post } from '../../../types';

interface PostCardContentProps {
  post: Post;
  setShowCommentModal: (val: boolean) => void;
}

export const isVideo = (url: string) => {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) !== null;
};

export const VideoPlayer: React.FC<{ src: string; className?: string }> = ({ src, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
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
      { threshold: 0.6 } // Play when 60% of the video is visible
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      loop
      muted
      playsInline
      className={className || "w-full max-h-[550px] object-contain bg-black"}
      onClick={(e) => e.stopPropagation()} // Prevent bubbling to parent click handlers
    />
  );
};

export const PostCardContent: React.FC<PostCardContentProps> = ({
  post,
  setShowCommentModal,
}) => {
  return (
    <>
      {/* Post Text Content */}
      {post.content && (
        <div className="px-4 pb-2.5 text-sm text-gray-900 dark:text-[#e4e6eb] leading-normal whitespace-pre-line">
          {post.content}
        </div>
      )}

      {/* Media Grid / Gallery */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="w-full bg-black/5 dark:bg-black/40 overflow-hidden">
          {post.mediaUrls.length === 1 ? (
            isVideo(post.mediaUrls[0]) ? (
              <VideoPlayer src={post.mediaUrls[0]} />
            ) : (
              <img
                src={post.mediaUrls[0]}
                alt="Post media"
                className="w-full max-h-[550px] object-cover hover:opacity-95 transition cursor-pointer"
                onClick={() => setShowCommentModal(true)}
              />
            )
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {post.mediaUrls.map((url, i) =>
                isVideo(url) ? (
                  <VideoPlayer key={i} src={url} className="w-full h-64 object-cover bg-black" />
                ) : (
                  <img
                    key={i}
                    src={url}
                    alt={`Media ${i}`}
                    className="w-full h-64 object-cover hover:opacity-95 transition cursor-pointer"
                    onClick={() => setShowCommentModal(true)}
                  />
                )
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};
