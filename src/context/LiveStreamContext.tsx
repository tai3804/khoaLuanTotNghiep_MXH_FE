import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { Post } from '../types';
import { postService } from '../services/api';

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
}

export interface LiveReaction {
  id: string;
  emoji: string;
  x: number; // percentage horizontal offset (10-90%)
}

interface LiveStreamContextType {
  activeBroadcast: LiveBroadcastState;
  liveCommentsMap: Record<string, LiveComment[]>;
  liveReactionsMap: Record<string, LiveReaction[]>;
  endedStreamMap: Record<string, boolean>;
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
  sendLiveComment: (postId: string, content: string) => void;
  sendLiveReaction: (postId: string, emoji: string) => void;
  isPostLive: (post: Post) => boolean;
}

const LiveStreamContext = createContext<LiveStreamContextType | undefined>(undefined);

export const LiveStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
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
    viewerCount: 1,
  });

  const [liveCommentsMap, setLiveCommentsMap] = useState<Record<string, LiveComment[]>>({});
  const [liveReactionsMap, setLiveReactionsMap] = useState<Record<string, LiveReaction[]>>({});
  const [endedStreamMap, setEndedStreamMap] = useState<Record<string, boolean>>({});

  const streamRef = useRef<MediaStream | null>(null);

  // Auto viewer count fluctuation simulation when broadcasting
  useEffect(() => {
    if (!activeBroadcast.isBroadcasting) return;

    const interval = setInterval(() => {
      setActiveBroadcast((prev) => {
        if (!prev.isBroadcasting) return prev;
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const nextCount = Math.max(1, prev.viewerCount + delta);
        return { ...prev, viewerCount: nextCount };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeBroadcast.isBroadcasting]);

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

      setActiveBroadcast({
        isBroadcasting: true,
        postId: createdPost.id,
        stream,
        title,
        description,
        startedAt: Date.now(),
        isCameraOn: true,
        isMicOn: true,
        viewerCount: Math.floor(Math.random() * 10) + 12,
      });

      // Seed initial welcoming message in live chat
      setLiveCommentsMap((prev) => ({
        ...prev,
        [createdPost.id]: [
          {
            id: 'init-1',
            authorName: 'Hệ thống',
            content: 'Buổi phát trực tiếp đã bắt đầu. Hãy gửi lời chào đến mọi người!',
            time: 'Vừa xong',
          },
        ],
      }));

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
      setEndedStreamMap((prev) => ({ ...prev, [pId]: true }));
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

    toast.showInfo('Đã kết thúc buổi phát trực tiếp!');
  }, [activeBroadcast.postId, toast]);

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
    (postId: string, content: string) => {
      if (!content.trim()) return;
      const newComment: LiveComment = {
        id: 'lc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        authorName: user?.fullName || user?.username || 'Bạn',
        authorAvatar: user?.avatar,
        content: content.trim(),
        time: 'Vừa xong',
      };

      setLiveCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []).slice(-20), newComment],
      }));
    },
    [user]
  );

  const sendLiveReaction = useCallback((postId: string, emoji: string) => {
    const newReaction: LiveReaction = {
      id: 'lr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      emoji,
      x: Math.floor(Math.random() * 60) + 20, // 20% to 80%
    };

    setLiveReactionsMap((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []).slice(-15), newReaction],
    }));

    // Auto remove reaction after 2.5s animation
    setTimeout(() => {
      setLiveReactionsMap((prev) => {
        const current = prev[postId] || [];
        return {
          ...prev,
          [postId]: current.filter((r) => r.id !== newReaction.id),
        };
      });
    }, 2500);
  }, []);

  const isPostLive = useCallback(
    (post: Post): boolean => {
      if (endedStreamMap[post.id]) return false;
      if (post.liveStatus === 'ENDED') return false;
      if (post.isLive || post.liveStatus === 'LIVE') return true;
      if (post.content && (post.content.includes('[ĐANG PHÁT TRỰC TIẾP]') || post.content.includes('🔴 [ĐANG PHÁT TRỰC TIẾP]'))) {
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
        startBroadcast,
        stopBroadcast,
        toggleCamera,
        toggleMic,
        sendLiveComment,
        sendLiveReaction,
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
