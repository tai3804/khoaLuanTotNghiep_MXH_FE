import { api } from './axiosClient';

export interface CreateReportRequest {
  targetId: string;
  targetType: 'POST' | 'COMMENT' | 'USER';
  reason: string;
  description: string;
}

export interface SubmittedReport extends CreateReportRequest {
  reportId: string;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedAt?: string;
  appealMessage?: string;
  appealedAt?: string;
}

const contentOf = (payload: any) => payload?.data?.content || payload?.data || payload?.content || [];

export const reportService = {
  createReport: async (data: CreateReportRequest) => {
    const response = await api.post('/moderation/reports', data);
    return response.data;
  },
  getMyReports: async (): Promise<SubmittedReport[]> => {
    const response = await api.get('/moderation/reports/mine');
    const reports = contentOf(response.data);
    return Array.isArray(reports) ? reports : [];
  },
  appeal: async (reportId: string, message: string) => {
    const response = await api.post(`/moderation/reports/${reportId}/appeal`, { message });
    return response.data;
  },
};
