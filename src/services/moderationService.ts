import { api } from './axiosClient';

export type ModerationAction =
  | 'HIDE_POST'
  | 'DELETE_POST'
  | 'DELETE_COMMENT'
  | 'WARN_USER'
  | 'BAN_USER'
  | 'DISMISS'
  | 'RESTORE_POST'
  | 'APPEAL_ACCEPTED'
  | 'APPEAL_REJECTED';

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
  /** 'AI' khi báo cáo do AI tự động gắn cờ; 'USER' hoặc không có khi do người dùng báo cáo. */
  source?: 'USER' | 'AI';
  aiScore?: number;
  aiCategory?: string;
  aiSeverity?: string;
  aiReason?: string;
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

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface GetReportsParams {
  page?: number;
  size?: number;
  status?: ModerationReport['status'];
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

export interface GetLogsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}

const parsePagedPayload = <T>(payload: any, reqPage: number, reqSize: number): PagedResponse<T> => {
  const rawData =
    (Array.isArray(payload?.data) ? payload.data : null) ||
    payload?.data?.content ||
    payload?.content ||
    (Array.isArray(payload) ? payload : []);
  const items: T[] = Array.isArray(rawData) ? rawData : [];

  const totalElements =
    typeof payload?.totalElements === 'number'
      ? payload.totalElements
      : typeof payload?.data?.totalElements === 'number'
        ? payload.data.totalElements
        : items.length;

  const totalPages =
    typeof payload?.totalPages === 'number'
      ? payload.totalPages
      : typeof payload?.data?.totalPages === 'number'
        ? payload.data.totalPages
        : Math.max(1, Math.ceil(totalElements / reqSize));

  const page =
    typeof payload?.page === 'number'
      ? payload.page
      : typeof payload?.data?.page === 'number'
        ? payload.data.page
        : reqPage;

  const size =
    typeof payload?.size === 'number'
      ? payload.size
      : typeof payload?.data?.size === 'number'
        ? payload.data.size
        : reqSize;

  const last =
    typeof payload?.last === 'boolean'
      ? payload.last
      : typeof payload?.data?.last === 'boolean'
        ? payload.data.last
        : page >= totalPages;

  return { items, page, size, totalElements, totalPages, last };
};

export const moderationService = {
  getReports: async (params?: GetReportsParams | ModerationReport['status']): Promise<PagedResponse<ModerationReport>> => {
    let page = 1;
    let size = 10;
    let sortBy = 'createdAt';
    let sortDirection: 'ASC' | 'DESC' = 'DESC';
    let status: ModerationReport['status'] | undefined;

    if (typeof params === 'string') {
      status = params;
    } else if (params) {
      if (params.page !== undefined) page = params.page;
      if (params.size !== undefined) size = params.size;
      if (params.sortBy !== undefined) sortBy = params.sortBy;
      if (params.sortDirection !== undefined) sortDirection = params.sortDirection;
      if (params.status !== undefined) status = params.status;
    }

    const queryParams: any = {
      page,
      size,
      sortBy,
      sortDirection,
      ...(status ? { 'filters[status]': status } : {}),
    };

    const response = await api.get('/moderation/reports', { params: queryParams });
    return parsePagedPayload<ModerationReport>(response.data, page, size);
  },

  processReport: async (reportId: string, action: ModerationAction, note?: string) => {
    await api.post(`/moderation/reports/${reportId}/process`, { action, note });
  },

  getLogs: async (params?: GetLogsParams): Promise<PagedResponse<ModerationLog>> => {
    const page = params?.page ?? 1;
    const size = params?.size ?? 10;
    const sortBy = params?.sortBy ?? 'createdAt';
    const sortDirection = params?.sortDirection ?? 'DESC';

    const response = await api.get('/moderation/logs', {
      params: { page, size, sortBy, sortDirection },
    });
    return parsePagedPayload<ModerationLog>(response.data, page, size);
  },
};
