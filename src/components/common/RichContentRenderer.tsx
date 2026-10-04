import React from 'react';
import { useNavigate } from 'react-router-dom';

interface RichContentRendererProps {
  content: string;
  onHashtagClick?: (hashtag: string) => void;
  onMentionClick?: (userId: string) => void;
  className?: string;
}

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({
  content,
  onHashtagClick,
  onMentionClick,
  className = '',
}) => {
  const navigate = useNavigate();

  if (!content) return null;

  const handleMention = (userId: string) => {
    if (onMentionClick) {
      onMentionClick(userId);
    } else if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (onHashtagClick) {
      onHashtagClick(cleanTag);
    } else {
      window.dispatchEvent(new CustomEvent('open_hashtag_feed', { detail: { hashtag: cleanTag } }));
    }
  };

  // Regex pattern matches:
  // 1. @[Display Name](uuid-or-id)
  // 2. #hashtag (Unicode letters, numbers, underscores)
  // 3. @[a-zA-Z0-9_.-]+ (simple mention)
  const tokenRegex = /(@\[[^\]]+\]\([a-zA-Z0-9_-]+\)|#[\p{L}\p{N}_]+|@[a-zA-Z0-9_.-]+)/gu;

  const parts = content.split(tokenRegex);

  return (
    <span className={`break-words whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Match @[Name](id)
        const markdownMentionMatch = part.match(/^@\[([^\]]+)\]\(([a-zA-Z0-9_-]+)\)$/);
        if (markdownMentionMatch) {
          const name = markdownMentionMatch[1];
          const userId = markdownMentionMatch[2];
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleMention(userId);
              }}
              title={`Trang cá nhân của ${name}`}
              className="font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer bg-blue-50/70 dark:bg-blue-950/40 px-1 py-0.5 rounded transition inline-block mx-0.5"
            >
              @{name}
            </span>
          );
        }

        // Match #hashtag
        if (part.startsWith('#') && part.length > 1) {
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleHashtag(part);
              }}
              title={`Xem bài viết gắn thẻ ${part}`}
              className="font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer inline-block mx-0.5 transition"
            >
              {part}
            </button>
          );
        }

        // Match simple @mention
        if (part.startsWith('@') && part.length > 1) {
          return (
            <span
              key={index}
              className="font-semibold text-[#1877f2] dark:text-[#4599ff] inline-block mx-0.5"
            >
              {part}
            </span>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
