import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
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
  x: number; // horizontal percentage position (15% to 85%)
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
  incrementViewerCount: (postId: string) => void;
  decrementViewerCount: (postId: string) => void;
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

  const [liveCommentsMap, setLiveCommentsMap] = useState<Record<string, LiveComment[]>>({});
  const [liveReactionsMap, setLiveReactionsMap] = useState<Record<string, LiveReaction[]>>({});
  const [endedStreamMap, setEndedStreamMap] = useState<Record<string, boolean>>({});

  const streamRef = useRef<MediaStream | null>(null);

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
        viewerCount: 0,
      });

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
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setLiveCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []).slice(-30), newComment],
      }));
    },
    [user]
  );

  const sendLiveReaction = useCallback((postId: string, emoji: string) => {
    const newReaction: LiveReaction = {
      id: 'lr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      emoji,
      x: 20 + ((Date.now() % 60)), // clean deterministic spread from 20% to 80%
    };

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
  }, []);

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

  const isPostLive = useCallback(
    (post: Post): boolean => {
      if (endedStreamMap[post.id]) return false;
      if (post.liveStatus === 'ENDED') return false;
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
        startBroadcast,
        stopBroadcast,
        toggleCamera,
        toggleMic,
        sendLiveComment,
        sendLiveReaction,
        incrementViewerCount,
        decrementViewerCount,
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
