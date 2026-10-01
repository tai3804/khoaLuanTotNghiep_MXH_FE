import { api } from './axiosClient';

export interface CreateReportRequest {
  targetId: string;
  targetType: 'POST' | 'COMMENT' | 'USER';
  reason: string;
  description: string;
}

export const reportService = {
  createReport: async (data: CreateReportRequest) => {
    const response = await api.post('/moderation/reports', data);
    return response.data;
  },
};
