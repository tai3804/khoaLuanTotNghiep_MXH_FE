import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { callService, CallSession, MediaType, WebRtcSignal } from '../services/callService';
import { callWebSocketService } from '../services/callWebSocket';
import { callAudio } from '../utils/callAudio';
import { userService } from '../services/userService';

export type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

export interface CallUserInfo {
  id: string;
  name: string;
  avatar: string;
}

export interface RemoteCallParticipant extends CallUserInfo {
  stream: MediaStream;
  videoMuted: boolean;
}

interface CallContextType {
  callState: CallState;
  callSession: CallSession | null;
  remoteUser: CallUserInfo | null;
  mediaType: MediaType;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteVideoMuted: boolean;
  remoteParticipants: Record<string, RemoteCallParticipant>;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  callDuration: number;
  isMinimized: boolean;
  isCallHistoryOpen: boolean;
  startCall: (targetUser: CallUserInfo, type: MediaType, conversationId?: string) => Promise<void>;
  startGroupCall: (groupName: string, memberIds: string[], type: MediaType, conversationId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  setIsMinimized: (val: boolean) => void;
  setIsCallHistoryOpen: (val: boolean) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [callState, setCallState] = useState<CallState>('idle');
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [remoteUser, setRemoteUser] = useState<CallUserInfo | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('VIDEO');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteVideoMuted, setRemoteVideoMuted] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState<Record<string, RemoteCallParticipant>>({});
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCallHistoryOpen, setIsCallHistoryOpen] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  // A group call is a small WebRTC mesh: one peer connection per member.
  // Keep the legacy primary reference for the existing single-video UI, but
  // never replace or close another member's connection when they answer.
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteAudioRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const originalCamTrackRef = useRef<MediaStreamTrack | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const durationTimerRef = useRef<any>(null);
  const timeoutTimerRef = useRef<any>(null);
  const callSessionRef = useRef<CallSession | null>(null);
  const remoteUserRef = useRef<CallUserInfo | null>(null);

  callSessionRef.current = callSession;
  remoteUserRef.current = remoteUser;

  // End a session using explicit data.  Timers must not rely on React state
  // captured before setCallSession() has completed.
  const endSession = useCallback(async (session: CallSession, targetUserId: string | null) => {
    try {
      // A group call has no destructive hang-up button. Every participant,
      // including the original host, only leaves their own seat; the server
      // keeps the room alive while at least one member remains connected.
      if (session.channelType === 'GROUP') {
        callWebSocketService.sendSignal(session.callSessionId, null, 'LEAVE');
        await callService.leaveCall(session.callSessionId);
        return;
      }

      if (session.hostUserId === user?.id) {
        callWebSocketService.sendSignal(session.callSessionId, targetUserId, 'END_CALL');
        await callService.endCall(session.callSessionId).catch(() => callService.leaveCall(session.callSessionId));
      } else {
        callWebSocketService.sendSignal(session.callSessionId, targetUserId, 'LEAVE');
        await callService.leaveCall(session.callSessionId);
      }
    } catch (error) {
      console.warn('[CallContext] Failed to close call session:', error);
    }
  }, [user?.id]);

  // A previous browser crash/refresh can leave an ACTIVE row on the server.
  // When this user deliberately starts a different call, release that stale
  // membership once and retry instead of exposing the raw backend error.
  const initiateWithRecovery = useCallback(async (request: Parameters<typeof callService.initiateCall>[0]) => {
    try {
      return await callService.initiateCall(request);
    } catch (error: any) {
      const message = String(error?.response?.data?.message || error?.message || '');
      if (!message.toLowerCase().includes('already in an active call')) {
        throw error;
      }

      const previousCall = await callService.getActiveCall();
      if (!previousCall) throw error;

      const otherUserIds = previousCall.participants
        .filter((participant) => participant.userId !== user?.id)
        .map((participant) => participant.userId);
      otherUserIds.forEach((userId) => {
        callWebSocketService.sendSignal(previousCall.callSessionId, userId, 'END_CALL');
      });

      if (previousCall.hostUserId === user?.id) {
        await callService.endCall(previousCall.callSessionId);
      } else {
        await callService.leaveCall(previousCall.callSessionId);
      }

      toast.showInfo('Đã đóng phiên gọi cũ chưa kết thúc. Đang thực hiện cuộc gọi mới...');
      return callService.initiateCall(request);
    }
  }, [toast, user?.id]);

  // Cleanup all streams, peer connection, audio and timers
  const cleanupCall = useCallback(() => {
    callAudio.stopAll();

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (originalCamTrackRef.current) {
      originalCamTrackRef.current.stop();
      originalCamTrackRef.current = null;
    }

    peerConnectionsRef.current.forEach((connection) => {
      try {
        connection.close();
      } catch {}
    });
    peerConnectionsRef.current.clear();
    pcRef.current = null;
    remoteAudioRef.current.forEach((audio) => {
      audio.pause();
      audio.srcObject = null;
    });
    remoteAudioRef.current.clear();

    pendingCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setRemoteVideoMuted(false);
    setRemoteParticipants({});
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsScreenSharing(false);
    setCallDuration(0);
  }, []);

  // Connect to Call WebSocket on auth
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      callWebSocketService.disconnect();
      return;
    }

    callWebSocketService.connect(user.id);
  }, [isAuthenticated, user?.id]);

  // WebSocket messages are not durable.  If the receiver reconnects while a
  // call is still ringing, recover that invitation from the API and show the
  // same incoming-call UI instead of silently leaving them unable to answer.
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    let cancelled = false;
    const recoverIncomingCall = async () => {
      await callWebSocketService.connect(user.id);
      const activeCall = await callService.getActiveCall();
      const myParticipant = activeCall?.participants?.find((participant) => participant.userId === user.id);

      if (cancelled || callSessionRef.current || !activeCall || activeCall.hostUserId === user.id
        || !myParticipant || !['INVITED', 'RINGING'].includes(myParticipant.status)) {
        return;
      }

      const caller: CallUserInfo = { id: activeCall.hostUserId, name: 'Cuộc gọi đến...', avatar: '' };
      setMediaType(activeCall.mediaType);
      callSessionRef.current = activeCall;
      remoteUserRef.current = caller;
      setCallSession(activeCall);
      setRemoteUser(caller);
      setCallState('incoming');
      callWebSocketService.subscribeCallRoom(activeCall.callSessionId);
      callAudio.startIncomingRingtone();

      const elapsed = activeCall.startedAt ? Date.now() - new Date(activeCall.startedAt).getTime() : 0;
      const remaining = Math.max(0, 35000 - elapsed);
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = setTimeout(() => {
        if (callSessionRef.current?.callSessionId === activeCall.callSessionId) {
          callAudio.stopAll();
          callWebSocketService.sendSignal(activeCall.callSessionId, activeCall.hostUserId, 'REJECT');
          callService.rejectCall(activeCall.callSessionId).catch(() => {});
          setCallState('idle');
          setCallSession(null);
          setRemoteUser(null);
          toast.showInfo('Bạn đã bỏ lỡ cuộc gọi');
        }
      }, remaining);

      userService.getUserProfile(activeCall.hostUserId).then((profile) => {
        if (cancelled || !profile) return;
        const name = profile.displayName || [profile.firstName, profile.middleName, profile.lastName]
          .filter(Boolean).join(' ').trim() || profile.fullName || profile.username || 'Người dùng';
        setRemoteUser({ id: activeCall.hostUserId, name, avatar: profile.avatarUrl || profile.avatar || '' });
      }).catch(() => {});
    };

    // A browser can receive the REST invitation before its STOMP subscription
    // is ready (especially right after F5/token refresh). Keep a lightweight
    // fallback poll while idle so an incoming call always gets an answer UI.
    const recoveryTimer = setTimeout(recoverIncomingCall, 700);
    const recoveryInterval = setInterval(recoverIncomingCall, 2500);
    return () => {
      cancelled = true;
      clearTimeout(recoveryTimer);
      clearInterval(recoveryInterval);
    };
  }, [isAuthenticated, toast, user?.id]);

  // Create or retrieve local media stream
  const acquireMediaStream = async (type: MediaType): Promise<MediaStream> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'VIDEO' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      if (type === 'VIDEO') {
        const vTrack = stream.getVideoTracks()[0];
        if (vTrack) originalCamTrackRef.current = vTrack;
      }
      return stream;
    } catch (err: any) {
      console.warn('[CallContext] Camera/Mic access denied or unavailable, trying audio-only:', err);
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        if (type === 'VIDEO') {
          // Do not leave the interface showing an enabled camera when the
          // browser only granted microphone access.
          setIsVideoMuted(true);
          toast.showWarning('Không truy cập được camera. Bạn đã vào cuộc gọi bằng âm thanh; bấm nút camera để cấp quyền và bật lại.');
        }
        return audioStream;
      } catch (audioErr) {
        console.error('[CallContext] Microphone access also failed:', audioErr);
        throw audioErr;
      }
    }
  };

  // Create RTCPeerConnection with track routing and ICE gathering
  const createPeerConnection = (sessionId: string, targetUserId: string): RTCPeerConnection => {
    const existing = peerConnectionsRef.current.get(targetUserId);
    if (existing) return existing;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current.set(targetUserId, pc);
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        callWebSocketService.sendSignal(sessionId, targetUserId, 'ICE_CANDIDATE', {
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('[CallContext] Received remote track:', event.track.kind);
      const stream = event.streams?.[0] || new MediaStream([event.track]);
      // Only one remote video is featured in the existing modal, but every
      // participant's audio must play during a group call.
      let audio = remoteAudioRef.current.get(targetUserId);
      if (!audio) {
        audio = new Audio();
        audio.autoplay = true;
        remoteAudioRef.current.set(targetUserId, audio);
      }
      if (audio.srcObject !== stream) {
        audio.srcObject = stream;
        audio.play().catch(() => {});
      }
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const stream = new MediaStream([event.track]);
        setRemoteStream(stream);
      }
      setRemoteParticipants((previous) => ({
        ...previous,
        [targetUserId]: {
          id: targetUserId,
          name: previous[targetUserId]?.name || 'Thành viên',
          avatar: previous[targetUserId]?.avatar || '',
          stream,
          videoMuted: previous[targetUserId]?.videoMuted || false,
        },
      }));
      userService.getUserProfile(targetUserId).then((profile) => {
        const name = profile?.displayName || profile?.fullName ||
          [profile?.lastName, profile?.middleName, profile?.firstName].filter(Boolean).join(' ') ||
          profile?.username || 'Thành viên';
        setRemoteParticipants((previous) => previous[targetUserId]
          ? { ...previous, [targetUserId]: { ...previous[targetUserId], name, avatar: profile?.avatarUrl || profile?.avatar || '' } }
          : previous);
      }).catch(() => {});
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[CallContext] ICE State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        // Peer disconnected
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  };

  // Process queued ICE candidates after remote description is set
  const processPendingIceCandidates = async (pc: RTCPeerConnection) => {
    while (pendingCandidatesRef.current.length > 0) {
      const cand = pendingCandidatesRef.current.shift();
      if (cand) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.error('[CallContext] Error adding queued ICE candidate:', e);
        }
      }
    }
  };

  // Listen to WebRTC signals
  useEffect(() => {
    const unsub = callWebSocketService.onSignal(async (signal: WebRtcSignal) => {
      console.log('[CallContext] Received WebRTC Signal:', signal.signalType, signal);

      switch (signal.signalType) {
        case 'INCOMING_CALL': {
          console.log('[CallContext] >>> INCOMING CALL DETECTED from', signal.senderId, signal);
          // If already in a call, reject automatically
          if (callSessionRef.current) {
            // Queue + fallback topic may deliver the same invitation twice.
            // It is not a second caller and must never reject the real call.
            if (callSessionRef.current.callSessionId === signal.callSessionId) {
              return;
            }
            callWebSocketService.sendSignal(signal.callSessionId, signal.senderId || null, 'REJECT');
            return;
          }

          const callType = signal.mediaType || 'VIDEO';
          const incomingSession: CallSession = {
            callSessionId: signal.callSessionId,
            channelType: signal.channelType || 'DIRECT',
            mediaType: callType,
            hostUserId: signal.senderId || '',
            status: 'INITIATED',
            participants: [],
          };
          setMediaType(callType);
          callSessionRef.current = incomingSession;
          setCallSession(incomingSession);

          // Pre-subscribe to the call room
          callWebSocketService.subscribeCallRoom(signal.callSessionId);

          // Initial caller placeholder info for instant UI render
          const initialCaller: CallUserInfo = {
            id: signal.senderId || '',
            name: 'Cuộc gọi đến...',
            avatar: '',
          };

          // 1. Instantly pop up the modal and ringtone (Zero delay)
          remoteUserRef.current = initialCaller;
          setRemoteUser(initialCaller);
          setCallState('incoming');
          callAudio.startIncomingRingtone();

          // 2. Fetch full caller profile in background and update UI
          if (signal.senderId) {
            userService.getUserProfile(signal.senderId).then((res) => {
              if (res) {
                const fullName = res.displayName ||
                  [res.firstName, res.middleName, res.lastName].filter(Boolean).join(' ').trim() ||
                  res.fullName ||
                  res.username ||
                  'Người dùng';
                const avatar = res.avatarUrl || res.avatar || '';
                setRemoteUser((prev) => ({
                  id: signal.senderId!,
                  name: fullName,
                  avatar: avatar || prev?.avatar || '',
                }));

                // 3. Desktop Notification (Like Facebook)
                if ('Notification' in window && Notification.permission === 'granted') {
                  try {
                    new Notification('Cuộc gọi đến từ ' + fullName, {
                      body: callType === 'VIDEO' ? 'Cuộc gọi video đến' : 'Cuộc gọi thoại đến',
                      icon: avatar || '/favicon.ico',
                    });
                  } catch {}
                }
              }
            }).catch((err) => {
              console.warn('[CallContext] Error fetching caller profile:', err);
            });
          }

          // Auto-timeout after 35s if unanswered
          if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
          timeoutTimerRef.current = setTimeout(() => {
            if (callSessionRef.current?.callSessionId === signal.callSessionId) {
              callAudio.stopAll();
              const activeSession = callSessionRef.current;
              const callerId = remoteUserRef.current?.id || signal.senderId || null;
              if (activeSession) {
                callWebSocketService.sendSignal(activeSession.callSessionId, callerId, 'REJECT');
                callService.rejectCall(activeSession.callSessionId).catch(() => {});
              }
              setCallState('idle');
              setCallSession(null);
              setRemoteUser(null);
              toast.showInfo('Bạn đã bỏ lỡ cuộc gọi');
            }
          }, 35000);
          break;
        }

        case 'ACCEPT': {
          if (signal.senderId === user?.id) break;
          // Caller receives ACCEPT from Callee
          callAudio.stopAll();
          if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

          setCallState('connected');
          startDurationTimer();

          // Caller creates WebRTC Offer
          const sessionId = signal.callSessionId || callSessionRef.current?.callSessionId;
          const targetId = signal.senderId || remoteUserRef.current?.id;
          if (!sessionId || !targetId) return;

          try {
            const pc = createPeerConnection(sessionId, targetId);
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: mediaType === 'VIDEO',
            });
            await pc.setLocalDescription(offer);

            callWebSocketService.sendSignal(sessionId, targetId, 'OFFER', {
              sdp: offer,
            });
          } catch (err) {
            console.error('[CallContext] Error creating WebRTC Offer:', err);
            toast.showError('Lỗi thiết lập cuộc gọi WebRTC');
          }
          break;
        }

        case 'OFFER': {
          // Callee receives OFFER from Caller
          const sessionId = signal.callSessionId || callSessionRef.current?.callSessionId;
          const targetId = signal.senderId || remoteUserRef.current?.id;
          if (!sessionId || !targetId || !signal.sdp) return;

          try {
            let pc = peerConnectionsRef.current.get(targetId);
            if (!pc) {
              pc = createPeerConnection(sessionId, targetId);
            }

            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            await processPendingIceCandidates(pc);

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            callWebSocketService.sendSignal(sessionId, targetId, 'ANSWER', {
              sdp: answer,
            });
          } catch (err) {
            console.error('[CallContext] Error handling WebRTC Offer:', err);
          }
          break;
        }

        case 'ANSWER': {
          // Caller receives ANSWER from Callee
          const peer = signal.senderId ? peerConnectionsRef.current.get(signal.senderId) : pcRef.current;
          if (peer && signal.sdp) {
            try {
              await peer.setRemoteDescription(new RTCSessionDescription(signal.sdp));
              await processPendingIceCandidates(peer);
            } catch (err) {
              console.error('[CallContext] Error handling WebRTC Answer:', err);
            }
          }
          break;
        }

        case 'ICE_CANDIDATE': {
          if (signal.candidate) {
            const peer = signal.senderId ? peerConnectionsRef.current.get(signal.senderId) : pcRef.current;
            if (peer && peer.remoteDescription) {
              try {
                await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
              } catch (e) {
                console.error('[CallContext] Error adding ICE candidate:', e);
              }
            } else {
              pendingCandidatesRef.current.push(signal.candidate);
            }
          }
          break;
        }

        case 'REJECT': {
          if (callSessionRef.current?.callSessionId !== signal.callSessionId) return;
          // A decline in a group must only remove that participant.  Ending
          // the shared session here would disconnect everyone else who is
          // still ringing or already connected.
          if (callSessionRef.current.channelType === 'GROUP') {
            toast.showInfo('Một thành viên đã từ chối cuộc gọi');
            break;
          }
          callAudio.playCallEndedTone();
          toast.showInfo('Người dùng đã từ chối cuộc gọi');
          cleanupCall();
          callSessionRef.current = null;
          remoteUserRef.current = null;
          setCallState('idle');
          setCallSession(null);
          setRemoteUser(null);
          break;
        }

        case 'LEAVE':
        case 'END_CALL': {
          if (callSessionRef.current?.callSessionId !== signal.callSessionId) return;
          if (signal.signalType === 'LEAVE' && callSessionRef.current.channelType === 'GROUP') {
            const peer = signal.senderId ? peerConnectionsRef.current.get(signal.senderId) : null;
            if (peer) {
              try { peer.close(); } catch {}
              peerConnectionsRef.current.delete(signal.senderId!);
              setRemoteParticipants((previous) => {
                const next = { ...previous };
                delete next[signal.senderId!];
                return next;
              });
            }
            toast.showInfo('Một thành viên đã rời cuộc gọi');
            break;
          }
          callAudio.playCallEndedTone();
          toast.showInfo('Cuộc gọi đã kết thúc');
          cleanupCall();
          callSessionRef.current = null;
          remoteUserRef.current = null;
          setCallState('idle');
          setCallSession(null);
          setRemoteUser(null);
          break;
        }

        case 'TOGGLE_AUDIO': {
          // Remote peer toggled audio
          break;
        }

        case 'TOGGLE_VIDEO': {
          if (!signal.senderId || signal.senderId === user?.id) break;
          const muted = Boolean(signal.videoMuted);
          setRemoteVideoMuted(muted);
          setRemoteParticipants((previous) => previous[signal.senderId!]
            ? { ...previous, [signal.senderId!]: { ...previous[signal.senderId!], videoMuted: muted } }
            : previous);
          break;
        }
      }
    });

    return () => {
      unsub();
    };
  }, [cleanupCall, mediaType, toast, user?.id]);

  const startDurationTimer = () => {
    if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    setCallDuration(0);
    durationTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  // REST fallback for an ACCEPT signal that is lost while the caller's STOMP
  // connection reconnects. The join endpoint is authoritative, so never keep
  // ringing once any invited participant has actually joined the session.
  useEffect(() => {
    if (callState !== 'calling' || !callSession || !user?.id) return;

    let disposed = false;
    const syncAcceptedParticipant = async () => {
      const active = await callService.getActiveCall();
      if (disposed || !active || active.callSessionId !== callSession.callSessionId) return;
      const someoneConnected = active.participants.some(
        (participant) => participant.userId !== user.id && participant.status === 'CONNECTED'
      );
      if (!someoneConnected) return;

      callAudio.stopAll();
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      setCallSession(active);
      callSessionRef.current = active;
      setCallState('connected');
      startDurationTimer();
    };

    syncAcceptedParticipant();
    const interval = setInterval(syncAcceptedParticipant, 1200);
    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, [callSession, callState, user?.id]);

  // Start outgoing call
  const startCall = async (targetUser: CallUserInfo, type: MediaType, conversationId?: string) => {
    if (callState !== 'idle') {
      toast.showWarning('Bạn đang trong một cuộc gọi');
      return;
    }

    try {
      setMediaType(type);
      setRemoteUser(targetUser);
      setCallState('calling');
      setIsMinimized(false);

      // A connected/subscribed socket is required so signaling is ready on
      // this client before a call session is created.
      const socketReady = await callWebSocketService.connect(user?.id);
      if (!socketReady) {
        throw new Error('Không thể kết nối máy chủ cuộc gọi');
      }

      // 1. Acquire media stream (mic/camera)
      await acquireMediaStream(type);

      // 2. Play ringback tone
      callAudio.startRingbackTone();

      // 3. Call REST API to initiate session
      const session = await initiateWithRecovery({
        channelType: 'DIRECT',
        mediaType: type,
        conversationId: conversationId || undefined,
        targetUserIds: [targetUser.id],
      });

      callSessionRef.current = session;
      setCallSession(session);
      callWebSocketService.subscribeCallRoom(session.callSessionId);

      // 4. Timeout after 35 seconds if no response
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = setTimeout(() => {
        if (callSessionRef.current?.callSessionId === session.callSessionId) {
          callAudio.playCallEndedTone();
          toast.showInfo('Người dùng không trả lời');
          endSession(session, targetUser.id).finally(() => {
            cleanupCall();
            setCallState('idle');
            setCallSession(null);
            setRemoteUser(null);
          });
        }
      }, 35000);
    } catch (err: any) {
      console.error('[CallContext] Error starting call:', err);
      cleanupCall();
      setCallState('idle');
      setCallSession(null);
      setRemoteUser(null);
      toast.showError('Không thể bắt đầu cuộc gọi: ' + (err.response?.data?.message || err.message || 'Lỗi thiết bị'));
    }
  };

  // Start a Facebook-style group call. The backend creates one shared session
  // and sends an incoming-call signal to every other group member; each member
  // that accepts receives a separate WebRTC connection in the same session.
  const startGroupCall = async (groupName: string, memberIds: string[], type: MediaType, conversationId: string) => {
    if (callState !== 'idle') {
      toast.showWarning('Bạn đang trong một cuộc gọi');
      return;
    }

    const targets = [...new Set(memberIds.map(String))].filter((id) => id && id !== String(user?.id));
    if (targets.length === 0) {
      toast.showWarning('Nhóm cần có ít nhất một thành viên khác để gọi');
      return;
    }

    try {
      setMediaType(type);
      setRemoteUser({ id: `group:${conversationId}`, name: groupName, avatar: '' });
      setCallState('calling');
      setIsMinimized(false);

      const socketReady = await callWebSocketService.connect(user?.id);
      if (!socketReady) throw new Error('Không thể kết nối máy chủ cuộc gọi');

      await acquireMediaStream(type);
      callAudio.startRingbackTone();

      const session = await initiateWithRecovery({
        channelType: 'GROUP',
        mediaType: type,
        conversationId,
        targetUserIds: targets,
      });

      callSessionRef.current = session;
      setCallSession(session);
      callWebSocketService.subscribeCallRoom(session.callSessionId);

      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = setTimeout(() => {
        if (callSessionRef.current?.callSessionId === session.callSessionId) {
          callAudio.playCallEndedTone();
          toast.showInfo('Chưa có thành viên nào trả lời cuộc gọi');
          endSession(session, null).finally(() => {
            cleanupCall();
            setCallState('idle');
            setCallSession(null);
            setRemoteUser(null);
          });
        }
      }, 35000);
    } catch (err: any) {
      console.error('[CallContext] Error starting group call:', err);
      cleanupCall();
      setCallState('idle');
      setCallSession(null);
      setRemoteUser(null);
      toast.showError('Không thể bắt đầu cuộc gọi nhóm: ' + (err.response?.data?.message || err.message || 'Lỗi thiết bị'));
    }
  };

  // Callee accepts incoming call
  const acceptCall = async () => {
    if (!callSession || !remoteUser) return;
    callAudio.stopAll();
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

    try {
      setCallState('connected');
      setIsMinimized(false);

      // 1. Acquire media stream
      await acquireMediaStream(mediaType);

      // 2. Call backend join API
      await callService.joinCall(callSession.callSessionId);
      callWebSocketService.subscribeCallRoom(callSession.callSessionId);

      // 3. Create peer connection
      createPeerConnection(callSession.callSessionId, remoteUser.id);

      // 4. Send ACCEPT signal to Caller
      callWebSocketService.sendSignal(callSession.callSessionId, remoteUser.id, 'ACCEPT');

      // 5. Start timer
      startDurationTimer();
    } catch (err: any) {
      console.error('[CallContext] Error accepting call:', err);
      cleanupCall();
      setCallState('idle');
      toast.showError('Không thể kết nối cuộc gọi');
    }
  };

  // Callee rejects incoming call
  const rejectCall = async () => {
    if (!callSession) return;
    callAudio.stopAll();
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);

    const sessionId = callSession.callSessionId;
    const targetId = remoteUser?.id || null;

    try {
      callWebSocketService.sendSignal(sessionId, targetId, 'REJECT');
      await callService.rejectCall(sessionId);
    } catch {}

    cleanupCall();
    setCallState('idle');
    setCallSession(null);
    setRemoteUser(null);
  };

  // End active call
  const endCall = async () => {
    callAudio.playCallEndedTone();
    const sessionId = callSession?.callSessionId;
    const targetId = remoteUser?.id || null;

    if (sessionId && callSession) {
      await endSession(callSession, targetId);
    }

    setCallState('ended');
    setTimeout(() => {
      cleanupCall();
      setCallState('idle');
      setCallSession(null);
      setRemoteUser(null);
    }, 1200);
  };

  // Toggle Microphone
  const toggleAudio = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const muted = !audioTrack.enabled;
      setIsAudioMuted(muted);

      if (callSession) {
        callService.toggleMedia(callSession.callSessionId, muted, isVideoMuted).catch(() => {});
        callWebSocketService.sendSignal(callSession.callSessionId, callSession.channelType === 'GROUP' ? null : remoteUser?.id || null, 'TOGGLE_AUDIO', {
          audioMuted: muted,
        });
      }
    }
  };

  // Toggle Camera
  const toggleVideo = async () => {
    if (!localStreamRef.current) return;
    let videoTrack = localStreamRef.current.getVideoTracks()[0];
    // If answering initially fell back to audio-only (camera was busy or the
    // permission prompt was delayed), let the camera button recover without
    // forcing the user to leave and redial.
    if (!videoTrack) {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        videoTrack = cameraStream.getVideoTracks()[0];
        if (!videoTrack) throw new Error('Không tìm thấy camera');

        localStreamRef.current.addTrack(videoTrack);
        originalCamTrackRef.current = videoTrack;
        await Promise.all([...peerConnectionsRef.current.values()].map(async (peer) => {
          const sender = peer.getSenders().find((item) => item.track?.kind === 'video');
          if (sender) await sender.replaceTrack(videoTrack!);
          else peer.addTrack(videoTrack!, localStreamRef.current!);
        }));
        setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        setIsVideoMuted(false);
        if (callSession) {
          callService.toggleMedia(callSession.callSessionId, isAudioMuted, false).catch(() => {});
          callWebSocketService.sendSignal(callSession.callSessionId, callSession.channelType === 'GROUP' ? null : remoteUser?.id || null, 'TOGGLE_VIDEO', { videoMuted: false });
        }
        return;
      } catch (error) {
        console.warn('[CallContext] Could not enable camera:', error);
        toast.showError('Không thể bật camera. Hãy kiểm tra quyền Camera hoặc đóng ứng dụng đang dùng camera.');
        return;
      }
    }
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const muted = !videoTrack.enabled;
      setIsVideoMuted(muted);

      if (callSession) {
        callService.toggleMedia(callSession.callSessionId, isAudioMuted, muted).catch(() => {});
        callWebSocketService.sendSignal(callSession.callSessionId, callSession.channelType === 'GROUP' ? null : remoteUser?.id || null, 'TOGGLE_VIDEO', {
          videoMuted: muted,
        });
      }
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (peerConnectionsRef.current.size === 0) return;

    if (isScreenSharing) {
      // Revert to original camera track
      if (originalCamTrackRef.current) {
        await Promise.all([...peerConnectionsRef.current.values()].map(async (peer) => {
          const videoSender = peer.getSenders().find((sender) => sender.track?.kind === 'video');
          if (videoSender) await videoSender.replaceTrack(originalCamTrackRef.current);
        }));

        // Replace track in localStream
        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldTrack) {
            localStreamRef.current.removeTrack(oldTrack);
            oldTrack.stop();
          }
          localStreamRef.current.addTrack(originalCamTrackRef.current);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }
      }
      setIsScreenSharing(false);
      toast.showInfo('Đã dừng chia sẻ màn hình');
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const screenTrack = displayStream.getVideoTracks()[0];

        if (!screenTrack) return;

        await Promise.all([...peerConnectionsRef.current.values()].map(async (peer) => {
          const videoSender = peer.getSenders().find((sender) => sender.track?.kind === 'video');
          if (videoSender) await videoSender.replaceTrack(screenTrack);
        }));

        // Handle native "Stop Sharing" bar from browser
        screenTrack.onended = async () => {
          if (originalCamTrackRef.current) {
            await Promise.all([...peerConnectionsRef.current.values()].map(async (peer) => {
              const videoSender = peer.getSenders().find((sender) => sender.track?.kind === 'video');
              if (videoSender) await videoSender.replaceTrack(originalCamTrackRef.current);
            }));
          }
          setIsScreenSharing(false);
        };

        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getVideoTracks()[0];
          if (oldTrack) {
            localStreamRef.current.removeTrack(oldTrack);
          }
          localStreamRef.current.addTrack(screenTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }

        setIsScreenSharing(true);
        toast.showSuccess('Đang chia sẻ màn hình');
      } catch (err) {
        console.warn('[CallContext] Screen share cancelled or rejected:', err);
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        callSession,
        remoteUser,
        mediaType,
        localStream,
        remoteStream,
        remoteVideoMuted,
        remoteParticipants,
        isAudioMuted,
        isVideoMuted,
        isScreenSharing,
        callDuration,
        isMinimized,
        isCallHistoryOpen,
        startCall,
        startGroupCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        setIsMinimized,
        setIsCallHistoryOpen,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
