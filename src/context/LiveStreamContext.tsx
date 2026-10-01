import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Post } from '../types';
import { postService } from '../services/api';
import { callService } from '../services/callService';
import { liveStreamWebSocketService } from '../services/liveStreamWebSocket';

export interface LiveBroadcastState {
  isBroadcasting: boolean;
  postId: string | null;
  stream: MediaStream | null;
  title: string;
  description: string;
  startedAt: number | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  viewerCount: number;
}

export interface LiveComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  time: string;
  replyToAuthor?: string;
  replyToContent?: string;
}

export interface LiveReaction {
  id: string;
  emoji: string;
  x: number; // horizontal percentage position (15% to 85%)
}

const ENDED_STREAMS_STORAGE_KEY = 'kltn_ended_streams';

export const getStoredEndedStreamIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(ENDED_STREAMS_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch {}
  return new Set();
};

export const saveStoredEndedStreamId = (postId: string) => {
  if (!postId) return;
  try {
    const set = getStoredEndedStreamIds();
    set.add(postId);
    localStorage.setItem(ENDED_STREAMS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {}
};

interface LiveStreamContextType {
  activeBroadcast: LiveBroadcastState;
  liveCommentsMap: Record<string, LiveComment[]>;
  liveReactionsMap: Record<string, LiveReaction[]>;
  endedStreamMap: Record<string, boolean>;
  isStudioOpen: boolean;
  isStudioMinimized: boolean;
  setIsStudioOpen: (open: boolean) => void;
  setIsStudioMinimized: (minimized: boolean) => void;
  openStudio: () => void;
  closeStudio: () => void;
  toggleStudioMinimize: () => void;
  loadPostComments: (postId: string) => Promise<void>;
  startBroadcast: (
    title: string,
    description: string,
    stream: MediaStream,
    privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE',
    onPostCreated: (post: Post) => void
  ) => Promise<Post>;
  stopBroadcast: (postId?: string) => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  sendLiveComment: (
    postId: string,
    content: string,
    replyTo?: { authorName: string; content: string }
  ) => void;
  sendLiveReaction: (postId: string, emoji: string) => void;
  incrementViewerCount: (postId: string) => void;
  decrementViewerCount: (postId: string) => void;
  updateViewerCount: (postId: string, count: number) => void;
  isPostLive: (post: Post) => boolean;
}

const LiveStreamContext = createContext<LiveStreamContextType | undefined>(undefined);

export const LiveStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeBroadcast, setActiveBroadcast] = useState<LiveBroadcastState>({
    isBroadcasting: false,
    postId: null,
    stream: null,
    title: '',
    description: '',
    startedAt: null,
    isCameraOn: true,
    isMicOn: true,
    viewerCount: 0,
  });

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isStudioMinimized, setIsStudioMinimized] = useState(false);
  const [liveCommentsMap, setLiveCommentsMap] = useState<Record<string, LiveComment[]>>({});
  const [liveReactionsMap, setLiveReactionsMap] = useState<Record<string, LiveReaction[]>>({});
  const [endedStreamMap, setEndedStreamMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    getStoredEndedStreamIds().forEach((id) => {
      map[id] = true;
    });
    return map;
  });

  const streamRef = useRef<MediaStream | null>(null);

  const loadPostComments = useCallback(async (postId: string) => {
    if (!postId) return;
    try {
      const comments = await postService.getComments(postId);
      if (Array.isArray(comments) && comments.length > 0) {
        const liveComments: LiveComment[] = comments.map((c, i, arr) => {
          let replyToAuthor = (c as any).replyToAuthor;
          let replyToContent = (c as any).replyToContent;
          let cleanContent = (c.content || '').trim();

          const bracketMatch = cleanContent.match(/^@\[([^\]]+)\]\s*(.*)$/);
          const simpleMatch = cleanContent.match(/^@([^\s:]+)[:\s]\s*(.*)$/);

          if (bracketMatch) {
            replyToAuthor = bracketMatch[1];
            cleanContent = bracketMatch[2];
          } else if (simpleMatch) {
            replyToAuthor = simpleMatch[1];
            cleanContent = simpleMatch[2];
          }

          if (replyToAuthor && !replyToContent) {
            const prevItem = [...arr.slice(0, i)].reverse().find((item) => {
              const itemAuthor = (item.authorName || '').trim();
              return itemAuthor === replyToAuthor?.trim() || itemAuthor.includes(replyToAuthor!) || replyToAuthor!.includes(itemAuthor);
            });
            if (prevItem?.content) {
              replyToContent = prevItem.content.replace(/^@\[[^\]]+\]\s*/, '').replace(/^@[^\s:]+[:\s]\s*/, '').trim();
            }
          }
          return {
            id: String(c.id),
            authorName: c.authorName || 'Người dùng',
            authorAvatar: c.authorAvatar,
            content: cleanContent,
            time: c.createdAt || 'Vừa xong',
            replyToAuthor,
            replyToContent,
          };
        });

        setLiveCommentsMap((prev) => {
          const existing = prev[postId] || [];
          const merged: LiveComment[] = [...existing];

          liveComments.forEach((backendComment) => {
            const idx = merged.findIndex(
              (e) =>
                e.id === backendComment.id ||
                (e.id.startsWith('lc-') &&
                  e.authorName === backendComment.authorName &&
                  e.content.trim() === backendComment.content.trim())
            );
            if (idx >= 0) {
              // Preserve reply metadata from optimistic state or backend comment
              merged[idx] = {
                ...backendComment,
                replyToAuthor: merged[idx].replyToAuthor || backendComment.replyToAuthor,
                replyToContent: merged[idx].replyToContent || backendComment.replyToContent,
              };
            } else {
              merged.push(backendComment);
            }
          });

          return {
            ...prev,
            [postId]: merged.slice(-50),
          };
        });
      }
    } catch (err) {
      console.warn('[LiveStreamContext] loadPostComments warning:', err);
    }
  }, []);

  // Auto-subscribe to WebSocket room whenever an active broadcast exists
  useEffect(() => {
    if (activeBroadcast.isBroadcasting && activeBroadcast.postId) {
      const pId = activeBroadcast.postId;
      const unsub = liveStreamWebSocketService.subscribeRoom(pId);
      loadPostComments(pId);
      return () => {
        unsub();
      };
    }
  }, [activeBroadcast.isBroadcasting, activeBroadcast.postId, loadPostComments]);

  // Listen to incoming live comments and reactions from WebSocket & BroadcastChannel
  useEffect(() => {
    const markStreamEnded = (postId: string) => {
      if (!postId) return;
      saveStoredEndedStreamId(postId);
      setEndedStreamMap((prev) => {
        if (prev[postId]) return prev;
        return { ...prev, [postId]: true };
      });
    };

    const handleIncomingComment = (postId: string, rawComment: any) => {
      if (!postId || !rawComment) return;
      let comment: any = rawComment;
      if (typeof rawComment === 'string') {
        try {
          comment = JSON.parse(rawComment);
        } catch {
          comment = {
            id: 'lc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            authorName: 'Người xem',
            content: rawComment,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          };
        }
      }

      if (comment && typeof comment === 'object') {
        if (comment.payload && typeof comment.payload === 'object') {
          comment = { ...comment.payload, ...comment };
        }
        if (comment.comment && typeof comment.comment === 'object') {
          comment = { ...comment.comment, ...comment };
        }
      }

      let content = comment.content || (typeof comment === 'string' ? comment : '');
      if (!content || typeof content !== 'string') return;

      let replyToAuthor = comment.replyToAuthor;
      let replyToContent = comment.replyToContent;

      const bracketMatch = content.match(/^@\[([^\]]+)\]\s*(.*)$/);
      const simpleMatch = content.match(/^@([^\s:]+)[:\s]\s*(.*)$/);

      if (bracketMatch) {
        if (!replyToAuthor) replyToAuthor = bracketMatch[1];
        content = bracketMatch[2];
      } else if (simpleMatch) {
        if (!replyToAuthor) replyToAuthor = simpleMatch[1];
        content = simpleMatch[2];
      }

      setLiveCommentsMap((prev) => {
        const list = prev[postId] || [];
        if (replyToAuthor && !replyToContent) {
          const prevItem = [...list].reverse().find((item) => {
            const itemAuthor = (item.authorName || '').trim();
            return itemAuthor === replyToAuthor?.trim() || itemAuthor.includes(replyToAuthor!) || replyToAuthor!.includes(itemAuthor);
          });
          if (prevItem?.content) replyToContent = prevItem.content;
        }

        const validComment: LiveComment = {
          id: String(comment.id || ('lc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6))),
          authorName: String(comment.authorName || comment.author?.fullName || 'Người xem'),
          authorAvatar: comment.authorAvatar || comment.author?.avatarUrl,
          content: content.trim(),
          time: comment.time || comment.createdAt || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          replyToAuthor,
          replyToContent,
        };

        const existingIndex = list.findIndex(
          (c) =>
            c.id === validComment.id ||
            (c.authorName === validComment.authorName && c.content.trim() === validComment.content.trim())
        );

        if (existingIndex >= 0) {
          const updatedList = [...list];
          updatedList[existingIndex] = {
            ...updatedList[existingIndex],
            ...validComment,
            replyToAuthor: validComment.replyToAuthor || updatedList[existingIndex].replyToAuthor,
            replyToContent: validComment.replyToContent || updatedList[existingIndex].replyToContent,
          };
          return { ...prev, [postId]: updatedList };
        }

        return { ...prev, [postId]: [...list.slice(-30), validComment] };
      });
    };

    const handleIncomingReaction = (postId: string, rawReaction: any) => {
      if (!postId || !rawReaction) return;
      let reaction: any = rawReaction;
      if (typeof rawReaction === 'string') {
        try {
          reaction = JSON.parse(rawReaction);
        } catch {
          reaction = {
            id: 'lr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            emoji: rawReaction,
            x: 20 + (Date.now() % 60),
          };
        }
      }

      const emoji = reaction.emoji || (typeof reaction === 'string' ? reaction : '');
      if (!emoji || typeof emoji !== 'string') return;

      const validReaction: LiveReaction = {
        id: String(reaction.id || ('lr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6))),
        emoji,
        x: typeof reaction.x === 'number' ? reaction.x : 20 + (Date.now() % 60),
      };

      setLiveReactionsMap((prev) => {
        const list = prev[postId] || [];
        if (list.some((r) => r.id === validReaction.id)) return prev;
        return { ...prev, [postId]: [...list.slice(-15), validReaction] };
      });

      setTimeout(() => {
        setLiveReactionsMap((prev) => {
          const current = prev[postId] || [];
          return {
            ...prev,
            [postId]: current.filter((r) => r.id !== validReaction.id),
          };
        });
      }, 2400);
    };

    const handleBroadcastChannelMessage = (e: MessageEvent) => {
      const data = e.data;
      if (!data || !data.postId) return;

      if (data.type === 'END_CALL') {
        markStreamEnded(data.postId);
      }

      if (data.type === 'LIVE_COMMENT') {
        const commentData = data.payload || data.comment;
        if (commentData) {
          handleIncomingComment(data.postId, commentData);
        }
      }

      if (data.type === 'LIVE_REACTION') {
        const reactionData = data.payload || data.reaction;
        if (reactionData) {
          handleIncomingReaction(data.postId, reactionData);
        }
      }
    };

    // Listen to WebSocket cross-device chat/reaction event
    const handleWsChatEvent = (e: Event) => {
      const customEvent = e as CustomEvent<any>;
      const sig = customEvent.detail;
      if (!sig) return;
      const targetPostId = sig.postId || sig.callSessionId;
      if (!targetPostId) return;

      const signalType = sig.signalType || sig.type;

      if (signalType === 'END_CALL') {
        markStreamEnded(targetPostId);
      }

      if (signalType === 'LIVE_COMMENT') {
        const commentData = sig.payload || sig.comment;
        if (commentData) {
          handleIncomingComment(targetPostId, commentData);
        }
      }

      if (signalType === 'LIVE_REACTION') {
        const reactionData = sig.payload || sig.reaction;
        if (reactionData) {
          handleIncomingReaction(targetPostId, reactionData);
        }
      }

      if (signalType === 'VIEWER_COUNT') {
        const count = typeof sig.viewerCount === 'number' ? sig.viewerCount : (sig.payload?.count || sig.payload?.viewerCount);
        if (typeof count === 'number') {
          setActiveBroadcast((prev) => {
            if (prev.postId === targetPostId) {
              return { ...prev, viewerCount: count };
            }
            return prev;
          });
        }
      }
    };

    window.addEventListener('kltn_live_chat_event', handleWsChatEvent);

    return () => {
      window.removeEventListener('kltn_live_chat_event', handleWsChatEvent);
    };
  }, []);

  const startBroadcast = useCallback(
    async (
      title: string,
      description: string,
      stream: MediaStream,
      privacy: 'PUBLIC' | 'FRIENDS' | 'PRIVATE',
      onPostCreated: (post: Post) => void
    ): Promise<Post> => {
      streamRef.current = stream;

      const liveContent = `🔴 [ĐANG PHÁT TRỰC TIẾP] ${title}${description ? `\n\n${description}` : ''}`;
      
      let createdPost: Post;
      try {
        createdPost = await postService.createPost(liveContent, privacy, []);
      } catch (err) {
        console.warn('Backend createPost for live stream fallback to optimistic post:', err);
        createdPost = {
          id: 'live-' + Date.now(),
          userId: user?.id || 'me',
          authorName: user?.fullName || user?.username || 'Bạn',
          authorAvatar: user?.avatar || '',
          content: liveContent,
          mediaUrls: [],
          mediaList: [],
          createdAt: 'Vừa xong',
          likesCount: 0,
          commentsCount: 0,
          sharesCount: 0,
          isLiked: false,
          isLive: true,
          liveStatus: 'LIVE',
          privacy,
          comments: [],
        };
      }

      createdPost.isLive = true;
      createdPost.liveStatus = 'LIVE';

      // 1. Create Room Session on Backend Call Service
      try {
        await callService.initiateCall({
          channelType: 'GROUP',
          mediaType: 'VIDEO',
          conversationId: createdPost.id,
          targetUserIds: [],
        });
      } catch (err) {
        console.warn('[LiveStreamContext] Backend initiateCall notice:', err);
      }

      setActiveBroadcast({
        isBroadcasting: true,
        postId: createdPost.id,
        stream,
        title,
        description,
        startedAt: Date.now(),
        isCameraOn: true,
        isMicOn: true,
        viewerCount: 0,
      });

      // Automatically open dedicated Host Live Studio
      setIsStudioOpen(true);
      setIsStudioMinimized(false);

      onPostCreated(createdPost);
      return createdPost;
    },
    [user]
  );

  const stopBroadcast = useCallback((targetPostId?: string) => {
    const pId = targetPostId || activeBroadcast.postId;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (pId) {
      saveStoredEndedStreamId(pId);
      setEndedStreamMap((prev) => ({ ...prev, [pId]: true }));

      // 1. Notify Backend to end call room session in database
      callService.endCallByPost(pId).catch((err) => {
        console.warn('[LiveStreamContext] Backend endCall notice:', err);
      });

      // 2. Persist ended status to post-service database so reload & other users see ended immediately
      try {
        const titleLine = (activeBroadcast.title || '').trim();
        const updatedContent = `⏹ [ĐÃ KẾT THÚC] ${titleLine}${activeBroadcast.description ? `\n\n${activeBroadcast.description}` : ''}`;
        postService.updatePost(pId, { content: updatedContent }).catch((err) => {
          console.warn('[LiveStreamContext] Backend updatePost on end notice:', err);
        });
      } catch (err) {
        console.warn('[LiveStreamContext] updatePost failed:', err);
      }

      // 3. Send END_CALL signal across WebSocket & BroadcastChannel so all active viewers end immediately
      try {
        liveStreamWebSocketService.sendSignal(pId, user?.id || 'host', null, 'END_CALL');
      } catch {}

      try {
        const ch = new BroadcastChannel(`kltn_live_channel_${pId}`);
        ch.postMessage({ type: 'END_CALL', postId: pId });
        setTimeout(() => ch.close(), 100);
      } catch {}
    }

    setActiveBroadcast({
      isBroadcasting: false,
      postId: null,
      stream: null,
      title: '',
      description: '',
      startedAt: null,
      isCameraOn: true,
      isMicOn: true,
      viewerCount: 0,
    });

    setIsStudioOpen(false);
    setIsStudioMinimized(false);

    toast.showInfo('Đã kết thúc buổi phát trực tiếp!');
  }, [activeBroadcast.postId, toast, user]);

  const openStudio = useCallback(() => {
    setIsStudioOpen(true);
    setIsStudioMinimized(false);
  }, []);

  const closeStudio = useCallback(() => {
    setIsStudioOpen(false);
  }, []);

  const toggleStudioMinimize = useCallback(() => {
    setIsStudioMinimized((prev) => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return;
    const videoTracks = streamRef.current.getVideoTracks();
    if (videoTracks.length > 0) {
      const nextState = !activeBroadcast.isCameraOn;
      videoTracks.forEach((track) => {
        track.enabled = nextState;
      });
      setActiveBroadcast((prev) => ({ ...prev, isCameraOn: nextState }));
    }
  }, [activeBroadcast.isCameraOn]);

  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;
    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length > 0) {
      const nextState = !activeBroadcast.isMicOn;
      audioTracks.forEach((track) => {
        track.enabled = nextState;
      });
      setActiveBroadcast((prev) => ({ ...prev, isMicOn: nextState }));
    }
  }, [activeBroadcast.isMicOn]);

  const sendLiveComment = useCallback(
    (postId: string, content: string, replyTo?: { authorName: string; content: string }) => {
      if (!content.trim()) return;
      const newComment: LiveComment = {
        id: 'lc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        authorName: user?.fullName || user?.username || 'Người xem',
        authorAvatar: user?.avatar,
        content: content.trim(),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        replyToAuthor: replyTo?.authorName,
        replyToContent: replyTo?.content,
      };

      // 1. Update local state immediately with deduplication check
      setLiveCommentsMap((prev) => {
        const list = prev[postId] || [];
        const isDuplicate = list.some(
          (c) => c.id === newComment.id || (c.authorName === newComment.authorName && c.content.trim() === newComment.content.trim())
        );
        if (isDuplicate) return prev;
        return {
          ...prev,
          [postId]: [...list.slice(-30), newComment],
        };
      });

      // 2. Broadcast to other browsers and devices via WebSocket
      try {
        liveStreamWebSocketService.sendSignal(
          postId,
          user?.id || 'viewer_' + Date.now(),
          null,
          'LIVE_COMMENT',
          { payload: newComment }
        );
      } catch (err) {
        console.warn('[LiveStreamContext] sendLiveComment WS error:', err);
      }

      // 3. Broadcast to same browser tabs via BroadcastChannel
      try {
        const ch = new BroadcastChannel(`kltn_live_channel_${postId}`);
        ch.postMessage({ type: 'LIVE_COMMENT', postId, comment: newComment, payload: newComment });
        setTimeout(() => ch.close(), 100);
      } catch {}

      // 4. Persist comment to backend post-service database
      const dbContent = replyTo?.authorName ? `@[${replyTo.authorName}] ${content.trim()}` : content.trim();
      postService.addComment(postId, dbContent).catch((err) => {
        console.warn('[LiveStreamContext] Background postService.addComment notice:', err);
      });
    },
    [user]
  );

  const sendLiveReaction = useCallback(
    (postId: string, emoji: string) => {
      const newReaction: LiveReaction = {
        id: 'lr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        emoji,
        x: 20 + (Date.now() % 60), // Clean deterministic horizontal spread from 20% to 80%
      };

      // 1. Update local state
      setLiveReactionsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []).slice(-15), newReaction],
      }));

      setTimeout(() => {
        setLiveReactionsMap((prev) => {
          const current = prev[postId] || [];
          return {
            ...prev,
            [postId]: current.filter((r) => r.id !== newReaction.id),
          };
        });
      }, 2400);

      // 2. Broadcast to other browsers and devices via WebSocket
      try {
        liveStreamWebSocketService.sendSignal(
          postId,
          user?.id || 'viewer_' + Date.now(),
          null,
          'LIVE_REACTION',
          { payload: newReaction }
        );
      } catch {}

      // 3. Broadcast to same browser tabs via BroadcastChannel
      try {
        const ch = new BroadcastChannel(`kltn_live_channel_${postId}`);
        ch.postMessage({ type: 'LIVE_REACTION', postId, reaction: newReaction });
        setTimeout(() => ch.close(), 100);
      } catch {}
    },
    [user]
  );

  const incrementViewerCount = useCallback((postId: string) => {
    setActiveBroadcast((prev) => {
      if (prev.postId === postId) {
        return { ...prev, viewerCount: prev.viewerCount + 1 };
      }
      return prev;
    });
  }, []);

  const decrementViewerCount = useCallback((postId: string) => {
    setActiveBroadcast((prev) => {
      if (prev.postId === postId) {
        return { ...prev, viewerCount: Math.max(0, prev.viewerCount - 1) };
      }
      return prev;
    });
  }, []);

  const updateViewerCount = useCallback((postId: string, count: number) => {
    setActiveBroadcast((prev) => {
      if (prev.postId === postId || !prev.postId) {
        return { ...prev, viewerCount: count };
      }
      return prev;
    });
  }, []);

  const isPostLive = useCallback(
    (post: Post): boolean => {
      if (!post || !post.id) return false;
      if (endedStreamMap[post.id] || getStoredEndedStreamIds().has(post.id)) return false;
      if (post.liveStatus === 'ENDED') return false;
      if (
        post.content &&
        (post.content.includes('[ĐÃ KẾT THÚC]') || post.content.includes('⏹ [ĐÃ KẾT THÚC]'))
      ) {
        return false;
      }
      if (post.isLive || post.liveStatus === 'LIVE') return true;
      if (
        post.content &&
        (post.content.includes('[ĐANG PHÁT TRỰC TIẾP]') || post.content.includes('🔴 [ĐANG PHÁT TRỰC TIẾP]'))
      ) {
        return true;
      }
      return false;
    },
    [endedStreamMap]
  );

  return (
    <LiveStreamContext.Provider
      value={{
        activeBroadcast,
        liveCommentsMap,
        liveReactionsMap,
        endedStreamMap,
        isStudioOpen,
        isStudioMinimized,
        setIsStudioOpen,
        setIsStudioMinimized,
        openStudio,
        closeStudio,
        toggleStudioMinimize,
        loadPostComments,
        startBroadcast,
        stopBroadcast,
        toggleCamera,
        toggleMic,
        sendLiveComment,
        sendLiveReaction,
        incrementViewerCount,
        decrementViewerCount,
        updateViewerCount,
        isPostLive,
      }}
    >
      {children}
    </LiveStreamContext.Provider>
  );
};

export const useLiveStream = (): LiveStreamContextType => {
  const context = useContext(LiveStreamContext);
  if (!context) {
    throw new Error('useLiveStream must be used within a LiveStreamProvider');
  }
  return context;
};

