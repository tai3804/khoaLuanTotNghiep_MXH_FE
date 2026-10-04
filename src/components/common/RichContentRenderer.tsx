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
  // 1. @[Display Name](uuid-or-id) -> legacy markdown mention
  // 2. @[Display Name] -> bracketed clean mention (for multi-word names)
  // 3. #hashtag (Unicode letters, numbers, underscores)
  // 4. @UnicodeName (e.g. @Điềm, @john_doe, @User.Name)
  const tokenRegex = /(@\[[^\]]+\](?:\([a-zA-Z0-9_-]+\))?|#[\p{L}\p{N}_]+|@[\p{L}\p{N}_.-]+)/gu;

  const parts = content.split(tokenRegex);

  return (
    <span className={`break-words whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Match legacy @[Name](id)
        const legacyMatch = part.match(/^@\[([^\]]+)\]\(([a-zA-Z0-9_-]+)\)$/);
        if (legacyMatch) {
          const name = legacyMatch[1];
          const userId = legacyMatch[2];
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

        // Match clean @[Name] without UUID
        const bracketMatch = part.match(/^@\[([^\]]+)\]$/);
        if (bracketMatch) {
          const name = bracketMatch[1];
          return (
            <span
              key={index}
              className="font-semibold text-[#1877f2] dark:text-[#4599ff] bg-blue-50/70 dark:bg-blue-950/40 px-1 py-0.5 rounded transition inline-block mx-0.5"
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

        // Match simple @mention (e.g., @Điềm)
        if (part.startsWith('@') && part.length > 1) {
          return (
            <span
              key={index}
              className="font-semibold text-[#1877f2] dark:text-[#4599ff] bg-blue-50/70 dark:bg-blue-950/40 px-1 py-0.5 rounded transition inline-block mx-0.5"
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
