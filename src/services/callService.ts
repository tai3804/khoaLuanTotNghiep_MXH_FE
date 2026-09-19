import { api } from './axiosClient';

export type ChannelType = 'DIRECT' | 'GROUP';
export type MediaType = 'AUDIO' | 'VIDEO';
export type CallStatus = 'INITIATED' | 'ACTIVE' | 'ENDED' | 'MISSED' | 'REJECTED';
export type ParticipantRole = 'HOST' | 'PARTICIPANT';
export type ParticipantStatus = 'INVITED' | 'RINGING' | 'CONNECTED' | 'DECLINED' | 'LEFT' | 'BUSY';

export interface CallParticipant {
  userId: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  audioMuted: boolean;
  videoMuted: boolean;
}

export interface CallSession {
  callSessionId: string;
  channelType: ChannelType;
  mediaType: MediaType;
  conversationId?: string | null;
  hostUserId: string;
  status: CallStatus;
  startedAt?: string;
  participants: CallParticipant[];
}

export interface CallHistoryItem {
  callSessionId: string;
  channelType: ChannelType;
  mediaType: MediaType;
  conversationId?: string | null;
  hostUserId: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  durationInSeconds: number;
  myRole: ParticipantRole;
  myStatus: ParticipantStatus;
  participantUserIds?: string[];
}

export interface InitiateCallRequest {
  channelType: ChannelType;
  mediaType: MediaType;
  conversationId?: string;
  targetUserIds: string[];
}

export interface WebRtcSignal {
  callSessionId: string;
  senderId?: string;
  targetUserId?: string;
  signalType:
    | 'INCOMING_CALL'
    | 'OFFER'
    | 'ANSWER'
    | 'ICE_CANDIDATE'
    | 'RINGING'
    | 'ACCEPT'
    | 'REJECT'
    | 'LEAVE'
    | 'END_CALL'
    | 'TOGGLE_AUDIO'
    | 'TOGGLE_VIDEO';
  mediaType?: MediaType;
  sdp?: any;
  candidate?: any;
  audioMuted?: boolean;
  videoMuted?: boolean;
  timestamp?: string;
}

export const callService = {
  // Initiate a new 1-1 or group call
  async initiateCall(request: InitiateCallRequest): Promise<CallSession> {
    const response = await api.post('/calls/initiate', request);
    return response.data?.data || response.data;
  },

  // Join an ongoing call session
  async joinCall(callSessionId: string): Promise<CallSession> {
    const response = await api.post(`/calls/${callSessionId}/join`);
    return response.data?.data || response.data;
  },

  // Reject / decline an incoming call
  async rejectCall(callSessionId: string): Promise<void> {
    await api.post(`/calls/${callSessionId}/reject`);
  },

  // Leave active call session
  async leaveCall(callSessionId: string): Promise<void> {
    await api.post(`/calls/${callSessionId}/leave`);
  },

  // End call for all (host only)
  async endCall(callSessionId: string): Promise<void> {
    await api.post(`/calls/${callSessionId}/end`);
  },

  // Toggle mic/camera status on server
  async toggleMedia(callSessionId: string, audioMuted?: boolean, videoMuted?: boolean): Promise<void> {
    await api.put(`/calls/${callSessionId}/media`, { audioMuted, videoMuted });
  },

  // Get current active call session of current user
  async getActiveCall(): Promise<CallSession | null> {
    try {
      const response = await api.get('/calls/active');
      return response.data?.data || response.data;
    } catch {
      return null;
    }
  },

  // Get call history with pagination
  async getCallHistory(page: number = 1, size: number = 20): Promise<{ content: CallHistoryItem[]; totalElements: number; totalPages: number }> {
    const response = await api.get('/calls/history', { params: { page, size } });
    const data = response.data?.data || response.data;
    return {
      content: data?.content || (Array.isArray(data) ? data : []),
      totalElements: data?.totalElements ?? (Array.isArray(data) ? data.length : 0),
      totalPages: data?.totalPages ?? 1,
    };
  },
};
