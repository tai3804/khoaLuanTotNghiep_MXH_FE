import { useState, useEffect, useRef, useCallback } from 'react';
import { userService } from '../../../services/userService';

export interface MentionCandidate {
  id: string;
  userId: string;
  name: string;
  fullName: string;
  avatar: string;
  avatarUrl?: string;
  mutualFriendsCount?: number;
}

interface UseMentionSuggestionsProps {
  text: string;
  cursorPosition: number | null;
  onMentionSelected: (candidate: MentionCandidate, mentionMarkdown: string) => void;
}

export const useMentionSuggestions = ({
  text,
  cursorPosition,
  onMentionSelected,
}: UseMentionSuggestionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<MentionCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const friendsCacheRef = useRef<MentionCandidate[] | null>(null);

  // Load friends once
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const friends = await userService.getFriends(0, 100);
        if (isMounted && Array.isArray(friends)) {
          friendsCacheRef.current = friends;
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Detect @ at cursor
  useEffect(() => {
    if (cursorPosition === null || cursorPosition < 1) {
      setIsOpen(false);
      return;
    }

    const textBeforeCursor = text.slice(0, cursorPosition);
    // Find the last '@' that is preceded by start of string or whitespace
    const atMatch = /(?:^|\s)@([^\s@]*)$/.exec(textBeforeCursor);

    if (!atMatch) {
      setIsOpen(false);
      return;
    }

    const matchedQuery = atMatch[1];
    // Start index of the @ symbol
    const atIndex = textBeforeCursor.lastIndexOf('@');
    setMentionStartIndex(atIndex);
    setQuery(matchedQuery);
    setIsOpen(true);
    setSelectedIndex(0);
  }, [text, cursorPosition]);

  // Filter candidates based on query
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const filterFriends = async () => {
      const q = query.trim().toLowerCase();
      let friendList = friendsCacheRef.current;

      if (!friendList) {
        setLoading(true);
        try {
          friendList = await userService.getFriends(0, 100);
          friendsCacheRef.current = friendList;
        } catch {
          friendList = [];
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      let matches = (friendList || []).filter((f) => {
        const name = (f.name || f.fullName || '').toLowerCase();
        return !q || name.includes(q);
      });

      // If no local friends match and query has at least 2 chars, try searchUsers API
      if (matches.length === 0 && q.length >= 2) {
        setLoading(true);
        try {
          const searchResults = await userService.searchUsers(q, 1, 10);
          if (isMounted && Array.isArray(searchResults)) {
            matches = searchResults.map((u: any) => ({
              id: String(u.userId || u.id),
              userId: String(u.userId || u.id),
              name: u.fullName || u.username || 'Người dùng',
              fullName: u.fullName || u.username || 'Người dùng',
              avatar: u.avatarUrl || u.avatar || '/default-avatar.png',
            }));
          }
        } catch {
          // ignore
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      if (isMounted) {
        setCandidates(matches.slice(0, 8));
        setSelectedIndex(0);
      }
    };

    filterFriends();
    return () => {
      isMounted = false;
    };
  }, [isOpen, query]);

  const selectCandidate = useCallback(
    (candidate: MentionCandidate) => {
      if (mentionStartIndex === null) return;
      const name = candidate.name || candidate.fullName || 'Người dùng';
      // Format clean mention without UUID. If multi-word, wrap in brackets @[Name], otherwise @Name
      const mentionText = name.includes(' ') ? `@[${name}] ` : `@${name} `;
      onMentionSelected(candidate, mentionText);
      setIsOpen(false);
      setQuery('');
      setMentionStartIndex(null);
    },
    [mentionStartIndex, onMentionSelected]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent): boolean => {
      if (!isOpen || candidates.length === 0) return false;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % candidates.length);
        return true;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
        return true;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        selectCandidate(candidates[selectedIndex]);
        return true;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return true;
      }
      return false;
    },
    [isOpen, candidates, selectedIndex, selectCandidate]
  );

  return {
    isOpen,
    loading,
    candidates,
    selectedIndex,
    setSelectedIndex,
    selectCandidate,
    handleKeyDown,
    close: () => setIsOpen(false),
  };
};
