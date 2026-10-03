import { api } from './axiosClient';

export type ModerationAction = 'HIDE_POST' | 'DELETE_POST' | 'DELETE_COMMENT' | 'WARN_USER' | 'BAN_USER' | 'DISMISS' | 'RESTORE_POST';

export interface ModerationReport {
  reportId: string;
  reporterId: string;
  targetType: 'POST' | 'COMMENT' | 'USER';
  targetId: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ModerationLog {
  logId: string;
  moderatorId: string;
  targetType: string;
  targetId: string;
  action: ModerationAction;
  reason?: string;
  note?: string;
  reportId?: string;
  createdAt: string;
}

const contentOf = (payload: any) => payload?.data?.content || payload?.data || payload?.content || [];

export const moderationService = {
  getReports: async (status?: ModerationReport['status']): Promise<ModerationReport[]> => {
    const response = await api.get('/moderation/reports', { params: { page: 1, size: 100, sortBy: 'createdAt', sortDirection: 'DESC', ...(status ? { 'filters[status]': status } : {}) } });
    const data = contentOf(response.data);
    return Array.isArray(data) ? data : [];
  },
  processReport: async (reportId: string, action: ModerationAction, note?: string) => {
    await api.post(`/moderation/reports/${reportId}/process`, { action, note });
  },
  getLogs: async (): Promise<ModerationLog[]> => {
    const response = await api.get('/moderation/logs', { params: { page: 1, size: 100, sortBy: 'createdAt', sortDirection: 'DESC' } });
    const data = contentOf(response.data);
    return Array.isArray(data) ? data : [];
  },
};
