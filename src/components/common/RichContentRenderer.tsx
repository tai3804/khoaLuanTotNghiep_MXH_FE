import React from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, authorProfileCache } from '../../services/userService';

interface RichContentRendererProps {
  content: string;
  onHashtagClick?: (hashtag: string) => void;
  onMentionClick?: (userId: string) => void;
  className?: string;
}

// Global cache for mapping names to userIds for rapid mention navigation
export const mentionNameToIdCache: Record<string, string> = {};

export const RichContentRenderer: React.FC<RichContentRendererProps> = ({
  content,
  onHashtagClick,
  onMentionClick,
  className = '',
}) => {
  const navigate = useNavigate();

  if (!content) return null;

  const handleMentionById = (userId: string) => {
    if (onMentionClick) {
      onMentionClick(userId);
    } else if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  const handleMentionByName = async (rawName: string) => {
    const cleanName = rawName.replace(/^@/, '').trim();
    if (!cleanName) return;

    const lowerName = cleanName.toLowerCase();
    let resolvedId: string | null = null;

    // 1. Check in-memory mention map
    if (mentionNameToIdCache[lowerName]) {
      resolvedId = mentionNameToIdCache[lowerName];
    }

    // 2. Check authorProfileCache
    if (!resolvedId) {
      try {
        const matchInAuthorCache = Object.entries(authorProfileCache).find(
          ([, p]) => p.name && p.name.trim().toLowerCase() === lowerName
        );
        if (matchInAuthorCache) {
          resolvedId = matchInAuthorCache[0];
          mentionNameToIdCache[lowerName] = resolvedId;
        }
      } catch {}
    }

    // 3. Search platform users for best match
    if (!resolvedId) {
      try {
        const searchRes = await userService.searchUsers(cleanName, 1, 5);
        if (Array.isArray(searchRes) && searchRes.length > 0) {
          const found =
            searchRes.find(
              (u: any) =>
                (u.fullName && u.fullName.trim().toLowerCase() === lowerName) ||
                (u.name && u.name.trim().toLowerCase() === lowerName)
            ) || searchRes[0];

          const targetId = found.userId || found.id || found.profileId;
          if (targetId) {
            resolvedId = String(targetId);
            mentionNameToIdCache[lowerName] = resolvedId;
          }
        }
      } catch {}
    }

    // 4. Pass resolved ID to onMentionClick or navigate to profile
    if (resolvedId) {
      handleMentionById(resolvedId);
    } else {
      // Fallback: search for that user by name
      navigate(`/search?q=${encodeURIComponent(cleanName)}`);
    }
  };

  const handleHashtag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (onHashtagClick) {
      onHashtagClick(cleanTag);
    } else {
      // Directly navigate to search page filtered by hashtag (No modal)
      navigate(`/search?q=${encodeURIComponent(cleanTag)}`);
    }
  };

  // Regex pattern matches:
  // 1. @[Display Name](uuid-or-id) -> legacy or rich markdown mention
  // 2. @[Display Name] -> bracketed clean mention
  // 3. #hashtag (Unicode letters, numbers, underscores)
  // 4. @UnicodeName (e.g. @Điềm, @john_doe, @User.Name)
  const tokenRegex = /(@\[[^\]]+\](?:\([a-zA-Z0-9_-]+\))?|#[\p{L}\p{N}_]+|@[\p{L}\p{N}_.-]+)/gu;

  const parts = content.split(tokenRegex);

  return (
    <span className={`break-words whitespace-pre-wrap ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Match @[Name](id)
        const legacyMatch = part.match(/^@\[([^\]]+)\]\(([a-zA-Z0-9_-]+)\)$/);
        if (legacyMatch) {
          const name = legacyMatch[1];
          const userId = legacyMatch[2];
          // Cache name -> userId
          mentionNameToIdCache[name.toLowerCase()] = userId;

          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleMentionById(userId);
              }}
              title={`Trang cá nhân của ${name}`}
              className="font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer inline transition"
            >
              @{name}
            </span>
          );
        }

        // Match @[Name] without UUID
        const bracketMatch = part.match(/^@\[([^\]]+)\]$/);
        if (bracketMatch) {
          const name = bracketMatch[1];
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                handleMentionByName(name);
              }}
              title={`Trang cá nhân của ${name}`}
              className="font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer inline transition"
            >
              @{name}
            </span>
          );
        }

        // Match #hashtag -> Click navigates to search
        if (part.startsWith('#') && part.length > 1) {
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleHashtag(part);
              }}
              title={`Tìm kiếm bài viết gắn thẻ ${part}`}
              className="font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer inline transition text-left"
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
              onClick={(e) => {
                e.stopPropagation();
                handleMentionByName(part.slice(1));
              }}
              title={`Trang cá nhân của ${part}`}
              className="font-semibold text-[#1877f2] dark:text-[#4599ff] hover:underline cursor-pointer inline transition"
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
